import { v4 as uuidv4 } from "uuid";
import ChromeManager from "@/common/kits/ChromeManager";
import UtilsManager from "@/common/kits/UtilsManager";
import Api from "@/common/kits/api";
import { IRequestConfigType } from "@/common/types/fetch";

/**
 * @description 接口请求管理器
 */
class FetchManager {
  static instance: FetchManager | null = null;

  controllerMap = new Map<string, AbortController>();

  static getInstance(): FetchManager {
    if (!this.instance) {
      this.instance = new FetchManager();
    }
    return this.instance;
  }

  async calcResult(res: Response, config: IRequestConfigType): Promise<any> {
    if (config.responseType === "blob") {
      return await res.blob();
    }

    return await res.json();
  }

  /**
   * API请求封装（带验证信息）
   * @param {string} config.url 请求URL
   * @param {string} config.method 请求method
   * @param {object} config.params: 请求数据 放到url上
   * @param {object} config.data: 请求数据 放到body上
   * @param {object} config.formData: 请求数据 放到body上 是否以formData格式提交（用于上传文件）
   * @returns
   */
  async sendRequest(config: IRequestConfigType): Promise<any> {
    let result = null;
    try {
      // const defaultConfig = {
      //   method: "GET",
      //   headers: {
      //     "Content-Type": "application/json;charset=UTF-8",
      //   },
      //   params: {},
      //   data: {},
      //   mode: "cors",
      //   // credentials: "include",
      // };
      let {
        url = "",
        callbackStream,
        controller,
        ...otherConfig
      } = {
        // ...defaultConfig,
        ...config,
      };

      // 判断是否有params参数, 如果有，则需要拼接到url上
      if (otherConfig.params) {
        url = UtilsManager.router2url(url, otherConfig.params);
      }

      // 判断是否有data参数，如果有，则需要设置给body，否则不需要设置
      if (otherConfig.body && otherConfig.headers?.["Content-Type"]?.includes("application/json")) {
        // if (otherConfig.body && typeof otherConfig.body === "object") {
        otherConfig.body = JSON.stringify(otherConfig.body);
      }

      // 判断是否有formData参数，如果有，则需要设置给body，否则不需要设置
      if (otherConfig.formData) {
        // 上传文件的兼容处理，如果config.formData=true，则以form-data方式发起请求。
        // fetch()会自动设置Content-Type为multipart/form-data，无需额外设置。
        const data = new FormData();
        Object.keys(config.data || {}).forEach((key) => {
          data.append(key, config.data![key]);
        });
        otherConfig.body = data;
      }

      if (callbackStream) {
        const res = await fetch(url, otherConfig as RequestInit);
        const reader = res.body?.getReader();
        if (reader) {
          // 循环5000次，如果没有数据则退出
          for (let i = 0; i < 5000; i++) {
            const resRead = await reader.read();
            const { done, value } = resRead;
            const decodedValue = new TextDecoder("utf-8").decode(value);
            callbackStream({
              done,
              decodedValue,
            });
            if (done) {
              break;
            }
          }
        }
      } else {
        const res = await fetch(url, { ...otherConfig, signal: controller?.signal } as RequestInit);
        result = await this.calcResult(res, config);
      }
      console.debug("[Debug] FetchManager fetchAPI Res", {
        config,
        otherConfig,
        // res,
        result,
      });
    } catch (error) {
      console.debug("[Debug] FetchManager fetchAPI Error", {
        config,
        error,
      });
    }
    return result;
  }

  async sendRequestToBackground(config: IRequestConfigType): Promise<any> {
    const res = await ChromeManager.sendMessageRuntime({
      type: "sendRequest",
      config,
    });
    return res;
  }

  async fetchAPI(config: IRequestConfigType = { url: "" }): Promise<any> {
    const { background, orz2, ...otherConfig } = config || {};
    const isLocal = otherConfig.url?.includes("//localhost:");
    const controller = new AbortController();
    const uuid = uuidv4();
    let result = null;

    this.controllerMap.set(uuid, controller);

    try {
      if (orz2 && !isLocal) {
        result = await Api.Orz2.postPorter({ background, body: otherConfig });
      } else {
        if (background) {
          // [适用于build环境的content script]委托background script发起请求，此种方式只能传递普通json数据，不能传递函数及file类型数据。
          result = await this.sendRequestToBackground({ ...otherConfig, controller });
        } else {
          // [适用于popup及开发环境的content script]发起请求
          result = await this.sendRequest({ ...otherConfig, controller });
        }
      }
    } catch (e) {
      console.debug("[Debug] fetchAPI Error", e);
    } finally {
      this.controllerMap.delete(uuid);
    }

    return result;
  }

  cancelAll() {
    this.controllerMap.forEach((controller) => {
      controller.abort();
    });
    this.controllerMap.clear();
  }
}

export default FetchManager.getInstance();
