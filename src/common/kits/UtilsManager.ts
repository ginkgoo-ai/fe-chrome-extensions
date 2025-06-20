import { message } from "antd";
import GlobalManager from "@/common/kits/GlobalManager";

/**
 * @description 工具方法管理器
 */
class UtilsManager {
  static instance: UtilsManager | null = null;

  static getInstance(): UtilsManager {
    if (!this.instance) {
      this.instance = new UtilsManager();
    }
    return this.instance;
  }

  stopEventDefault = (e: Event): void => {
    e.stopPropagation();
    e.preventDefault();
  };

  checkJSONString = (str: string): boolean => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  compareVersions = (versionA: string, versionB: string): number => {
    const segmentsA = versionA.split(".").map(Number);
    const segmentsB = versionB.split(".").map(Number);

    for (let i = 0; i < Math.max(segmentsA.length, segmentsB.length); i++) {
      const segmentA = segmentsA[i] || 0;
      const segmentB = segmentsB[i] || 0;

      if (segmentA > segmentB) {
        return 1;
      } else if (segmentA < segmentB) {
        return -1;
      }
    }

    return 0;
  };

  copyToClipboard = (text: string): void => {
    // const input = document.createElement("input");
    // input.value = text;
    // document.body.appendChild(input);
    // input.select();
    // document.execCommand("copy");
    // document.body.removeChild(input);

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const res = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (res) {
      message.open({
        content: `Copied to clipboard.`,
        type: "success",
      });
    } else {
      message.open({
        content: `Failed to copy to clipboard.`,
        type: "error",
      });
    }
  };

  checkValueExist = (value: unknown): boolean => {
    if (Array.isArray(value)) {
      return !!value.length;
    } else if (value === null || value === undefined) {
      return false;
    } else if (typeof value === "object") {
      return !!Object.keys(value).length;
    } else {
      return true;
    }
  };

  deepClone = <T>(obj: T): T => {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    let clone;
    if (Array.isArray(obj)) {
      clone = [];
      for (let i = 0; i < obj.length; i++) {
        clone[i] = this.deepClone(obj[i]);
      }
    } else {
      clone = {} as Record<string, unknown>;
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          clone[key] = this.deepClone(obj[key]);
        }
      }
    }

    return clone as T;
  };

  startsWith = (source: string = "", start: string = ""): boolean => {
    return source.toString().slice(0, start.length) === start;
  };

  nextTick = (fn: () => void): void => {
    setTimeout(() => {
      fn();
    }, GlobalManager.g_NEXT_TICK_DELAY);
  };

  getRandomNumber = (params?: { min?: number; max?: number }): number => {
    const { min: minParams = 0, max: maxParams = 10 } = params || {};
    const min = Math.ceil(minParams);
    const max = Math.floor(maxParams);
    return Math.floor(Math.random() * (max - min)) + min;
  };

  getRandomArrayElements = <T>(params: { arr: T[]; num?: number }): T[] => {
    const { arr, num = 1 } = params || {};
    const shuffled = arr.slice(); // 复制数组
    let i = arr.length;
    let temp;
    let index;

    while (i--) {
      index = Math.floor((i + 1) * Math.random()); // 随机生成索引
      temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
    }

    return shuffled.slice(0, num); // 返回前N个元素
  };

  checkSupport = (supportList: Record<string, unknown>[], supportRule: Record<string, unknown>): boolean => {
    if (!supportList) {
      return true;
    }
    return supportList.some((support: Record<string, unknown>) => {
      return Object.keys(support).every((key) => {
        return (support[key] as string).includes(supportRule[key] as string);
      });
    });
  };

  sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  };

  isFileUrl = (url: string): boolean => {
    const { pathname } = new URL(url);
    // 定义文件扩展名的正则表达式
    const fileExtensions = /\.(html?|js|css|pdf|docx?|xlsx?|pptx?|txt|csv|jpg|jpeg|png|gif|json|ico|svg)$/i;

    // 使用正则表达式测试URL
    return fileExtensions.test(pathname);
  };

  getRandomColor = (): string => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  file2Base64 = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        // 文件读取成功完成时触发
        resolve((e?.target?.result as string) || "");
      };
    });
  };

  traverseObject = <T>(params: { obj: T; modifier: (value: unknown) => any }): T => {
    const { obj, modifier } = params || {};
    const newObj = this.deepClone(obj); // 创建新的对象

    for (const key in newObj) {
      if (Object.prototype.hasOwnProperty.call(newObj, key)) {
        if (typeof newObj[key] === "object" && newObj[key] !== null) {
          newObj[key] = this.traverseObject({ obj: newObj[key], modifier }); // 递归调用遍历子对象，并将结果赋值给新对象的对应字段
        } else {
          newObj[key] = modifier(newObj[key]); // 对字段进行修改，并将结果赋值给新对象的对应字段
        }
      }
    }

    return newObj; // 返回新对象
  };

  router2Params = (strRouter: string, options?: Record<string, unknown>): { path: string; params: Record<string, string> } => {
    const { decode = true } = options || {};
    const strRouterTmp = strRouter || "";
    let strResultPath = strRouterTmp;
    const objResultParam: Record<string, string> = {};

    const nIndexPath = strRouterTmp.indexOf("?");
    if (nIndexPath >= 0) {
      strResultPath = strRouterTmp.substring(0, nIndexPath);
      const strParam = strRouterTmp.slice(nIndexPath + 1);
      const arrParam = strParam.split("&");
      // console.log('router2Params', strResultPath, strParam, arrParam)

      arrParam.forEach((strItem) => {
        const nIndexParam = strItem.indexOf("=");
        if (nIndexParam >= 0) {
          const strParamKey = strItem.substring(0, nIndexParam);
          const strParamValue = strItem.slice(nIndexParam + 1);
          objResultParam[strParamKey] = decode ? decodeURIComponent(strParamValue) : strParamValue;
        }
      });
    }
    // console.log('router2Params', objResultParam)

    return {
      path: strResultPath,
      params: objResultParam,
    };
  };

  router2url = (strPath: string, objParams: Record<string, string> = {}, options?: Record<string, unknown>): string => {
    const { decode = true } = options || {};
    const arrParams = [];
    let strResult = strPath;

    if (strResult && Object.values(objParams)?.length > 0) {
      strResult += strPath.includes("?") ? "&" : "?";
    }

    for (const key in objParams) {
      arrParams.push(`${key}=${decode ? encodeURIComponent(objParams[key]) : objParams[key]}`);
    }
    strResult += arrParams.join("&");

    return strResult;
  };

  getUrlInfo = (url?: string) => {
    // if (typeof window === "undefined") {
    //   return {};
    // }

    // For example: http://localhost:3000/en/?q=2#why
    const result = {
      hash: "", // #why
      host: "", // localhost:3000
      hostname: "", // localhost
      href: "", // http://localhost:3000/en/?q=2#why
      origin: "", // http://localhost:3000
      password: "", // ""
      pathname: "", // /en/
      port: "", // 3000
      protocol: "", // http:
      search: "", // ?q=2
      searchParams: {}, // URLSearchParams {size: 1}
      username: "", // ""
    };

    try {
      const urlInfo = new URL(url || window.location.href) || {};
      const { hash, host, hostname, href, origin = "", password, pathname = "", port, protocol, search, searchParams, username } = urlInfo;

      result.hash = hash;
      result.host = host;
      result.hostname = hostname;
      result.href = href;
      result.origin = origin;
      result.password = password;
      result.pathname = pathname;
      result.port = port;
      result.protocol = protocol;
      result.search = search;
      result.searchParams = searchParams;
      result.username = username;
    } catch (error) {
      console.log("[Ginkgoo] UtilsManager getUrlInfo", error);
    }

    // console.log("getUrlInfo result", result);

    return result;
  };

  formatStr = (str: string): string => {
    return (
      str
        // 去除多余的空格和换行
        .replace(/\s+/g, " ")
        // 去除标签之间的多余空格
        .replace(/>\s+</g, "><")
        // 去除开始标签前的空格
        .replace(/\s+</g, "<")
        // 去除结束标签后的空格
        .replace(/>\s+/g, ">")
        // 去除无意义的转义符
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim()
    );
  };

  navigateTo = (url: string, params?: Record<string, string>) => {
    if (!window) {
      return;
    }
    const [html, _] = window?.location?.href?.split("#") || [];
    const path = this.router2url(url, params);
    const href = `${html}#${path}`;

    console.log("navigateTo", href, html, path);
    window.location.href = href;
  };

  redirectTo = (url: string, params?: Record<string, string>) => {
    if (!window) {
      return;
    }
    const [html, _] = window?.location?.href?.split("#") || [];
    const path = this.router2url(url, params);
    const href = `${html}#${path}`;

    console.log("redirectTo", href, window?.location?.href);
    // if (window?.location?.href !== href) {
    //   window.location.replace(href);
    //   return true;
    // } else {
    //   return false;
    // }
    window.location.replace(href);
  };

  navigateBack = () => {
    window.history.back();
  };

  clickTagA = (params: { url: string; fileName?: string; target?: string }) => {
    const { url, fileName, target } = params || {};
    const a = document.createElement("a");

    a.href = url;
    if (fileName) {
      a.download = fileName;
    }
    if (target) {
      a.target = target;
    }

    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  saveBlob = (params: { blobPart: BlobPart; fileName?: string }) => {
    const { blobPart, fileName } = params;
    const blob = new Blob([blobPart]);

    this.clickTagA({ url: window.URL.createObjectURL(blob), fileName });
  };
}

export default UtilsManager.getInstance();
