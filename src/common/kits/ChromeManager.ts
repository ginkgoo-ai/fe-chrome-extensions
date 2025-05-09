/*global chrome*/
import { message } from "antd";
import BackgroundEventManager from "@/common/kits/BackgroundEventManager";
import GlobalManager from "@/common/kits/GlobalManager";
import Mock from "@/common/kits/mock";

/**
 * @description Chrome操作管理器
 */
class ChromeManager {
  private static instance: ChromeManager | null = null;

  static getInstance(): ChromeManager {
    if (!this.instance) {
      this.instance = new ChromeManager();
    }
    return this.instance;
  }

  async openOptionsPage(): Promise<void> {
    return new Promise((resolve) => {
      if (GlobalManager.g_isDev) {
        message.open({
          content: `打开options页面`,
          type: "info",
        });
      } else {
        chrome.runtime.openOptionsPage();
      }
      resolve();
    });
  }

  async setSyncStorageCore(params: Record<string, any>): Promise<void> {
    if (GlobalManager.g_isDev) {
      const g_cacheSync = GlobalManager.g_cacheSync || {};
      GlobalManager.g_cacheSync = {
        ...g_cacheSync,
        ...params,
      };
      return;
    } else {
      return await chrome.storage.sync.set(params);
    }
  }

  async getSyncStorageCore(params?: string[]): Promise<Record<string, any>> {
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
  }

  async removeSyncStorageCore(params: string[]): Promise<void> {
    if (GlobalManager.g_isDev) {
      const g_cacheSync = GlobalManager.g_cacheSync || {};
      params.forEach((item) => {
        delete g_cacheSync[item];
      });
      GlobalManager.g_cacheSync = g_cacheSync;
    } else {
      return await chrome.storage.sync.remove(params);
    }
  }

  async clearSyncStorageCore(): Promise<void> {
    if (GlobalManager.g_isDev) {
      GlobalManager.g_cacheSync = {};
    } else {
      return await chrome.storage.sync.clear();
    }
  }

  async sendMessageRuntime(params: any): Promise<any> {
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
  }

  async queryAllTabs(): Promise<chrome.tabs.Tab[]> {
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
        chrome.tabs.query({}, (tabs) => {
          resolve(tabs);
        });
      }
    });
  }

  async getTabInfo(tabId: number): Promise<chrome.tabs.Tab> {
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
  }

  async queryTabInfo(queryInfo: Record<string, any>): Promise<chrome.tabs.Tab> {
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
  }

  async createTab(createProperties: Record<string, any>): Promise<chrome.tabs.Tab> {
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
  }

  async executeScript(tab: chrome.tabs.Tab, params: Record<string, unknown>): Promise<{ result: any }[]> {
    if (!tab?.url) {
      return new Promise((resolve) => {
        resolve([{ result: false }]);
      });
    }

    if (tab?.url?.startsWith("chrome://")) {
      console.debug("[Debug] Cannot execute script on chrome:// URL");
      return new Promise((resolve) => {
        resolve([{ result: false }]);
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
            resolve([{ result: true }]);
            break;
          }
          case "setLocalStorage": {
            message.open({
              content: `执行脚本：${tab.id} ${JSON.stringify(params)}`,
              type: "info",
            });
            resolve([{ result: true }]);
            break;
          }
          case "getLocalStorage": {
            message.open({
              content: `执行脚本：${tab.id} ${JSON.stringify(params)}`,
              type: "info",
            });
            resolve(Mock.mock_chromeManager_executeScript_getLocalStorage);
            break;
          }
          case "queryHtmlInfo": {
            message.open({
              content: `执行脚本：${tab.id} ${JSON.stringify(params)}`,
              type: "info",
            });
            resolve(Mock.mock_chromeManager_executeScript_queryHtmlInfo);
            break;
          }
          default: {
            message.open({
              content: `执行脚本：${tab.id} ${JSON.stringify(params)}`,
              type: "info",
            });
            resolve([{ result: true }]);
            break;
          }
        }
      } else {
        const { cbName = "", cbParams = {} } = params || {};
        switch (cbName) {
          case "test": {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                func: (cbParams) => {
                  console.log("handleExecuteScript test", cbParams);
                  return true;
                },
                args: [cbParams],
              },
              (res) => {
                resolve(res);
              }
            );
            break;
          }
          case "console": {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                func: (cbParams) => {
                  const { consoleText } = cbParams || {};
                  console.log(consoleText);
                  return true;
                },
                args: [cbParams],
              },
              (res) => {
                resolve(res);
              }
            );
            break;
          }
          case "setLocalStorage": {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                func: (cbParams) => {
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
                resolve(res);
              }
            );
            break;
          }
          case "getLocalStorage": {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                func: (cbParams) => {
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
                console.log("handleExecuteScript getLocalStorage", res);
                resolve(res);
              }
            );
            break;
          }
          case "querySelector": {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                func: (cbParams) => {
                  const { selector, attr = [] } = cbParams || {};
                  const element: HTMLElement | null = document.querySelector(selector);
                  if (element) {
                    const result: Record<string, unknown> = {};
                    attr.forEach((item: { key: keyof HTMLElement; defaultWindowKey: keyof Window }) => {
                      const { key } = item || {};
                      result[key] = element[key as keyof HTMLElement] || "";
                    });
                    return result;
                  }
                  return false;
                },
                args: [cbParams],
              },
              (res) => {
                resolve(res);
              }
            );
            break;
          }
          case "queryHtmlInfo": {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                func: () => {
                  return document.documentElement.outerHTML;
                },
              },
              (res) => {
                resolve(res);
              }
            );
            break;
          }
          case "actionDom": {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                func: async (cbParams) => {
                  const { action = {} } = cbParams || {};

                  const element = document.querySelector(action.selector);

                  if (!element) {
                    console.debug("[Debug] ChromeManager executeScript actionDom not found", action, element);
                    return {
                      type: "notFound",
                    };
                  }

                  element.scrollIntoView({ behavior: "smooth", block: "center" }); // auto nearest‌

                  if (action.type === "manual") {
                    return {
                      type: "manual",
                    };
                  }

                  if (action.type === "click") {
                    element.click();
                  } else if (action.type === "input") {
                    element.value = action.value;
                  }

                  return {
                    type: "success",
                  };
                },
                args: [cbParams],
              },
              (res) => {
                resolve(res);
              }
            );
            break;
          }
          case "bulkButtonActions": {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                func: async (cbParams) => {
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
                console.log("handleExecuteScript bulkButtonActions", res);
                resolve(res);
              }
            );
            break;
          }
          case "bulkActions": {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                func: async (cbParams) => {
                  const { actions = [], onComplete = () => {} } = cbParams || {};

                  for (let i = 0; i < actions.length; i++) {
                    const action = actions[i];
                    const element = document.querySelector(action.selector);

                    if (!element) {
                      console.debug("[Debug] ChromeManager executeScript aiActions", action, element);
                      onComplete({
                        type: "notFound",
                        action,
                        index: i,
                      });
                      continue;
                    }

                    element.scrollIntoView({ behavior: "auto", block: "center" });

                    if (action.type === "click") {
                      element.click();
                    } else if (action.type === "input") {
                      element.value = action.value;
                    } else if (action.type === "select") {
                      element.value = action.value;
                    } else if (action.type === "checkbox") {
                      element.checked = action.checked;
                    } else if (action.type === "radio") {
                      element.checked = action.checked;
                    } else if (action.type === "textarea") {
                      element.value = action.value;
                    } else if (action.type === "file") {
                      element.value = action.value;
                    } else if (action.type === "button") {
                      element.click();
                    } else if (action.type === "link") {
                      element.click();
                    }

                    onComplete({
                      type: "success",
                      action,
                      index: i,
                    });
                  }

                  return true;
                },
                args: [cbParams],
              },
              (res) => {
                console.log("handleExecuteScript aiActions", res);
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
  }

  getURLRuntime(url: string): string {
    let result = "";
    if (GlobalManager.g_isDev) {
      result = "./getURLRuntime.js";
    } else {
      result = chrome.runtime.getURL(url);
    }
    return result;
  }
}

export default ChromeManager.getInstance();
