import CacheManager from "@/common/kits/CacheManager";
import ChromeManager from "@/common/kits/ChromeManager";
import GlobalManager from "@/common/kits/GlobalManager";
import UtilsManager from "@/common/kits/UtilsManager";
import Api from "@/common/kits/api";
import { IUserInfoType } from "@/common/types/user";

/**
 * @description
 */
class UserManager {
  private static instance: UserManager | null = null;

  userInfo: IUserInfoType | null = null;

  static getInstance(): UserManager {
    if (!this.instance) {
      this.instance = new UserManager();
      this.instance.userInfo = null;
    }
    return this.instance;
  }

  // 生成随机字符串
  generateRandomString = (length: number) => {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let text = "";
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  // Base64URL 编码
  base64URLEncode = (str: ArrayBuffer) => {
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(str))))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  };

  // 生成 SHA256 哈希并转换为 base64url
  sha256 = async (plain: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    const hash = await window.crypto.subtle.digest("SHA-256", data);
    return this.base64URLEncode(hash);
  };

  // 生成 PKCE 验证器和挑战
  generatePKCE = async () => {
    const codeVerifier = this.generateRandomString(128);
    const codeChallenge = await this.sha256(codeVerifier);

    return {
      codeVerifier,
      codeChallenge,
      codeChallengeMethod: "S256",
    };
  };

  buildAuthorizationUrl = async (): Promise<{
    authorizationUrl: string;
    redirectUri: string;
    codeVerifier: string;
    oauthState: string;
  }> => {
    // 生成PKCE参数
    const pkce = await this.generatePKCE();
    // 生成state参数用于防CSRF
    const oauthState = this.generateRandomString(32);

    const redirect_uri = chrome.identity.getRedirectURL(); // GlobalManager.g_API_CONFIG.redirectUri,

    // 存储验证器和state
    // sessionStorage.setItem("codeVerifier", pkce.codeVerifier);
    // sessionStorage.setItem("oauthState", oauthState);

    // 构建授权URL并跳转
    const params: Record<string, string> = {
      client_id: GlobalManager.g_API_CONFIG.clientId,
      redirect_uri,
      response_type: GlobalManager.g_API_CONFIG.responseType,
      scope: GlobalManager.g_API_CONFIG.scope,
      code_challenge: pkce.codeChallenge,
      code_challenge_method: pkce.codeChallengeMethod,
    };

    if (oauthState) {
      params["state"] = oauthState;
    }

    const authorizationUrl = UtilsManager.router2url(`${GlobalManager.g_API_CONFIG.authServerUrl}/oauth2/authorize`, params); //"https://immersivetranslate.com/accounts/login?from=plugin";

    // console.log("buildAuthorizationUrl authorizationUrl", authorizationUrl);
    // console.log("buildAuthorizationUrl redirect_uri", chrome.identity.getRedirectURL());
    // console.log(
    //   "buildAuthorizationUrl redirectUri",
    //   UtilsManager.router2url(`${GlobalManager.g_API_CONFIG.authServerUrl}/oauth2/authorize`, params)
    // );

    return {
      authorizationUrl,
      redirectUri: redirect_uri,
      codeVerifier: pkce.codeVerifier,
      oauthState: oauthState,
    };
  };

  // 使用refresh token获取新的access token
  queryTokenByRefreshAccess = async (params: {
    refresh_token: string;
  }): Promise<{
    access_token: string;
    refresh_token: string;
    id_token: string;
  } | null> => {
    const { refresh_token } = params || {};
    const resToken = await this.queryToken({
      grant_type: "refresh_token",
      refresh_token,
    });

    return resToken;
  };

  //
  queryTokenByCode = async (params: {
    redirect_uri: string;
    code: string;
    code_verifier: string;
  }): Promise<{
    access_token: string;
    refresh_token: string;
    id_token: string;
  } | null> => {
    const { code, redirect_uri, code_verifier } = params || {};
    const resToken = await this.queryToken({
      grant_type: "authorization_code",
      redirect_uri,
      code,
      code_verifier,
    });

    return resToken;
  };

  queryToken = async (
    params:
      | {
          grant_type: string;
          refresh_token: string;
        }
      | {
          grant_type: string;
          redirect_uri: string;
          code: string;
          code_verifier: string;
        }
  ): Promise<{
    access_token: string;
    refresh_token: string;
    id_token: string;
  } | null> => {
    const body = {
      client_id: GlobalManager.g_API_CONFIG.clientId,
      ...params,
    };

    const resToken = await Api.Ginkgoo.authToken({
      body,
    });

    if (!!resToken) {
      await this.setTokens(resToken);
      await this.queryUserInfo();
      return resToken;
    }

    return null;
  };

  parseJWT = (token: string) => {
    if (!token) {
      return null;
    }
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url?.replace(/-/g, "+")?.replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.debug("[Debug] JWT parse error:", error);
      return null;
    }
  };

  isTokenExpired = (token: string) => {
    const payload = this.parseJWT(token);
    if (!payload || !payload.exp) {
      return true;
    }

    return Date.now() >= payload.exp * 1000;
  };

  getRefreshToken = async (): Promise<string> => {
    const res = await CacheManager.getSyncStorageChrome(["refresh_token"]);
    const refreshToken = res["refresh_token"] || "";

    return refreshToken;
  };

  getAccessToken = async (): Promise<string> => {
    const res = await CacheManager.getSyncStorageChrome(["access_token"]);
    const accessToken = res["access_token"] || "";

    return accessToken;
  };

  getTokens = async (): Promise<Record<string, string>> => {
    const res = await CacheManager.getSyncStorageChrome(["access_token", "refresh_token", "id_token"]);

    return res;
  };

  setTokens = async (tokens: Record<string, string>): Promise<void> => {
    const tokensReal = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      id_token: tokens.id_token,
    };
    const res = await CacheManager.setSyncStorageChrome(tokensReal);

    return res;
  };

  clearTokensAndUserInfo() {
    CacheManager.removeSyncStorageChrome(["access_token", "refresh_token", "id_token"]);
    this.userInfo = null;
  }

  queryUserInfo = async () => {
    const res = await Api.Ginkgoo.queryUserInfo();

    this.setUserInfo(res);
    return res;
  };

  getUserInfo = async (): Promise<IUserInfoType | null> => {
    return this.userInfo;
  };

  setUserInfo = async (userInfo: IUserInfoType | null): Promise<void> => {
    this.userInfo = userInfo;
  };

  setMemberInfo = async (params: Record<string, string>): Promise<void> => {
    const res = await CacheManager.setSyncStorageChrome({ memberInfo: params });
    return res;
  };

  isAuth = async () => {
    const { access_token } = await this.getTokens();

    return !!this.userInfo && !this.isTokenExpired(access_token);
  };

  checkAuth = async (): Promise<boolean> => {
    const { access_token, refresh_token } = await this.getTokens();

    // 如果有用户信息 且 token 未过期
    if (await this.isAuth()) {
      return true;
    }

    // 如果没有用户信息 且 token 未过期
    if (!this.isTokenExpired(access_token)) {
      await this.queryUserInfo();
      if (!!this.userInfo) {
        return true;
      }
    }

    // 如果没有用户信息 且有 refresh_token
    if (refresh_token) {
      const newTokens = await this.queryTokenByRefreshAccess({ refresh_token });
      if (!!newTokens) {
        return true;
      }
    }

    this.clearTokensAndUserInfo();
    return false;
  };

  login = async (): Promise<boolean> => {
    const { redirectUri, code, codeVerifier } = await ChromeManager.launchWebAuthFlow();
    if (code) {
      const res = await this.queryTokenByCode({
        redirect_uri: redirectUri,
        code,
        code_verifier: codeVerifier,
      });

      if (res) {
        return true;
      }
    }

    return false;
  };

  async logout(): Promise<void> {
    const res = await CacheManager.removeSyncStorageChrome(["token", "memberInfo"]);
    return res;
  }
}

export default UserManager.getInstance();
