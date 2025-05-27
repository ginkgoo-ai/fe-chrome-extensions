import CacheManager from "@/common/kits/CacheManager";
import ChromeManager from "@/common/kits/ChromeManager";

/**
 * @description
 */
class UserManager {
  // header = `cache`; // 管理字段前缀
  // tailer = "deadtime"; // 管理字段后缀

  private static instance: UserManager | null = null;

  static getInstance(): UserManager {
    if (!this.instance) {
      this.instance = new UserManager();
    }
    return this.instance;
  }

  async getToken(): Promise<string> {
    const res = await CacheManager.getSyncStorageChrome(["token"]);
    const result = (res["token"] || "") as string;
    return result;
  }

  async setToken(params: string): Promise<void> {
    const res = await CacheManager.setSyncStorageChrome({ token: params });
    return res;
  }

  async getUserInfo(): Promise<Record<string, string>> {
    // const res = await CacheManager.getSyncStorageChrome(["memberInfo"]);
    // return res["memberInfo"] as unknown as Record<string, string>;
    return {};
  }

  async setMemberInfo(params: Record<string, string>): Promise<void> {
    const res = await CacheManager.setSyncStorageChrome({ memberInfo: params });
    return res;
  }

  async login(onSuccess?: (isLogin: boolean) => unknown, onError?: (isLogin: boolean) => unknown): Promise<unknown> {
    const token = await ChromeManager.launchWebAuthFlow();
    // TODO: 登录成功后，获取用户信息
    if (token) {
      await this.setToken(token);
      return onSuccess?.(true);
    }
    return onError?.(false);
  }

  async checkLogin(): Promise<boolean> {
    const token = await this.getToken();
    // if (token) {
    //   return onSuccess?.(true);
    // }
    // return this.login(onSuccess, onError);
    return true;
  }

  async logout(): Promise<void> {
    const res = await CacheManager.removeSyncStorageChrome(["token", "memberInfo"]);
    return res;
  }
}

export default UserManager.getInstance();
