import { ThemeConfig } from "antd";

interface ThemeInfo {
  customStyle: {
    "--color-primary": string;
  };
  imageInfo?: {
    [key: string]: string;
  };
}

interface ThemeInfoDefault {
  [key: string]: ThemeInfo;
}

interface Config {
  themeInfoDefault: ThemeInfoDefault;
  entryListDefault: EntryList[];
}

interface EntryList {
  appList: App[];
}

interface App {
  surface: {
    x: number;
    y: number;
    bgColorLight: string;
    bgColor: string;
    src: string;
    name: string;
  };
  info: {
    title: string;
    url: string;
  };
}

declare module "antd" {
  interface ThemeConfig {
    token?: {
      cssVar?: boolean;
      colorPrimary?: string;
    };
  }
}

// 请求配置类型
export interface RequestConfig {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: Record<string, any>;
  body?: string | FormData;
  formData?: boolean;
  mode?: RequestMode;
  callbackStream?: (data: { done: boolean; decodedValue: string }) => void;
  background?: boolean;
  orz2?: boolean;
}

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

// 工具方法类型
export interface UtilsManagerType {
  stopEventDefault: (e: Event) => void;
  checkJSONString: (str: string) => boolean;
  compareVersions: (versionA: string, versionB: string) => number;
  copyToClipboard: (text: string) => void;
  checkValueExist: (value: any) => boolean;
  deepClone: <T>(obj: T) => T;
  startsWith: (source: string, start: string) => boolean;
  nextTick: (fn: () => void) => void;
  getRandomNumber: (params?: { min?: number; max?: number }) => number;
  getRandomArrayElements: <T>(params: { arr: T[]; num?: number }) => T[];
  checkSupport: (supportList: any[], supportRule: Record<string, any>) => boolean;
  sleep: (ms: number) => Promise<void>;
  isFileUrl: (url: string) => boolean;
  getRandomColor: () => string;
  file2Base64: (file: File) => Promise<string>;
  traverseObject: <T>(params: { obj: T; modifier: (value: any) => any }) => T;
  router2url: (strPath: string, objParams: Record<string, any>) => string;
}

declare module "*.webp" {
  const content: string;
  export default content;
}
