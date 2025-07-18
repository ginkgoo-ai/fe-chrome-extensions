/*global chrome*/
import { message } from "antd";
import BackgroundEventManager from "@/common/kits/BackgroundEventManager";
import GlobalManager from "@/common/kits/GlobalManager";
import UserManager from "@/common/kits/UserManager";
import UtilsManager from "@/common/kits/UtilsManager";
import Mock from "@/common/kits/mock";

/**
 * @description Chrome操作管理器
 */
class ChromeManager {
  private static instance: ChromeManager | null = null;

  whiteListForAuth!: string[];

  static getInstance(): ChromeManager {
    if (!this.instance) {
      this.instance = new ChromeManager();

      this.instance.whiteListForAuth = [GlobalManager.g_API_CONFIG.authServerUrl];
    }
    return this.instance;
  }

  private getInjectionResult = (tabInfo: chrome.tabs.Tab, result: any): chrome.scripting.InjectionResult<any>[] => {
    return [
      {
        documentId: "0",
        frameId: 0,
        result,
      },
    ];
  };

  launchWebAuthFlowBak = async (): Promise<{
    code: string;
    redirectUri: string;
    codeVerifier: string;
    oauthState: string;
  }> => {
    const { authorizationUrl, redirectUri, codeVerifier, oauthState } = await UserManager.buildAuthorizationUrl();

    const resWin = await this.createWindow({
      url: authorizationUrl,
      type: "popup", // "normal" | "popup" | "panel"
      width: 800,
      height: 600,
    });

    // console.log("launchWebAuthFlow", resWin);

    return {
      code: "",
      redirectUri,
      codeVerifier,
      oauthState,
    };
  };

  // launchWebAuthFlowCore = async (authorizationUrl: string): Promise<string | undefined> => {
  //   return new Promise(async (resolve, rejected) => {
  //     const beforeWindows = await chrome.windows.getAll();
  //     chrome.identity
  //       .launchWebAuthFlow({
  //         url: authorizationUrl,
  //         interactive: true,
  //         // abortOnLoadForNonInteractive: false,
  //         // timeoutMsForNonInteractive: 10000
  //       })
  //       .then((responseUrl) => {
  //         resolve(responseUrl);
  //       })
  //       .catch((error) => {
  //         rejected(error);
  //       });

  //     const afterWindows = await chrome.windows.getAll();
  //     const newWindow = afterWindows.find((afterWin) => {
  //       return !beforeWindows.some((beforeWin) => {
  //         return beforeWin.id === afterWin.id;
  //       });
  //     });

  //     if (newWindow?.id) {
  //       await chrome.windows.update(newWindow.id, {
  //         width: 800,
  //         height: 600,
  //       });
  //     }
  //   });
  // };

  launchWebAuthFlow = async (): Promise<{
    code: string;
    redirectUri: string;
    codeVerifier: string;
    oauthState: string;
  }> => {
    const { authorizationUrl, redirectUri, codeVerifier, oauthState } = await UserManager.buildAuthorizationUrl();

    try {
      const responseUrl = await chrome.identity.launchWebAuthFlow({
        url: authorizationUrl,
        interactive: true,
        // abortOnLoadForNonInteractive: false,
        // timeoutMsForNonInteractive: 10000
      });

      // console.log("launchWebAuthFlow", responseUrl);

      const responseParams = UtilsManager.router2Params(responseUrl || "", {
        decode: false,
      });
      const { code = "" } = responseParams.params;

      return {
        code,
        redirectUri,
        codeVerifier,
        oauthState,
      };
    } catch (error) {
      console.debug("[Debug] ChromeManager launchWebAuthFlow error", error);
      return {
        code: "",
        redirectUri,
        codeVerifier,
        oauthState,
      };
    }
  };

  // async removeCachedAuthToken(params: Record<string, any>): Promise<any> {
  //   const { token } = params || {};
  //   const res = await chrome.identity.removeCachedAuthToken({ token });
  //   console.log("ChromeManager removeCachedAuthToken", res);
  //   return res;
  // }

  openOptionsPage = async (): Promise<void> => {
    return new Promise((resolve) => {
      if (GlobalManager.g_isDev) {
        message.open({
          content: `打开options页面`,
          type: "info",
        });
        resolve(void 0);
      } else {
        resolve(chrome.runtime.openOptionsPage());
      }
    });
  };

  setSyncStorageCore = async (params: Record<string, any>): Promise<void> => {
    if (GlobalManager.g_isDev) {
      const g_cacheSync = GlobalManager.g_cacheSync || {};
      GlobalManager.g_cacheSync = {
        ...g_cacheSync,
        ...params,
      };
      return void 0;
    } else {
      return await chrome.storage.sync.set(params);
    }
  };

  getSyncStorageCore = async (params?: string[]): Promise<Record<string, any>> => {
    if (GlobalManager.g_isDev) {
      let result: Record<string, any> = {};
      if (params) {
        params.forEach((item) => {
          result[item] = GlobalManager.g_cacheSync[item];
        });
      } else {
        result = GlobalManager.g_cacheSync;
      }
      return result;
    } else {
      return await chrome.storage.sync.get(params);
    }
  };

  removeSyncStorageCore = async (params: string[]): Promise<void> => {
    if (GlobalManager.g_isDev) {
      const g_cacheSync = GlobalManager.g_cacheSync || {};
      params.forEach((item) => {
        delete g_cacheSync[item];
      });
      GlobalManager.g_cacheSync = g_cacheSync;
    } else {
      return await chrome.storage.sync.remove(params);
    }
  };

  clearSyncStorageCore = async (): Promise<void> => {
    if (GlobalManager.g_isDev) {
      GlobalManager.g_cacheSync = {};
    } else {
      return await chrome.storage.sync.clear();
    }
  };

  getSyncCookiesCore = async (tabInfo: chrome.tabs.Tab): Promise<{ cookies: chrome.cookies.Cookie[]; cookiesStr: string }> => {
    let result: { cookies: chrome.cookies.Cookie[]; cookiesStr: string } = {
      cookies: [],
      cookiesStr: "",
    };

    if (tabInfo?.url) {
      try {
        // const url = new URL(tabInfo.url);
        const cookies = await chrome.cookies.getAll({
          url: tabInfo.url,
          // domain: url.hostname,
        });
        result = {
          cookies,
          cookiesStr: cookies
            .map((cookie) => {
              const cookieParts = [`${cookie.name}=${cookie.value}`];

              // 添加过期时间
              // if (cookie.expirationDate) {
              //   const expires = new Date(cookie.expirationDate * 1000).toUTCString();
              //   cookieParts.push(`Expires=${expires}`);
              // }

              // 添加路径
              // if (cookie.path) {
              //   cookieParts.push(`Path=${cookie.path}`);
              // }

              // 添加域名
              // if (cookie.domain) {
              //   cookieParts.push(`Domain=${cookie.domain}`);
              // }

              // 添加安全标志
              // if (cookie.secure) {
              //   cookieParts.push("Secure");
              // }

              // 添加 HttpOnly 标志
              // if (cookie.httpOnly) {
              //   cookieParts.push("HttpOnly");
              // }

              return cookieParts.join("; ");
            })
            .join("; "), // 将cookies转换为axios可用的header cookies传参
        };
      } catch (error) {
        console.debug("[Debug] ChromeManager getSyncCookiesCore error", error);
      }
    }

    return result;
  };

  sendMessageRuntime = async (params: any): Promise<any> => {
    return new Promise((resolve) => {
      if (GlobalManager.g_isDev) {
        BackgroundEventManager.onMessage(params, {}, (response) => {
          resolve(response);
        });
      } else {
        chrome.runtime.sendMessage(params, (response) => {
          if (chrome.runtime.lastError) {
            console.debug("[Debug] Message port closed, silently ignored");
            resolve(null);
          } else {
            resolve(response);
          }
        });
      }
    });
  };

  queryTabs = async (queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> => {
    return new Promise((resolve) => {
      if (GlobalManager.g_isDev) {
        message.open({
          content: `获取全部tab`,
          type: "info",
        });
        resolve([
          {
            id: 588890461,
            url: Mock.mock_chromeManager_queryTabInfo,
          },
          {
            id: 588890462,
            url: Mock.mock_chromeManager_queryTabInfo,
          },
        ] as chrome.tabs.Tab[]);
      } else {
        chrome.tabs.query(queryInfo, (tabs) => {
          if (chrome.runtime.lastError) {
            console.debug("[Debug] queryTabs Error", chrome.runtime.lastError.message);
            resolve(tabs);
          }
          resolve(tabs);
        });
      }
    });
  };

  getTabInfo = async (tabId: number): Promise<chrome.tabs.Tab> => {
    return new Promise((resolve) => {
      if (GlobalManager.g_isDev) {
        message.open({
          content: `获取tab: ${tabId}`,
          type: "info",
        });
        resolve({
          id: 588890461,
          url: Mock.mock_chromeManager_queryTabInfo,
        } as chrome.tabs.Tab);
      } else {
        chrome.tabs.get(tabId, (tab) => {
          resolve(tab);
        });
      }
    });
  };

  getActiveTabInfo = async (): Promise<chrome.tabs.Tab> => {
    return new Promise((resolve) => {
      if (GlobalManager.g_isDev) {
        message.open({
          content: `获取当前tab`,
          type: "info",
        });
        resolve({
          id: 588890461,
          url: Mock.mock_chromeManager_queryTabInfo,
        } as chrome.tabs.Tab);
      } else {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          resolve(tabs[0]);
        });
      }
    });
  };

  createTab = async (createProperties: chrome.tabs.UpdateProperties): Promise<chrome.tabs.Tab> => {
    return new Promise((resolve) => {
      if (GlobalManager.g_isDev) {
        message.open({
          content: `创建tab: ${JSON.stringify(createProperties)}`,
          type: "info",
        });
        resolve({
          id: 588890461,
          url: Mock.mock_chromeManager_createTab,
        } as chrome.tabs.Tab);
      } else {
        chrome.tabs.create(createProperties, (tab) => {
          resolve(tab);
        });
      }
    });
  };

  updateTab = async (tabId: number, updateProperties: chrome.tabs.UpdateProperties): Promise<chrome.tabs.Tab | undefined> => {
    return new Promise((resolve) => {
      // console.log("updateTab", tabId, updateProperties);
      chrome.tabs.update(tabId, updateProperties, (tab) => {
        resolve(tab);
      });
    });
  };

  getWindowInfo = async (windowId: number): Promise<chrome.windows.Window> => {
    return new Promise((resolve) => {
      if (GlobalManager.g_isDev) {
        message.open({
          content: `获取窗口: ${windowId}`,
          type: "info",
        });
        resolve({
          id: windowId,
          focused: true,
          top: 0,
          left: 0,
          width: 800,
          height: 600,
          type: "normal",
          state: "normal",
        } as chrome.windows.Window);
      } else {
        chrome.windows.get(windowId, (window) => {
          resolve(window);
        });
      }
    });
  };

  createWindow = async (createData: chrome.windows.CreateData) => {
    return new Promise((resolve) => {
      chrome.windows.create(createData, (window?: chrome.windows.Window): void => {
        resolve(window);
      });
    });
  };

  updateWindow = async (windowId: number, updateInfo: chrome.windows.UpdateInfo) => {
    return new Promise((resolve) => {
      chrome.windows.update(windowId, updateInfo, (window: chrome.windows.Window): void => {
        resolve(window);
      });
    });
  };

  executeScript = async (
    tab: chrome.tabs.Tab,
    params: Record<string, unknown>
  ): Promise<chrome.scripting.InjectionResult<any>[] | null> => {
    // console.log("executeScript tab", tab);

    if (!tab?.id || !tab?.url) {
      return new Promise((resolve) => {
        resolve(this.getInjectionResult(tab, false));
      });
    }

    if (tab?.url?.startsWith("chrome://")) {
      console.debug("[Debug] Cannot execute script on chrome:// URL");
      return new Promise((resolve) => {
        resolve(this.getInjectionResult(tab, false));
      });
    }

    return new Promise((resolve) => {
      if (GlobalManager.g_isDev) {
        const { cbName = "", cbParams = {} } = params || {};
        switch (cbName) {
          case "test": {
            message.open({
              content: `执行脚本：${tab.id} ${JSON.stringify(params)}`,
              type: "info",
            });
            resolve(this.getInjectionResult(tab, true));
            break;
          }
          case "setLocalStorage": {
            message.open({
              content: `执行脚本：${tab.id} ${JSON.stringify(params)}`,
              type: "info",
            });
            resolve(this.getInjectionResult(tab, true));
            break;
          }
          case "getLocalStorage": {
            message.open({
              content: `执行脚本：${tab.id} ${JSON.stringify(params)}`,
              type: "info",
            });
            resolve(this.getInjectionResult(tab, Mock.mock_chromeManager_executeScript_getLocalStorage));
            break;
          }
          case "queryHtmlInfo": {
            message.open({
              content: `执行脚本：${tab.id} ${JSON.stringify(params)}`,
              type: "info",
            });
            resolve(this.getInjectionResult(tab, Mock.mock_chromeManager_executeScript_queryHtmlInfo));
            break;
          }
          default: {
            message.open({
              content: `执行脚本：${tab.id} ${JSON.stringify(params)}`,
              type: "info",
            });
            resolve(this.getInjectionResult(tab, true));
            break;
          }
        }
      } else {
        const { cbName = "", cbParams = {} } = params || {};
        switch (cbName) {
          case "test": {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id! },
                func: (cbParams) => {
                  console.log("handleExecuteScript test", cbParams);
                  return true;
                },
                args: [cbParams],
              },
              (res) => {
                if (chrome.runtime.lastError) {
                  console.debug("[Debug] ChromeManager executeScript error:", chrome.runtime.lastError);
                  resolve(this.getInjectionResult(tab, false));
                  return;
                }
                resolve(res);
              }
            );
            break;
          }
          case "console": {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id! },
                func: (cbParams: any) => {
                  const { consoleText } = cbParams || {};
                  console.log(consoleText);
                  return true;
                },
                args: [cbParams],
              },
              (res) => {
                if (chrome.runtime.lastError) {
                  console.debug("[Debug] ChromeManager executeScript error:", chrome.runtime.lastError);
                  resolve(this.getInjectionResult(tab, false));
                  return;
                }
                resolve(res);
              }
            );
            break;
          }
          case "setLocalStorage": {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id! },
                func: (cbParams: any) => {
                  const { storageInfo, isNeedReload } = cbParams || {};
                  storageInfo &&
                    storageInfo.map((item: any) => {
                      const { storageKey, storageValue } = item || {};
                      localStorage.setItem(storageKey, storageValue);
                    });
                  if (isNeedReload) {
                    location.reload();
                  }
                  return true;
                },
                args: [cbParams],
              },
              (res) => {
                if (chrome.runtime.lastError) {
                  console.debug("[Debug] ChromeManager executeScript error:", chrome.runtime.lastError);
                  resolve(this.getInjectionResult(tab, false));
                  return;
                }
                resolve(res);
              }
            );
            break;
          }
          case "getLocalStorage": {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id! },
                func: (cbParams: any) => {
                  const { storageKey } = cbParams || {};
                  const result =
                    storageKey &&
                    storageKey.map((key: string) => {
                      return {
                        storageKey: key,
                        storageValue: localStorage.getItem(key),
                      };
                    });
                  return result;
                },
                args: [cbParams],
              },
              (res) => {
                if (chrome.runtime.lastError) {
                  console.debug("[Debug] ChromeManager executeScript error:", chrome.runtime.lastError);
                  resolve(this.getInjectionResult(tab, false));
                  return;
                }
                console.log("handleExecuteScript getLocalStorage", res);
                resolve(res);
              }
            );
            break;
          }
          case "querySelectors": {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id! },
                func: (cbParams: any) => {
                  const result: Record<string, unknown>[] = [];
                  const { selectors = [] } = cbParams || {};

                  selectors.forEach((itemSelector: any, indexSelector: number) => {
                    const { selector, attr = [] } = itemSelector || {};
                    const element: HTMLElement | null = document.querySelector(selector);
                    if (element) {
                      const resultSelector: Record<string, unknown> = {};
                      attr.forEach((item: { key: keyof HTMLElement; defaultWindowKey: keyof Window }) => {
                        const { key } = item || {};
                        resultSelector[key] = element[key as keyof HTMLElement] || "";
                      });
                      result.push(resultSelector);
                    } else {
                      result.push({});
                    }
                  });

                  return result;
                },
                args: [cbParams],
              },
              (res) => {
                if (chrome.runtime.lastError) {
                  console.debug("[Debug] ChromeManager executeScript error:", chrome.runtime.lastError);
                  resolve(this.getInjectionResult(tab, false));
                  return;
                }
                resolve(res);
              }
            );
            break;
          }
          case "queryHtmlInfo": {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id! },
                func: () => {
                  return document.documentElement.outerHTML;
                },
              },
              (res) => {
                if (chrome.runtime.lastError) {
                  console.debug("[Debug] ChromeManager executeScript error:", chrome.runtime.lastError);
                  resolve(this.getInjectionResult(tab, false));
                  return;
                }
                resolve(res);
              }
            );
            break;
          }
          case "actionDom": {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id! },
                func: async (cbParams: any) => {
                  const { action = {}, stopRuleList = [] } = cbParams || {};

                  const element = document.querySelector(action.selector);

                  if (!element) {
                    console.debug("[Debug] ChromeManager executeScript actionDom not found", action, element);
                    return {
                      type: "notFound",
                    };
                  }

                  element.scrollIntoView({ behavior: "smooth", block: "center" }); // auto nearest‌

                  for (let indexStopRule = 0; indexStopRule < stopRuleList.length; indexStopRule++) {
                    const itemStopRule = stopRuleList[indexStopRule];
                    const { type, method, key, value } = itemStopRule || {};
                    let isStop = false;

                    if (!element[key]) {
                      continue;
                    }

                    switch (method) {
                      case "endsWith": {
                        isStop = new RegExp(value + "$").test(element[key]);
                        break;
                      }
                      default: {
                        isStop = element[key] === value;
                        break;
                      }
                    }

                    if (isStop) {
                      return {
                        type,
                      };
                    }
                  }

                  if (action.type === "click") {
                    element.click();
                  } else if (action.type === "input") {
                    element.value = action.value;

                    const events = ["input", "change", "blur", "keypress", "keydown", "keyup"];
                    events.forEach((eventType) => {
                      const event = new Event(eventType, { bubbles: true, cancelable: true });
                      element.dispatchEvent(event);
                    });
                  } else if (action.type === "manual") {
                    return {
                      type: "manual",
                    };
                  }

                  return {
                    type: "success",
                  };
                },
                args: [cbParams],
              },
              (res) => {
                if (chrome.runtime.lastError) {
                  console.debug("[Debug] ChromeManager executeScript error:", chrome.runtime.lastError);
                  resolve(this.getInjectionResult(tab, false));
                  return;
                }
                resolve(res);
              }
            );
            break;
          }
          case "actionDomBulk": {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id! },
                func: async (cbParams: any) => {
                  let count = 0;
                  const { btnClassName = [], spanClassName = ".Button-label", spanText = "", actions = [] } = cbParams || {};
                  const buttons = document.getElementsByTagName("button");

                  for (let i = 0; i < buttons.length; i++) {
                    const button = buttons[i];

                    if (btnClassName.every((className: string) => button.classList.contains(className))) {
                      const span = button.querySelector(spanClassName);

                      if (span && span.innerText === spanText) {
                        if (actions.includes("click")) {
                          button.click();
                        }
                        count++;
                      }
                    }
                  }

                  return count;
                },
                args: [cbParams],
              },
              (res) => {
                if (chrome.runtime.lastError) {
                  console.debug("[Debug] ChromeManager executeScript error:", chrome.runtime.lastError);
                  resolve(this.getInjectionResult(tab, false));
                  return;
                }
                console.log("handleExecuteScript bulkButtonActions", res);
                resolve(res);
              }
            );
            break;
          }
          default: {
            console.log("executeScript default", cbName, cbParams);
            resolve(null);
            break;
          }
        }
      }
    });
  };

  getURLRuntime = (url: string): string => {
    let result = "";
    if (GlobalManager.g_isDev) {
      result = "./getURLRuntime.js";
    } else {
      result = chrome.runtime.getURL(url);
    }
    return result;
  };

  openSidePanel = (options: chrome.sidePanel.OpenOptions): Promise<void> => {
    return chrome.sidePanel.open(options);
  };
}

export default ChromeManager.getInstance();
