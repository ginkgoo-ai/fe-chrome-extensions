// 全局锁管理器
class LockManager {
  static instance: null | LockManager = null;

  lockMap: Map<string, boolean> = new Map();

  static getInstance() {
    if (!this.instance) {
      this.instance = new LockManager();
    }
    return this.instance;
  }

  async acquireLock(lockId: string) {
    while (this.lockMap.get(lockId)) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    this.lockMap.set(lockId, true);
  }

  async releaseLock(lockId: string) {
    this.lockMap.delete(lockId);
  }
}

export default LockManager.getInstance();
