/*global chrome*/
import ChromeManager from "@/common/kits/ChromeManager";
import FetchManager from "@/common/kits/FetchManager";
import { EventHandler } from "@/types/types";

/**
 * @description background事件管理器
 */
class BackgroundEventManager {
  static instance: BackgroundEventManager | null = null;

  connectList: {
    // uuid: string;
    port: chrome.runtime.Port;
  }[] = [];

  static getInstance(): BackgroundEventManager {
    if (!this.instance) {
      this.instance = new BackgroundEventManager();
      this.instance.connectList = [];
    }
    return this.instance;
  }

  // cleanDisconnectedPort(port: chrome.runtime.Port): void {
  //   if (this.connectMap[port.name]) {
  //     delete this.connectMap[port.name];
  //   }
  // }

  postConnectMessageByName = (message: any, name: string) => {
    for (const client of this.connectList) {
      if (client?.port?.name === name) {
        try {
          client?.port?.postMessage(message);
        } catch (error) {
          console.debug("[Debug] Port disconnected, cleaning up:", client);
        }
      }
    }
  };

  postConnectMessage = (message: any) => {
    const { type } = message || {};
    const arrType = type.split("-");
    // const source = arrType[1];
    const target = arrType[2];

    for (const client of this.connectList) {
      const clientName = client?.port?.name?.split("-")[1];
      if (target === clientName || target === "all") {
        try {
          client?.port?.postMessage(message);
        } catch (error) {
          console.debug("[Debug] Port disconnected, cleaning up:", client);
        }
      }
    }
  };

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

  onTabsUpdated = async (tabId: number, changeInfo: Record<string, any>, tab: chrome.tabs.Tab) => {
    if (changeInfo?.status === "complete") {
      // dosomething on tab updated
      // console.log("BackgroundEventManager onTabsUpdated 1", tab);
      // await chrome.sidePanel.setOptions({
      //   tabId: tab.id,
      //   path: "index.html",
      //   enabled: true,
      // });
      // console.log("BackgroundEventManager onTabsUpdated 2", tab);
      try {
        this.postConnectMessage({
          type: "ginkgo-background-all-tab-complete",
          tabInfo: tab,
        });
      } catch (error) {
        console.debug("[Debug] onTabsUpdated postConnectMessage", error);
      }
    }
  };

  onTabsActivated = async (activeInfo: { tabId: number; windowId: number }) => {
    // 获取当前激活的 tab 的 HTML 内容
    if (activeInfo.tabId) {
      const resTabInfo = await ChromeManager.getTabInfo(activeInfo.tabId);
      try {
        this.postConnectMessage({
          type: "ginkgo-background-all-tab-activated",
          tabInfo: resTabInfo,
        });
      } catch (error) {
        console.debug("[Debug] onTabsActivated postConnectMessage", error);
      }
    }
  };

  onTabsRemoved = (tabId: number, removeInfo: { windowId: number; isWindowClosing: boolean }) => {
    // dosomething on tab removed
    // console.log("BackgroundEventManager onTabsRemoved", { tabId, removeInfo });
  };

  onContextMenusClick = (menuInfo: any, tabInfo: chrome.tabs.Tab) => {
    const { menuItemId } = menuInfo || {};

    switch (menuItemId) {
      default: {
        break;
      }
    }
  };

  onCommandsCommand = (command: string) => {
    // console.log("User triggered command: " + command);

    switch (command) {
      default: {
        break;
      }
    }
    return true;
  };

  onWebRequestCompleted = (details: any) => {
    // console.debug("请求 URL:", details.url);
    // console.debug("请求 detail:", details);
    // const { tabId, url } = details || {};
  };

  onConnectCommon = (message: any, port: chrome.runtime.Port) => {
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
      messageNew.scope = [port.name];
      messageNew.version = chrome.runtime.getManifest().version;
    }

    this.postConnectMessage(messageNew);
    return true;
  };
}

export default BackgroundEventManager.getInstance();
