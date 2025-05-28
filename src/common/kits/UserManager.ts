import CacheManager from "@/common/kits/CacheManager";
import ChromeManager from "@/common/kits/ChromeManager";
import GlobalManager from "@/common/kits/GlobalManager";
import Api from "@/common/kits/api";
import { IUserInfoType } from "@/common/types/user.d";

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

  buildAuthorizationUrl = async () => {
    // 生成PKCE参数
    const pkce = await this.generatePKCE();

    // 生成state参数用于防CSRF
    const state = this.generateRandomString(32);

    // 存储验证器和state
    // sessionStorage.setItem("codeVerifier", pkce.codeVerifier);
    // sessionStorage.setItem("oauthState", state);

    // 构建授权URL并跳转
    const params = new URLSearchParams({
      client_id: GlobalManager.g_API_CONFIG.clientId,
      redirect_uri: chrome.identity.getRedirectURL(), // GlobalManager.g_API_CONFIG.redirectUri,
      response_type: GlobalManager.g_API_CONFIG.responseType,
      scope: GlobalManager.g_API_CONFIG.scope,
      code_challenge: pkce.codeChallenge,
      code_challenge_method: pkce.codeChallengeMethod,
    });

    if (state) {
      params.append("state", state);
    }

    return `${GlobalManager.g_API_CONFIG.authServerUrl}/oauth2/authorize?${params.toString()}`;
  };

  // 使用refresh token获取新的access token
  queryTokenByRefreshAccess = async (
    refreshToken: string
  ): Promise<{
    access_token: string;
    refresh_token: string;
    id_token: string;
  } | null> => {
    const resAssistent = await Api.Ginkgo.authToken({
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: GlobalManager.g_API_CONFIG.clientId,
        refresh_token: refreshToken,
      }),
    });

    console.log("queryTokenByRefreshAccess", resAssistent);
    return resAssistent;
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
    const refreshToken = (res["refresh_token"] || "") as string;

    return refreshToken;
  };

  getAccessToken = async (): Promise<string> => {
    const res = await CacheManager.getSyncStorageChrome(["access_token"]);
    const accessToken = (res["access_token"] || "") as string;

    return accessToken;
  };

  setTokens = async (tokens: Record<string, string>): Promise<void> => {
    const res = await CacheManager.setSyncStorageChrome(tokens);
    return res;
  };

  clearTokensAndUserInfo() {
    CacheManager.removeSyncStorageChrome(["access_token", "refresh_token", "id_token"]);
    this.userInfo = null;
  }

  queryUserInfo = async () => {
    const res = await Api.Ginkgo.queryUserInfo();
    console.log("queryUserInfo", res);
    this.userInfo = res;
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

  login = async (onSuccess?: (isLogin: boolean) => unknown, onError?: (isLogin: boolean) => unknown): Promise<void> => {
    const token = await ChromeManager.launchWebAuthFlow();
    // TODO: 登录成功后，获取用户信息
    // if (token) {
    //   await this.setAccessToken(token);
    //   return onSuccess?.(true);
    // }
    // return onError?.(false);
    return;
  };

  checkAuth = async (): Promise<boolean> => {
    const accessToken = await this.getAccessToken();

    // 检查token是否过期，如果过期则尝试刷新
    if (!this.isTokenExpired(accessToken) && !!this.userInfo) {
      return true;
    } else {
      const refreshToken = await this.getRefreshToken();
      if (refreshToken) {
        // 有 refreshToken
        const newTokens = await this.queryTokenByRefreshAccess(refreshToken);
        if (newTokens) {
          await this.setTokens(newTokens);
          await this.queryUserInfo();
          return true;
        }
      }
      this.clearTokensAndUserInfo();
    }

    return false;
  };

  async logout(): Promise<void> {
    const res = await CacheManager.removeSyncStorageChrome(["token", "memberInfo"]);
    return res;
  }
}

export default UserManager.getInstance();
