// 全局锁管理器
class LockManager {
  static instance: null | LockManager = null;
  private readonly MAX_ATTEMPTS = 30; // 最大尝试次数
  private readonly RETRY_INTERVAL = 200; // 重试间隔（毫秒）

  lockMap: Map<string, boolean> = new Map();

  static getInstance() {
    if (!this.instance) {
      this.instance = new LockManager();
    }
    return this.instance;
  }

  async acquireLock(lockId: string, maxAttempts = this.MAX_ATTEMPTS) {
    let attempts = 0;
    while (this.lockMap.get(lockId)) {
      if (attempts >= maxAttempts) {
        this.lockMap.delete(lockId);
      }
      await new Promise((resolve) => setTimeout(resolve, this.RETRY_INTERVAL));
      attempts++;
    }
    this.lockMap.set(lockId, true);
  }

  async releaseLock(lockId: string) {
    this.lockMap.delete(lockId);
  }
}

export default LockManager.getInstance();
