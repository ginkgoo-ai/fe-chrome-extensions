/*global chrome*/
import ChromeManager from "@/common/kits/ChromeManager";
import FetchManager from "@/common/kits/FetchManager";
import PilotManager from "@/common/kits/PilotManager";
import { EventHandler } from "@/types/types";
import { PilotStatusEnum } from "../types/case";

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
          // console.log("[Debug] BackgroundEventManager postConnectMessage", client, message);
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
      // case "updateSidePanel": {
      //   console.log("openSidePanel 2");
      //   const { tabInfo } = request || {};
      //   chrome.sidePanel.open({
      //     tabId: tabInfo.id,
      //   });
      //   return true;
      // }
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
      // 发送 tab 完成事件
      // this.postConnectMessage({
      //   type: "ginkgo-background-all-tab-complete",
      //   tabInfo: tab,
      // });
      // 判断是否存在 pilot
      const pilotItem = PilotManager.getPilot({ tabId: tab.id });
      if (pilotItem?.pilotStatus === PilotStatusEnum.OPEN) {
        PilotManager.start({ tabInfo: tab });
      }
    }
  };

  onTabsActivated = async (activeInfo: { tabId: number; windowId: number }) => {
    const { tabId, windowId } = activeInfo || {};
    // 获取当前激活的 tab 的 HTML 内容
    if (tabId) {
      const resTabInfo = await ChromeManager.getTabInfo(tabId);
      this.postConnectMessage({
        type: "ginkgo-background-all-tab-activated",
        tabInfo: resTabInfo,
      });
      // const pilotItem = PilotManager.getPilot({ tabId });
      // console.log("openSidePanel 0", pilotItem?.caseId, !!pilotItem?.caseId);

      // console.log("openSidePanel 1");
      // await ChromeManager.openSidePanel({
      //   tabId: !!pilotItem?.caseId ? tabId : -1,
      // });
    }
  };

  onTabsRemoved = (tabId: number, removeInfo: { windowId: number; isWindowClosing: boolean }) => {
    PilotManager.delete({ tabId });
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

    switch (type) {
      case "ginkgo-page-page-register": {
        messageNew.scope = [port.name];
        messageNew.version = chrome.runtime.getManifest().version;
        this.postConnectMessage(messageNew);
        break;
      }
      case "ginkgo-page-all-case-start":
      case "ginkgo-sidepanel-all-case-start": {
        const pilotItem = PilotManager.getPilot({ caseId: otherInfo.caseId });
        if (!!pilotItem) {
          PilotManager.start({
            caseId: pilotItem.caseId,
            tabInfo: pilotItem.tabInfo,
          });
        } else {
          PilotManager.open(otherInfo);
        }
        break;
      }
      case "ginkgo-page-all-case-stop":
      case "ginkgo-sidepanel-all-case-stop": {
        PilotManager.stop(otherInfo);
        break;
      }
      case "ginkgo-sidepanel-background-case-query": {
        PilotManager.queryPilot(otherInfo);
        break;
      }
      default: {
        console.log("[Ginkgo] BackgroundEventManager onConnectCommon", port, message);
        break;
      }
    }

    return true;
  };
}

export default BackgroundEventManager.getInstance();
