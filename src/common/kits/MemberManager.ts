import CacheManager from "@/common/kits/CacheManager";
import ChromeManager from "@/common/kits/ChromeManager";

/**
 * @description 持久化管理器
 */
class MemberManager {
  // header = `cache`; // 管理字段前缀
  // tailer = "deadtime"; // 管理字段后缀

  private static instance: MemberManager | null = null;

  static getInstance(): MemberManager {
    if (!this.instance) {
      this.instance = new MemberManager();
    }
    return this.instance;
  }

  async getToken(): Promise<string> {
    const res = await CacheManager.getSyncStorageChrome(["token"]);
    return res["token"] as string;
  }

  async setToken(params: string): Promise<void> {
    const res = await CacheManager.setSyncStorageChrome({ token: params });
    return res;
  }

  async getMemberInfo(): Promise<Record<string, string>> {
    const res = await CacheManager.getSyncStorageChrome(["memberInfo"]);
    return res["memberInfo"] as unknown as Record<string, string>;
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

  async checkLogin(onSuccess?: (isLogin: boolean) => unknown, onError?: (isLogin: boolean) => unknown): Promise<unknown> {
    const token = await this.getToken();
    if (token) {
      return onSuccess?.(true);
    }
    return this.login(onSuccess, onError);
  }

  async logout(): Promise<void> {
    const res = await CacheManager.removeSyncStorageChrome(["token", "memberInfo"]);
    return res;
  }
}

export default MemberManager.getInstance();
