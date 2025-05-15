/*global chrome*/
import ChromeManager from "@/common/kits/ChromeManager";
import FetchManager from "@/common/kits/FetchManager";
import { EventHandler } from "@/types/types";

/**
 * @description background事件管理器
 */
class BackgroundEventManager {
  static instance: BackgroundEventManager | null = null;

  connectMap: Record<
    string,
    {
      uuid: string;
      port: chrome.runtime.Port | null;
    } | null
  > = {};

  static getInstance(): BackgroundEventManager {
    if (!this.instance) {
      this.instance = new BackgroundEventManager();
      this.instance.connectMap = {};
    }
    return this.instance;
  }

  // cleanDisconnectedPort(port: chrome.runtime.Port): void {
  //   if (this.connectMap[port.name]) {
  //     delete this.connectMap[port.name];
  //   }
  // }

  async postConnectMessageByUuid(message: any, uuid: string) {
    const client = this.connectMap[uuid];

    try {
      client?.port?.postMessage(message);
    } catch (error) {
      console.debug("[Debug] Port disconnected, cleaning up:", client);
    }
  }

  async postConnectMessageByName(message: any, name: string) {
    for (const client of Object.values(this.connectMap)) {
      if (client?.port?.name === name) {
        try {
          client?.port?.postMessage(message);
        } catch (error) {
          console.debug("[Debug] Port disconnected, cleaning up:", client);
        }
      }
    }
  }

  async postConnectMessage(message: any) {
    const { type, ...otherInfo } = message || {};
    const arrType = type.split("-");
    // const source = arrType[1];
    const target = arrType[2];

    for (const client of Object.values(this.connectMap)) {
      try {
        const clientName = client?.port?.name?.split("-")[1];
        if (target === clientName || target === "all") {
          client?.port?.postMessage({
            ...message,
            uuid: client?.uuid,
          });
        }
      } catch (error) {
        console.debug("[Debug] Port disconnected, cleaning up:", client);
      }
    }
  }

  onMessage: EventHandler = (request, sender, sendResponse) => {
    const { type } = request || {};
    // console.debug("BackgroundEventManager onMessage", request);

    switch (type) {
      case "console": {
        const { msg } = request || {};
        // console.log("BackgroundEventManager console", msg);
        sendResponse(true);
        return true;
      }
      case "createTab": {
        const { createProperties, cbName } = request || {};
        ChromeManager.createTab(createProperties).then((tab) => {
          if (cbName) {
            ChromeManager.executeScript(tab, request);
          }
          sendResponse(true);
        });
        return true;
      }
      case "sendRequest": {
        const { config } = request || {};
        FetchManager?.sendRequest(config).then((res: any) => {
          // console.log("BackgroundEventManager sendRequest", { config, res });
          sendResponse(res);
        });
        return true;
      }
      case "setSyncStorageChrome": {
        const { cbParams } = request || {};
        ChromeManager.setSyncStorageCore(cbParams).then((res) => {
          sendResponse(res);
        });
        return true;
      }
      case "getSyncStorageChrome": {
        const { cbParams } = request || {};
        ChromeManager.getSyncStorageCore(cbParams).then((res) => {
          sendResponse(res);
        });
        return true;
      }
      default: {
        sendResponse(true);
        return true;
      }
    }
  };

  onPopupMessage: EventHandler = (request, sender, sendResponse) => {
    const { type } = request || {};
    console.debug("[Debug] BackgroundEventManager onPopupMessage", request);
    switch (type) {
      default: {
        sendResponse(true);
        break;
      }
    }
    return true;
  };

  async onTabsUpdated(tabId: number, changeInfo: Record<string, any>, tab: chrome.tabs.Tab): Promise<void> {
    if (changeInfo?.status === "complete") {
      // dosomething on tab updated
      // console.log("BackgroundEventManager onTabsUpdated 1", tab);
      // await chrome.sidePanel.setOptions({
      //   tabId: tab.id,
      //   path: "index.html",
      //   enabled: true,
      // });
      // console.log("BackgroundEventManager onTabsUpdated 2", tab);
      await ChromeManager.sendMessageRuntime({
        type: "onTabsComplete",
        tabInfo: tab,
      });
    }
  }

  async onTabsActivated(activeInfo: { tabId: number; windowId: number }): Promise<void> {
    // 获取当前激活的 tab 的 HTML 内容
    if (activeInfo.tabId) {
      const resTabInfo = await ChromeManager.getTabInfo(activeInfo.tabId);
      await ChromeManager.sendMessageRuntime({
        type: "onTabsComplete",
        tabInfo: resTabInfo,
      });
    }
  }

  onTabsRemoved(tabId: number, removeInfo: { windowId: number; isWindowClosing: boolean }): void {
    // dosomething on tab removed
    // console.log("BackgroundEventManager onTabsRemoved", { tabId, removeInfo });
  }

  async onContextMenusClick(menuInfo: any, tabInfo: chrome.tabs.Tab): Promise<void> {
    const { menuItemId } = menuInfo || {};

    switch (menuItemId) {
      default: {
        break;
      }
    }
  }

  async onCommandsCommand(command: string): Promise<void> {
    // console.log("User triggered command: " + command);

    switch (command) {
      default: {
        break;
      }
    }
  }

  onWebRequestCompleted(details: any): void {
    // console.debug("请求 URL:", details.url);
    // console.debug("请求 detail:", details);
    // const { tabId, url } = details || {};
  }

  async onConnectCommon(message: any, port: chrome.runtime.Port): Promise<void> {
    console.log("[Ginkgo] BackgroundEventManager onConnectCommon", port, message);
    // port.postMessage({ message: "Background script received your message!" });
    const { type, ...otherInfo } = message || {};
    const arrType = type.split("-");
    // const source = arrType[1];
    const target = arrType[2];
    const typeNew = type.replace(/ginkgo-([^-]+)-/, "ginkgo-background-");

    let messageNew = {
      ...(message || {}),
      type: typeNew,
    };

    if (type.endsWith("-register")) {
      messageNew.version = chrome.runtime.getManifest().version;
    }

    this.postConnectMessage(messageNew);
  }
}

export default BackgroundEventManager.getInstance();
