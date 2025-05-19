import md5 from "blueimp-md5";
import dayjs from "dayjs";
import { MESSAGE } from "@/common/config/message";
import BackgroundEventManager from "@/common/kits/BackgroundEventManager";
import ChromeManager from "@/common/kits/ChromeManager";
import HTMLManager from "@/common/kits/HTMLManager";
import UtilsManager from "@/common/kits/UtilsManager";
import Api from "@/common/kits/api";
import { mock_pilotManager_actionList } from "@/common/kits/mock";
import { ActionResultType, IActionItemType, IStepItemType, PilotStatusEnum } from "@/common/types/pilot.t";

/**
 * @description 处理HTML管理器
 */

class PilotManager {
  static instance: PilotManager | null = null;

  DELAY_MOCK_ANALYSIS = 2000;
  DELAY_STEP = 2000;
  DELAY_ACTION = 1000;
  REPEAT_MAX = 5;

  caseUrlMap: Record<string, string> = {
    "demo": "https://visas-immigration.service.gov.uk/your-location",
  };

  pilotMap: Map<
    string,
    {
      pilotId: string;
      caseId: string;
      tabInfo: chrome.tabs.Tab;
      timer: NodeJS.Timeout | null;
      status: string;
      stepListCurrent: number;
      stepListItems: IStepItemType[];
      repeatHash: string;
      repeatCurrent: number;
    }
  > = new Map();

  static getInstance(): PilotManager {
    if (!this.instance) {
      this.instance = new PilotManager();
    }
    return this.instance;
  }

  getPilot = (params: { pilotId?: string; tabId?: number }) => {
    const { pilotId, tabId } = params || {};

    return Array.from(this.pilotMap.values()).find((pilot) => {
      // 如果提供了 pilotId，则必须匹配
      if (pilotId && pilot.pilotId !== pilotId) {
        return false;
      }
      // 如果提供了 tabId，则必须匹配
      if (tabId && pilot.tabInfo?.id !== tabId) {
        return false;
      }
      // 所有条件都满足
      return true;
    });
  };

  updatePilotMap = (params: { pilotId: string; update: Record<string, any> }) => {
    const { pilotId, update } = params || {};
    const pilot = this.pilotMap.get(pilotId);

    if (pilot) {
      Object.keys(update).forEach((key) => {
        (pilot as any)[key] = update[key];
      });
    }
  };

  updatePilotMapForAddStep = (params: { pilotId: string; update: { title: string; descriptionText: string } }) => {
    const { pilotId, update } = params || {};
    const { title, descriptionText } = update || {};

    const pilotFind = this.pilotMap.get(pilotId);

    if (pilotFind) {
      pilotFind.stepListItems.push({
        title: title,
        descriptionText: descriptionText,
        actioncurrent: 0,
        actionlist: [],
      });
      pilotFind.stepListCurrent = pilotFind.stepListItems.length - 1;
    }
  };

  updatePilotMapForUpdateStep = (params: { pilotId: string; update: { stepcurrent?: number; actionlist: IActionItemType[] } }) => {
    const { pilotId, update } = params || {};
    const { stepcurrent = 0, actionlist = [] } = update || {};

    const pilotFind = this.pilotMap.get(pilotId);

    if (pilotFind) {
      pilotFind.stepListItems[pilotFind.stepListCurrent].actioncurrent = stepcurrent;
      pilotFind.stepListItems[pilotFind.stepListCurrent].actionlist = actionlist;
    }
  };

  updatePilotMapForUpdateAction = (params: {
    pilotId: string;
    update: { actioncurrent?: number; actionresult?: ActionResultType; actiontimestamp?: string };
  }) => {
    const { pilotId, update } = params || {};
    const { actioncurrent = 0, actionresult = "", actiontimestamp = "" } = update || {};

    const pilotFind = this.pilotMap.get(pilotId);

    if (pilotFind) {
      pilotFind.stepListItems[pilotFind.stepListCurrent].actioncurrent = actioncurrent;
      pilotFind.stepListItems[pilotFind.stepListCurrent].actionlist[actioncurrent].actionresult = actionresult;
      pilotFind.stepListItems[pilotFind.stepListCurrent].actionlist[actioncurrent].actiontimestamp = actiontimestamp;
    }
  };

  queryHtmlInfo = async (params: { pilotId: string; caseId: string; tabInfo?: chrome.tabs.Tab }) => {
    const { pilotId, caseId, tabInfo } = params || {};
    const pilotItem = this.getPilot({ pilotId });

    if (!tabInfo) {
      return { result: false };
    }

    const resQueryHtmlInfo = await ChromeManager.executeScript(tabInfo, {
      cbName: "queryHtmlInfo",
      cbParams: {},
    });

    const html = resQueryHtmlInfo?.[0]?.result;

    if (!html) {
      // setAlertTip({ type: "error", message: MESSAGE.NOT_SUPPORT_PAGE });
      BackgroundEventManager.postConnectMessage({
        type: `ginkgo-background-all-pilot-not-support`,
        pilotId,
        pilotItem,
      });
      return { result: false };
    }

    const { rootHtml, mainHtml, h1Text } = HTMLManager.cleansingHtml({ html });
    const title = h1Text || "Unknown Page";
    const htmlCleansing = mainHtml || rootHtml;

    const hash = md5(title + htmlCleansing);
    console.log("queryHtmlInfo hash", hash, title);
    if (!pilotItem) {
      BackgroundEventManager.postConnectMessage({
        type: `ginkgo-background-all-pilot-no-pilot`,
        pilotId,
        pilotItem,
      });
      return { result: false };
    }

    if (hash === pilotItem?.repeatHash) {
      this.updatePilotMap({
        pilotId,
        update: {
          repeatCurrent: pilotItem?.repeatCurrent + 1,
        },
      });
    } else {
      this.updatePilotMap({
        pilotId,
        update: {
          repeatCurrent: 1,
          repeatHash: hash,
        },
      });
    }

    if (Number(pilotItem?.repeatCurrent) > this.REPEAT_MAX) {
      // setAlertTip({ type: "error", message: MESSAGE.REPEAT_MAX_TIP });
      this.updatePilotMapForAddStep({
        pilotId,
        update: {
          title: title + `(Repeat: max)`,
          descriptionText: MESSAGE.REPEAT_MAX_TIP,
        },
      });
      return { result: false };
    }

    this.updatePilotMapForAddStep({
      pilotId,
      update: {
        title: title + (pilotItem?.repeatCurrent > 1 ? `(Repeat: ${pilotItem?.repeatCurrent})` : ""),
        descriptionText: "Analyzing",
      },
    });

    return { result: true, title, htmlCleansing };
  };

  queryActionList = async (params: {
    pilotId: string;
    caseId: string;
    tabInfo?: chrome.tabs.Tab;
    title?: string;
    htmlCleansing?: string;
  }) => {
    const isMock = true;
    const { pilotId, caseId, tabInfo, title = "", htmlCleansing = "" } = params || {};
    const pilotItem = this.getPilot({ pilotId });
    let actionlist: IActionItemType[] = [];

    if (!tabInfo) {
      return { result: false };
    }

    if (isMock) {
      await UtilsManager.sleep(Math.floor(Math.random() * this.DELAY_MOCK_ANALYSIS + 1000));
      actionlist = mock_pilotManager_actionList[title]?.actions || [];
    } else {
      const resAssistent = await Api.Ginkgo.getAssistent({
        body: {
          message: htmlCleansing,
        },
      });

      actionlist = resAssistent?.result?.actions || [];
    }

    if (actionlist.length === 0) {
      this.updatePilotMapForAddStep({
        pilotId,
        update: {
          title: MESSAGE.FEATURE_COMING_SOON,
          descriptionText: MESSAGE.FEATURE_COMING_SOON_TIP,
        },
      });
      BackgroundEventManager.postConnectMessage({
        type: `ginkgo-background-all-pilot-coming-soon`,
        pilotId,
        pilotItem,
      });
      return { result: false };
    }

    this.updatePilotMapForUpdateStep({
      pilotId,
      update: {
        actionlist,
      },
    });

    return { result: true, actionlist };
  };

  executeActionList = async (params: {
    pilotId: string;
    caseId: string;
    tabInfo?: chrome.tabs.Tab;
    title?: string;
    actionlist?: IActionItemType[];
  }) => {
    const { pilotId, caseId, tabInfo, title = "", actionlist = [] } = params || {};
    const pilotItem = this.getPilot({ pilotId });

    if (!tabInfo) {
      return { result: false };
    }

    for (let i = 0; i < actionlist.length; i++) {
      const action = actionlist[i];

      if (i !== 0) {
        await UtilsManager.sleep(this.DELAY_ACTION);
      }

      const resActionDom = await ChromeManager.executeScript(tabInfo, {
        cbName: "actionDom",
        cbParams: {
          action,
        },
      });

      const { type } = resActionDom?.[0]?.result || {};

      this.updatePilotMapForUpdateAction({
        pilotId,
        update: {
          actioncurrent: i,
          actionresult: type,
          actiontimestamp: dayjs().format("YYYY-MM-DD HH:mm:ss:SSS"),
        },
      });
      BackgroundEventManager.postConnectMessage({
        type: `ginkgo-background-all-pilot-update`,
        pilotStatus: PilotStatusEnum.ACTION,
        pilotId,
        pilotItem,
      });

      if (action.type === "manual") {
        BackgroundEventManager.postConnectMessage({
          type: `ginkgo-background-all-pilot-manual`,
          pilotId,
          pilotItem,
        });
        return { result: false };
      }
    }

    return { result: true };
  };

  main = async (params: { pilotId: string; caseId: string; tabInfo: chrome.tabs.Tab }) => {
    const { pilotId, caseId = "demo", tabInfo } = params || {};
    const pilotItem = this.getPilot({ pilotId });

    while (true) {
      // 查询页面
      BackgroundEventManager.postConnectMessage({
        type: `ginkgo-background-all-pilot-update`,
        pilotStatus: PilotStatusEnum.QUERY,
        pilotId,
        pilotItem,
      });
      const resQueryHtmlInfo = await this.queryHtmlInfo(params);
      if (!pilotItem?.timer || !resQueryHtmlInfo.result) {
        break;
      }
      // 分析页面
      BackgroundEventManager.postConnectMessage({
        type: `ginkgo-background-all-pilot-update`,
        pilotStatus: PilotStatusEnum.ANALYSIS,
        pilotId,
        pilotItem,
      });
      const { title, htmlCleansing } = resQueryHtmlInfo;
      const resQueryActionList = await this.queryActionList({ pilotId, caseId, tabInfo, title, htmlCleansing });
      if (!pilotItem?.timer || !resQueryActionList.result) {
        break;
      }
      // 执行动作
      BackgroundEventManager.postConnectMessage({
        type: `ginkgo-background-all-pilot-update`,
        pilotStatus: PilotStatusEnum.ACTION,
        pilotId,
        pilotItem,
      });
      const { actionlist } = resQueryActionList;
      const resExecuteActionList = await this.executeActionList({ pilotId, caseId, tabInfo, title, actionlist });
      if (!pilotItem?.timer || !resExecuteActionList.result) {
        break;
      }

      // 等待
      BackgroundEventManager.postConnectMessage({
        type: `ginkgo-background-all-pilot-update`,
        pilotStatus: PilotStatusEnum.WAIT,
        pilotId,
        pilotItem,
      });
      await UtilsManager.sleep(3000);
      if (!pilotItem?.timer) {
        break;
      }

      // break;

      // 分析页面

      // 获取当前的HTML信息
      // const html = await this.queryHtmlInfo(url);
      // 获取当前的HTML信息
      // const html = await this.queryHtmlInfo(url);
      // 获取当前的HTML信息
    }
  };

  open = async (params: { pilotId: string; caseId: string }) => {
    const { pilotId, caseId } = params || {};

    BackgroundEventManager.postConnectMessage({
      type: `ginkgo-background-all-pilot-open`,
      pilotId,
    });
    const tabInfo = await ChromeManager.createTab({
      url: this.caseUrlMap[caseId],
      active: false,
    });

    this.pilotMap.set(pilotId, {
      pilotId,
      caseId,
      tabInfo,
      timer: null,
      status: PilotStatusEnum.OPEN,
      stepListCurrent: 0,
      stepListItems: [],
      repeatHash: "",
      repeatCurrent: 0,
    });
  };

  start = (params: { pilotId?: string; caseId?: string; tabInfo: chrome.tabs.Tab }) => {
    const { pilotId = "", caseId = "", tabInfo } = params || {};
    let pilotItem = this.getPilot({ tabId: tabInfo.id });
    if (!pilotItem) {
      pilotItem = {
        pilotId,
        caseId,
        tabInfo,
        timer: null,
        status: PilotStatusEnum.HOLD,
        stepListCurrent: 0,
        stepListItems: [],
        repeatHash: "",
        repeatCurrent: 0,
      };
      this.pilotMap.set(pilotId, pilotItem);
    }
    pilotItem.tabInfo = tabInfo; // update tabInfo

    const timer = setTimeout(async () => {
      await this.main({
        pilotId: pilotItem.pilotId,
        caseId: pilotItem.caseId,
        tabInfo: pilotItem.tabInfo,
      });
      clearTimeout(timer);
    }, 0);

    this.updatePilotMap({
      pilotId: pilotItem.pilotId,
      update: { timer },
    });
  };

  stop = (params: { pilotId: string }) => {
    // 实现你的任务逻辑
    const { pilotId } = params || {};
    const pilotItem = this.pilotMap.get(pilotId);

    if (pilotItem?.timer) {
      clearTimeout(pilotItem.timer);
      pilotItem.timer = null;
    }

    // 会覆盖报错状态
    BackgroundEventManager.postConnectMessage({
      type: `ginkgo-background-all-pilot-hold`,
      pilotId: pilotItem?.pilotId,
      pilotItem,
    });

    // Don't need to delete pilotItem
    // this.pilotMap.delete(pilotId);
  };
}

export default PilotManager.getInstance();
