import ChromeManager from "@/common/kits/ChromeManager";

/**
 * @description 持久化管理器
 */
class CacheManager {
  // header = `cache`; // 管理字段前缀
  // tailer = "deadtime"; // 管理字段后缀

  private static instance: CacheManager | null = null;

  static getInstance(): CacheManager {
    if (!this.instance) {
      this.instance = new CacheManager();
    }
    return this.instance;
  }

  /**
   * @description 存入缓存
   * @return {Promise<void>} 返回Promise
   * @example
   * const res = await CacheManager.setSyncStorage({c_syncKey: 'syncValue'})
   **/
  async setSyncStorageChrome(params: Record<string, string | number | boolean | Record<string, string | number | boolean>>): Promise<void> {
    const res = await ChromeManager.setSyncStorageCore(params);
    return res;
  }

  /**
   * @description 取缓存
   * @return {Promise<any>} 返回Promise
   * @example
   * const res = await CacheManager.getSyncStorage(['c_syncKey']) || {}
   **/
  async getSyncStorageChrome(params?: string[]): Promise<Record<string, unknown>> {
    const res = await ChromeManager.getSyncStorageCore(params);
    return res;
  }

  async removeSyncStorageChrome(params: string[]): Promise<void> {
    const res = await ChromeManager.removeSyncStorageCore(params);
    return res;
  }

  /**
   * @description 清空缓存
   * @return {Promise<void>} 返回Promise
   * @example
   * const res = await CacheManager.clearSyncStorage()
   **/
  async clearSyncStorageChrome(): Promise<void> {
    const res = await ChromeManager.clearSyncStorageCore();
    return res;
  }
}

export default CacheManager.getInstance();
