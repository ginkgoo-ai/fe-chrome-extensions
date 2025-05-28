// 任务类型
export interface Task {
  index: number;
  performTask: (params: any) => Promise<any>;
  params?: any;
}

// 任务回调类型
export interface TaskCallback {
  (data: { code: string; index: number; res: any }): void;
}

// 事件处理器类型
export interface EventHandler {
  (request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): boolean | void;
}
