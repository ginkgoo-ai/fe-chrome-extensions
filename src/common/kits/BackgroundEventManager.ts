/*global chrome*/
import ChromeManager from "@/common/kits/ChromeManager";
import FetchManager from "@/common/kits/FetchManager";
import PilotManager from "@/common/kits/PilotManager";
import UserManager from "@/common/kits/UserManager";
import Api from "@/common/kits/api";
import { MESSAGE } from "../config/message";
import { PilotStatusEnum } from "../types/casePilot";

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
      // this.instance.portSelf = chrome.runtime.connect({ name: `ginkgoo-background-${uuidv4()}` });
      // this.instance.portSelf.onMessage.addListener(async (message: any, port: chrome.runtime.Port) => {
      //   // console.log("[Ginkgoo] ContentScript handleConnectMessage", message, window.location.origin);
      //   const { type, ...otherInfo } = message;
      //   const [_, source, target] = type?.split("-");

      //   if (target === "background" || target === "all") {
      //     switch (type) {
      //       case "ginkgoo-background-all-tab-activated": {
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
      this.postConnectMessage({
        type: "ginkgoo-background-all-tab-complete",
        tabInfo: tab,
      });
      // 判断是否存在 pilot
      const pilotInfo = PilotManager.getPilot({ tabId: tab.id });
      if (pilotInfo?.pilotStatus === PilotStatusEnum.OPEN) {
        await PilotManager.updatePilotMap({
          workflowId: pilotInfo.pilotWorkflowInfo?.workflow_instance_id || "",
          update: {
            pilotTabInfo: tab,
          },
        });
        PilotManager.start({
          pilotInfo,
        });
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
        type: "ginkgoo-background-all-tab-activated",
        tabInfo: resTabInfo,
      });

      // 判断是否是单点登录页面，是则调整窗口大小
      if (resWindowInfo?.type === "popup" && ChromeManager.whiteListForAuth.some((whiteUrl) => resTabInfo.url?.startsWith(whiteUrl))) {
        console.log("resWindowInfo", resWindowInfo);
        await ChromeManager.updateWindow(windowId, {
          width: 480,
          height: 840,
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
    const typeNew = type.replace(/ginkgoo-([^-]+)-/, "ginkgoo-background-");
    const messageNew = {
      ...(message || {}),
      type: typeNew,
    };

    // console.log("onConnectCommon", type, otherInfo);
    switch (type) {
      case "ginkgoo-page-background-auth-check":
      case "ginkgoo-sidepanel-background-auth-check": {
        const isCheckAuth = await UserManager.checkAuth();
        this.postConnectMessage({
          type: `ginkgoo-background-all-auth-check`,
          value: isCheckAuth,
        });
        break;
      }
      case "ginkgoo-page-page-register": {
        messageNew.scope = [port.name];
        messageNew.version = chrome.runtime.getManifest().version;
        this.postConnectMessage(messageNew);
        break;
      }
      case "ginkgoo-page-background-tab-query":
      case "ginkgoo-sidepanel-background-tab-query": {
        const activeTabInfo = await ChromeManager.getActiveTabInfo();
        this.postConnectMessage({
          type: `ginkgoo-background-all-tab-query`,
          value: activeTabInfo,
        });
        break;
      }
      case "ginkgoo-page-background-tab-update":
      case "ginkgoo-sidepanel-background-tab-update": {
        const { tabId, updateProperties } = otherInfo || {};

        ChromeManager.updateTab(tabId, updateProperties);
        break;
      }
      case "ginkgoo-page-all-pilot-start":
      case "ginkgoo-sidepanel-all-pilot-start": {
        const {
          isNewWorkflow,
          caseInfo: caseInfoMsg = {},
          workflowDefinitionId: workflowDefinitionIdMsg = "",
          workflowId: workflowIdMsg = "",
          actionlistPre: actionlistPreMsg,
        } = otherInfo || {};

        // if (!actionlistPreMsg) {
        //   PilotManager.clear();
        // }

        // Step1: 插件是否登陆。 没登陆则广播
        console.log("pilot-start 0");
        const isCheckAuth = await UserManager.checkAuth();

        console.log("pilot-start 1", isCheckAuth);
        if (!isCheckAuth) {
          this.postConnectMessage({
            type: `ginkgoo-background-all-auth-check`,
            value: isCheckAuth,
          });
          return;
        }

        // Step2: 判断是否有本次运行过的 pilot ，以 caseId 为依据。 没有则创建一个workflow，新打开一个tab
        // Step3: 该pilot绑定的tabId目前是否存在。 如果不存在则创建一个workflow，新打开一个tab
        const pilotInfo = PilotManager.getPilot({ caseId: caseInfoMsg.id, workflowId: workflowIdMsg });
        const tabInfoForPilot = pilotInfo?.pilotTabInfo?.id && (await ChromeManager.getTabInfo(pilotInfo?.pilotTabInfo?.id));

        console.log("pilot-start 2", pilotInfo, tabInfoForPilot);
        if (isNewWorkflow || !pilotInfo || !tabInfoForPilot) {
          const pilotInfoNew = await PilotManager.createPilot({
            caseInfo: caseInfoMsg,
            workflowDefinitionId: workflowDefinitionIdMsg,
            pilot: {
              pilotStatus: PilotStatusEnum.OPEN,
            },
          });

          console.log("pilot-start 3", pilotInfoNew);
          if (!pilotInfoNew) {
            this.postConnectMessage({
              type: `ginkgoo-background-all-pilot-start-failed`,
              typeToast: "error",
              contentToast: MESSAGE.TOAST_CREATE_WORKFLOW_FAILED,
            });
            return;
          }

          const tabInfo = await ChromeManager.createTab({
            url: PilotManager.getPilotHostUrl({
              caseInfo: caseInfoMsg,
            }),
            active: true,
          });
          console.log("pilot-start 4", tabInfo);

          await PilotManager.updatePilotMap({
            workflowId: pilotInfoNew.pilotWorkflowInfo?.workflow_instance_id || "",
            update: {
              pilotTabInfo: tabInfo,
            },
          });
          console.log("pilot-start 5");

          return;
        }

        console.log("pilot-start 6");

        if (pilotInfo.pilotTabInfo?.id) {
          ChromeManager.updateTab(pilotInfo.pilotTabInfo?.id, { active: true });
        }

        await PilotManager.start({
          pilotInfo,
          actionlistPre: actionlistPreMsg,
        });

        console.log("pilot-start 7");
        break;
      }
      case "ginkgoo-page-all-pilot-stop":
      case "ginkgoo-sidepanel-all-pilot-stop": {
        const { workflowId: workflowIdMsg } = otherInfo || {};

        PilotManager.stop({ workflowId: workflowIdMsg });
        break;
      }
      case "ginkgoo-page-background-pilot-query":
      case "ginkgoo-sidepanel-background-pilot-query": {
        const { workflowId: workflowIdMsg, tabId: tabIdMsg } = otherInfo || {};
        const pilotInfo =
          workflowIdMsg || tabIdMsg
            ? PilotManager.getPilot({
                tabId: tabIdMsg,
                workflowId: workflowIdMsg,
              })
            : PilotManager.getPilotActived();

        this.postConnectMessage({
          type: `ginkgoo-background-all-pilot-update`,
          pilotInfo,
          sourceMessage: message,
        });
        break;
      }
      case "ginkgoo-page-background-workflow-detail-query":
      case "ginkgoo-sidepanel-background-workflow-detail-query": {
        const { workflowId: workflowIdMsg } = otherInfo || {};

        const resWorkflowDetail = await Api.Ginkgoo.getWorkflowDetail({
          workflowId: workflowIdMsg,
        });

        this.postConnectMessage({
          type: `ginkgoo-background-all-workflow-detail-query`,
          workflowInfo: resWorkflowDetail,
        });
        break;
      }
      case "ginkgoo-page-background-pilot-step-query":
      case "ginkgoo-sidepanel-background-pilot-step-query": {
        const { workflowId: workflowIdMsg, stepKey: stepKeyMsg } = otherInfo || {};

        PilotManager.queryWorkflowStep({
          workflowId: workflowIdMsg,
          stepKey: stepKeyMsg,
        });
        break;
      }
      case "ginkgoo-sidepanel-sidepanel-cookies-query": {
        const { tabInfo } = otherInfo || {};
        const resCookies = await ChromeManager.getSyncCookiesCore(tabInfo);

        messageNew.cookiesInfo = resCookies;
        this.postConnectMessage(messageNew);
        break;
      }
      case "ginkgoo-page-background-sidepanel-open":
      case "ginkgoo-sidepanel-background-sidepanel-open": {
        const { options } = otherInfo || {};
        console.log("background-sidepanel-open", options);
        await ChromeManager.openSidePanel(options as chrome.sidePanel.OpenOptions);

        setTimeout(async () => {
          const isCheckAuth = await UserManager.checkAuth();
          if (!isCheckAuth) {
            this.postConnectMessage({
              type: `ginkgoo-background-sidepanel-page-reload`,
            });
          }
        }, 500);
        break;
      }
      case "ginkgoo-sidepanel-background-sidepanel-mounted": {
        this.postConnectMessage({
          type: `ginkgoo-background-all-sidepanel-mounted`,
        });
        break;
      }
      case "ginkgoo-sidepanel-background-sidepanel-destory": {
        this.postConnectMessage({
          type: `ginkgoo-background-all-sidepanel-destory`,
        });
        break;
      }
      case "ginkgoo-page-background-logout": {
        UserManager.logout();
        break;
      }
      default: {
        console.log("[Ginkgoo] BackgroundEventManager onConnectCommon", port, message);
        break;
      }
    }

    return true;
  };
}

export default BackgroundEventManager.getInstance();
