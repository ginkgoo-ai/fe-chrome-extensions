/*global chrome*/
import ChromeManager from "@/common/kits/ChromeManager";
import FetchManager from "@/common/kits/FetchManager";
import PilotManager from "@/common/kits/PilotManager";
import { PilotStatusEnum } from "@/common/types/case";

interface IMessageType {
  type: string;
  [key: string]: unknown;
}

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
      // this.instance.portSelf = chrome.runtime.connect({ name: `ginkgo-background-${uuidv4()}` });
      // this.instance.portSelf.onMessage.addListener(async (message: any, port: chrome.runtime.Port) => {
      //   // console.log("[Ginkgo] ContentScript handleConnectMessage", message, window.location.origin);
      //   const { type, ...otherInfo } = message;
      //   const [_, source, target] = type?.split("-");

      //   if (target === "background" || target === "all") {
      //     switch (type) {
      //       case "ginkgo-background-all-tab-activated": {
      //         const { tabInfo } = otherInfo || {};
      //         const pilotInfo = PilotManager.getPilot({ tabId: tabInfo.id });
      //         console.log("openSidePanel 0", pilotInfo?.caseId, !!pilotInfo?.caseId);

      //         console.log("openSidePanel 1");
      //         await ChromeManager.openSidePanel({
      //           tabId: !!pilotInfo?.caseId ? tabInfo.id : -1,
      //         });
      //         break;
      //       }
      //       default: {
      //         break;
      //       }
      //     }
      //   }
      // });
    }
    return this.instance;
  }

  // cleanDisconnectedPort(port: chrome.runtime.Port): void {
  //   if (this.connectMap[port.name]) {
  //     delete this.connectMap[port.name];
  //   }
  // }

  postConnectMessageByName = (message: IMessageType, name: string) => {
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

  postConnectMessage = (message: IMessageType) => {
    const { type } = message || {};
    const [_, source, target] = type?.split("-");

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

  onMessage = (request: any, sender: any, sendResponse: (response?: any) => void): void => {
    const { type } = request || {};
    // console.debug("BackgroundEventManager onMessage", request);

    switch (type) {
      case "console": {
        const { msg } = request || {};
        // console.log("BackgroundEventManager console", msg);
        sendResponse(true);
        return;
      }
      case "createTab": {
        const { createProperties, cbName } = request || {};
        ChromeManager.createTab(createProperties).then((tab) => {
          if (cbName) {
            ChromeManager.executeScript(tab, request);
          }
          sendResponse(true);
        });
        return;
      }
      case "sendRequest": {
        const { config } = request || {};
        FetchManager?.sendRequest(config).then((res: any) => {
          // console.log("BackgroundEventManager sendRequest", { config, res });
          sendResponse(res);
        });
        return;
      }
      case "setSyncStorageChrome": {
        const { cbParams } = request || {};
        ChromeManager.setSyncStorageCore(cbParams).then((res) => {
          sendResponse(res);
        });
        return;
      }
      case "getSyncStorageChrome": {
        const { cbParams } = request || {};
        ChromeManager.getSyncStorageCore(cbParams).then((res) => {
          sendResponse(res);
        });
        return;
      }
      // case "updateSidePanel": {
      //   console.log("openSidePanel 2");
      //   const { tabInfo } = request || {};
      //   chrome.sidePanel.open({
      //     tabId: tabInfo.id,
      //   });
      //   return;
      // }
      default: {
        sendResponse(true);
        return;
      }
    }
  };

  onPopupMessage = (request: any, sender: any, sendResponse: (response?: any) => void): void => {
    const { type } = request || {};
    console.debug("[Debug] BackgroundEventManager onPopupMessage", request);
    switch (type) {
      default: {
        sendResponse(true);
        break;
      }
    }
    return;
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
      const pilotInfo = PilotManager.getPilot({ tabId: tab.id });
      if (pilotInfo?.pilotStatus === PilotStatusEnum.OPEN) {
        PilotManager.start({ tabInfo: tab });
      }
    }
  };

  onTabsActivated = async (activeInfo: chrome.tabs.TabActiveInfo) => {
    const { tabId, windowId } = activeInfo || {};
    // 获取当前激活的 tab 的 HTML 内容
    if (tabId) {
      const resTabInfo = await ChromeManager.getTabInfo(tabId);
      const resWindowInfo = await ChromeManager.getWindowInfo(windowId);

      this.postConnectMessage({
        type: "ginkgo-background-all-tab-activated",
        tabInfo: resTabInfo,
      });

      // 判断是否是单点登录页面，是则调整窗口大小
      if (resWindowInfo?.type === "popup" && ChromeManager.whiteListForAuth.some((whiteUrl) => resTabInfo.url?.startsWith(whiteUrl))) {
        console.log("resWindowInfo", resWindowInfo);
        await ChromeManager.updateWindow(windowId, {
          width: 300,
          height: 600,
        });
      }

      // 打开侧边栏
      // const pilotInfo = PilotManager.getPilot({ tabId });
      // console.log("openSidePanel 0", pilotInfo?.caseId, !!pilotInfo?.caseId);

      // console.log("openSidePanel 1");
      // await ChromeManager.openSidePanel({
      //   tabId: !!pilotInfo?.caseId ? tabId : -1,
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

  onConnectCommon = async (message: any, port: chrome.runtime.Port) => {
    const { type, ...otherInfo } = message || {};
    const [_, source, target] = type?.split("-");
    const typeNew = type.replace(/ginkgo-([^-]+)-/, "ginkgo-background-");
    const messageNew = {
      ...(message || {}),
      type: typeNew,
    };

    // console.log("onConnectCommon", type, otherInfo);

    switch (type) {
      case "ginkgo-page-page-register": {
        messageNew.scope = [port.name];
        messageNew.version = chrome.runtime.getManifest().version;
        this.postConnectMessage(messageNew);
        break;
      }
      case "ginkgo-page-background-tab-update":
      case "ginkgo-sidepanel-background-tab-update": {
        const { tabId, updateProperties } = otherInfo || {};

        ChromeManager.updateTab(tabId, updateProperties);
        break;
      }
      case "ginkgo-page-all-case-start":
      case "ginkgo-sidepanel-all-case-start": {
        const {
          url: urlMsg = "https://apply-to-visit-or-stay-in-the-uk.homeoffice.gov.uk/SKILLED_WORK/3434-4632-5724-0670/",
          caseId: caseIdMsg = "caseId-123456",
          workflowId: workflowIdMsg = "workflowId-123456",
          fill_data: fill_dataMsg,
        } = otherInfo || {};

        const resTabs = await ChromeManager.queryTabs({
          url: urlMsg,
        });
        const tabInfo = resTabs?.[0];

        console.log("ginkgo-sidepanel-all-case-start", tabInfo);

        if (tabInfo) {
          PilotManager.start({
            caseId: caseIdMsg,
            workflowId: workflowIdMsg,
            tabInfo: tabInfo,
            fill_data: fill_dataMsg,
          });
        } else {
          this.postConnectMessage({
            type: `ginkgo-background-all-toast`,
            content: "No matching page found.",
          });
        }

        // const pilotInfo = PilotManager.getPilot({ caseId: caseIdMsg, workflowId: workflowIdMsg });

        // if (!!pilotInfo) {
        //   PilotManager.start({
        //     caseId: pilotInfo.caseId,
        //     workflowId: pilotInfo.workflowId,
        //     tabInfo: pilotInfo.tabInfo,
        //     fill_data: fill_dataMsg,
        //   });
        // } else {
        //   PilotManager.open({
        //     caseId: caseIdMsg,
        //     workflowId: workflowIdMsg,
        //     fill_data: fill_dataMsg,
        //   });
        // }
        break;
      }
      case "ginkgo-page-all-case-stop":
      case "ginkgo-sidepanel-all-case-stop": {
        const { workflowId: workflowIdMsg } = otherInfo || {};

        PilotManager.stop({ workflowId: workflowIdMsg });
        break;
      }
      case "ginkgo-page-background-case-query":
      case "ginkgo-sidepanel-background-case-query": {
        const { caseId: caseIdMsg, workflowId: workflowIdMsg, tabId: tabIdMsg } = otherInfo || {};
        const pilotInfo = PilotManager.getPilot({
          caseId: caseIdMsg,
          workflowId: workflowIdMsg,
          tabId: tabIdMsg,
        });

        this.postConnectMessage({
          type: `ginkgo-background-all-case-update`,
          pilotInfo,
        });
        break;
      }
      case "ginkgo-page-background-polit-query":
      case "ginkgo-sidepanel-background-polit-query": {
        const { tabId: tabIdMsg, caseId: caseIdMsg, workflowId: workflowIdMsg } = otherInfo || {};
        const pilotInfo = PilotManager.getPilot({
          tabId: tabIdMsg,
          caseId: caseIdMsg,
          workflowId: workflowIdMsg,
        });

        console.log("ginkgo-sidepanel-background-polit-query", PilotManager.pilotMap, pilotInfo);

        this.postConnectMessage({
          type: `ginkgo-background-all-polit-query`,
          pilotInfo,
        });
        break;
      }
      case "ginkgo-page-background-polit-step-query":
      case "ginkgo-sidepanel-background-polit-step-query": {
        const { workflowId: workflowIdMsg, stepKey: stepKeyMsg } = otherInfo || {};

        PilotManager.queryWorkflowStep({
          workflowId: workflowIdMsg,
          stepKey: stepKeyMsg,
        });
        break;
      }
      case "ginkgo-sidepanel-sidepanel-cookies-query": {
        const { tabInfo } = otherInfo || {};
        const resCookies = await ChromeManager.getSyncCookiesCore(tabInfo);

        messageNew.cookiesInfo = resCookies;
        this.postConnectMessage(messageNew);
        break;
      }
      case "ginkgo-page-background-sidepanel-open":
      case "ginkgo-sidepanel-background-sidepanel-open": {
        const { options } = otherInfo || {};
        console.log("background-sidepanel-open", options);
        await ChromeManager.openSidePanel(options as chrome.sidePanel.OpenOptions);
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
