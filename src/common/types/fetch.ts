// 请求配置类型
export interface IRequestConfigType {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: Record<string, any>;
  // query?: Record<string, any>;
  body?: string | FormData | URLSearchParams | Record<string, any>;
  formData?: boolean;
  mode?: RequestMode;
  credentials?: RequestCredentials;
  callbackStream?: (data: { done: boolean; decodedValue: string }) => void;
  background?: boolean;
  orz2?: boolean;
  responseType?: string;
  controller?: AbortController;
}
