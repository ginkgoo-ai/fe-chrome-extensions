import md5 from "blueimp-md5";
import dayjs from "dayjs";
import { MESSAGE } from "@/common/config/message";
import BackgroundEventManager from "@/common/kits/BackgroundEventManager";
import ChromeManager from "@/common/kits/ChromeManager";
import HTMLManager from "@/common/kits/HTMLManager";
import UtilsManager from "@/common/kits/UtilsManager";
import Api from "@/common/kits/api";
import { mock_pilotManager_actionList } from "@/common/kits/mock";
import { ActionResultType, IActionItemType, IStepItemType, PilotStatusEnum } from "@/common/types/case";

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
      caseId: string;
      fill_data: Record<string, unknown>;
      tabInfo: chrome.tabs.Tab;
      timer: NodeJS.Timeout | null;
      pilotStatus: PilotStatusEnum;
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

  getPilot = (params: { caseId?: string; tabId?: number }) => {
    const { caseId, tabId } = params || {};

    return Array.from(this.pilotMap.values()).find((pilot) => {
      // 如果提供了 caseId
      if (caseId && pilot.caseId !== caseId) {
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

  updatePilotMap = (params: { caseId: string; update: Record<string, any> }) => {
    const { caseId, update } = params || {};
    const pilot = this.pilotMap.get(caseId);

    if (pilot) {
      Object.keys(update).forEach((key) => {
        (pilot as any)[key] = update[key];
      });
    }
  };

  updatePilotMapForAddStep = (params: { caseId: string; update: { title: string; descriptionText: string } }) => {
    const { caseId, update } = params || {};
    const { title, descriptionText } = update || {};

    const pilotFind = this.pilotMap.get(caseId);

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

  updatePilotMapForUpdateStep = (params: { caseId: string; update: { stepcurrent?: number; actionlist: IActionItemType[] } }) => {
    const { caseId, update } = params || {};
    const { stepcurrent = 0, actionlist = [] } = update || {};

    const pilotFind = this.pilotMap.get(caseId);

    if (pilotFind) {
      pilotFind.stepListItems[pilotFind.stepListCurrent].actioncurrent = stepcurrent;
      pilotFind.stepListItems[pilotFind.stepListCurrent].actionlist = actionlist;
    }
  };

  updatePilotMapForUpdateAction = (params: {
    caseId: string;
    update: { actioncurrent?: number; actionresult?: ActionResultType; actiontimestamp?: string };
  }) => {
    const { caseId, update } = params || {};
    const { actioncurrent = 0, actionresult = "", actiontimestamp = "" } = update || {};

    const pilotFind = this.pilotMap.get(caseId);

    if (pilotFind) {
      pilotFind.stepListItems[pilotFind.stepListCurrent].actioncurrent = actioncurrent;
      pilotFind.stepListItems[pilotFind.stepListCurrent].actionlist[actioncurrent].actionresult = actionresult;
      pilotFind.stepListItems[pilotFind.stepListCurrent].actionlist[actioncurrent].actiontimestamp = actiontimestamp;
    }
  };

  queryHtmlInfo = async (params: { caseId: string; tabInfo?: chrome.tabs.Tab }) => {
    const { caseId, tabInfo } = params || {};
    const pilotItem = this.getPilot({ caseId });

    if (!tabInfo || !pilotItem) {
      return { result: false };
    }

    const resQueryHtmlInfo = await ChromeManager.executeScript(tabInfo, {
      cbName: "queryHtmlInfo",
      cbParams: {},
    });

    const html = resQueryHtmlInfo?.[0]?.result;

    if (!html) {
      // setAlertTip({ type: "error", message: MESSAGE.NOT_SUPPORT_PAGE });
      pilotItem.pilotStatus = PilotStatusEnum.NOT_SUPPORT;
      BackgroundEventManager.postConnectMessage({
        type: `ginkgo-background-all-case-update`,
        caseId,
        pilotItem,
      });
      return { result: false };
    }

    const { rootHtml, mainHtml, h1Text } = HTMLManager.cleansingHtml({ html });
    const title = h1Text || "Unknown Page";
    const htmlCleansing = mainHtml || rootHtml;

    const hash = md5(title + htmlCleansing);

    if (hash === pilotItem?.repeatHash) {
      this.updatePilotMap({
        caseId,
        update: {
          repeatCurrent: pilotItem?.repeatCurrent + 1,
        },
      });
    } else {
      this.updatePilotMap({
        caseId,
        update: {
          repeatCurrent: 1,
          repeatHash: hash,
        },
      });
    }

    if (Number(pilotItem?.repeatCurrent) > this.REPEAT_MAX) {
      // setAlertTip({ type: "error", message: MESSAGE.REPEAT_MAX_TIP });
      this.updatePilotMapForAddStep({
        caseId,
        update: {
          title: title + `(Repeat: max)`,
          descriptionText: MESSAGE.REPEAT_MAX_TIP,
        },
      });
      return { result: false };
    }

    this.updatePilotMapForAddStep({
      caseId,
      update: {
        title: title + (pilotItem?.repeatCurrent > 1 ? `(Repeat: ${pilotItem?.repeatCurrent})` : ""),
        descriptionText: "Analyzing",
      },
    });

    return { result: true, title, htmlCleansing };
  };

  queryActionList = async (params: { caseId: string; tabInfo?: chrome.tabs.Tab; title?: string; htmlCleansing?: string }) => {
    const isMock = false;
    const { caseId, tabInfo, title = "", htmlCleansing = "" } = params || {};
    const pilotItem = this.getPilot({ caseId });
    let actionlist: IActionItemType[];

    if (!tabInfo || !pilotItem) {
      return { result: false };
    }

    if (isMock) {
      await UtilsManager.sleep(Math.floor(Math.random() * this.DELAY_MOCK_ANALYSIS + 1000));
      actionlist = mock_pilotManager_actionList[title]?.actions;
    } else {
      const resAssistent = await Api.Ginkgo.getAssistent({
        body: {
          message: htmlCleansing,
          fill_data: pilotItem.fill_data,
          trace_id: caseId,
        },
      });

      actionlist = resAssistent?.result?.actions;
    }

    if (!actionlist) {
      this.updatePilotMapForAddStep({
        caseId,
        update: {
          title: MESSAGE.FEATURE_COMING_SOON,
          descriptionText: MESSAGE.FEATURE_COMING_SOON_TIP,
        },
      });
      pilotItem.pilotStatus = PilotStatusEnum.COMING_SOON;
      BackgroundEventManager.postConnectMessage({
        type: `ginkgo-background-all-case-update`,
        caseId,
        pilotItem,
      });
      return { result: false };
    }

    this.updatePilotMapForUpdateStep({
      caseId,
      update: {
        actionlist,
      },
    });

    return { result: true, actionlist };
  };

  executeActionList = async (params: { caseId: string; tabInfo?: chrome.tabs.Tab; title?: string; actionlist?: IActionItemType[] }) => {
    const { caseId, tabInfo, title = "", actionlist = [] } = params || {};
    const pilotItem = this.getPilot({ caseId });

    if (!tabInfo || !pilotItem) {
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
        caseId,
        update: {
          actioncurrent: i,
          actionresult: type,
          actiontimestamp: dayjs().format("YYYY-MM-DD HH:mm:ss:SSS"),
        },
      });
      BackgroundEventManager.postConnectMessage({
        type: `ginkgo-background-all-case-update`,
        pilotStatus: PilotStatusEnum.ACTION,
        caseId,
        pilotItem,
      });

      if (action.type === "manual") {
        pilotItem.pilotStatus = PilotStatusEnum.MANUAL;
        BackgroundEventManager.postConnectMessage({
          type: `ginkgo-background-all-case-update`,
          caseId,
          pilotItem,
        });
        return { result: false };
      }
    }

    return { result: true };
  };

  main = async (params: { caseId: string; tabInfo: chrome.tabs.Tab }) => {
    const { caseId = "caseId-123456", tabInfo } = params || {};
    const pilotItem = this.getPilot({ caseId });

    while (!!pilotItem) {
      // 查询页面
      pilotItem.pilotStatus = PilotStatusEnum.QUERY;
      BackgroundEventManager.postConnectMessage({
        type: `ginkgo-background-all-case-update`,
        caseId,
        pilotItem,
      });
      const resQueryHtmlInfo = await this.queryHtmlInfo(params);
      if (!pilotItem?.timer || !resQueryHtmlInfo.result) {
        break;
      }

      // 分析页面
      pilotItem.pilotStatus = PilotStatusEnum.ANALYSIS;
      BackgroundEventManager.postConnectMessage({
        type: `ginkgo-background-all-case-update`,
        caseId,
        pilotItem,
      });
      const { title, htmlCleansing } = resQueryHtmlInfo;
      const resQueryActionList = await this.queryActionList({ caseId, tabInfo, title, htmlCleansing });
      if (!pilotItem?.timer || !resQueryActionList.result) {
        break;
      }

      // 执行动作
      pilotItem.pilotStatus = PilotStatusEnum.ACTION;
      BackgroundEventManager.postConnectMessage({
        type: `ginkgo-background-all-case-update`,
        caseId,
        pilotItem,
      });
      const { actionlist } = resQueryActionList;
      const resExecuteActionList = await this.executeActionList({ caseId, tabInfo, title, actionlist });
      if (!pilotItem?.timer || !resExecuteActionList.result) {
        break;
      }

      // 等待
      pilotItem.pilotStatus = PilotStatusEnum.WAIT;
      BackgroundEventManager.postConnectMessage({
        type: `ginkgo-background-all-case-update`,
        caseId,
        pilotItem,
      });
      await UtilsManager.sleep(3000);
      if (!pilotItem?.timer) {
        break;
      }

      //
    }
  };

  open = async (params: { caseId: string; fill_data: Record<string, unknown> }) => {
    const { caseId, fill_data } = params || {};

    const tabInfo = await ChromeManager.createTab({
      url: this.caseUrlMap[caseId] || this.caseUrlMap.demo,
      active: false,
    });
    const pilotItem = {
      caseId,
      fill_data,
      tabInfo,
      timer: null,
      pilotStatus: PilotStatusEnum.OPEN,
      stepListCurrent: 0,
      stepListItems: [],
      repeatHash: "",
      repeatCurrent: 0,
    };

    this.pilotMap.set(caseId, pilotItem);

    BackgroundEventManager.postConnectMessage({
      type: `ginkgo-background-all-case-open`,
      caseId,
      pilotItem,
    });
  };

  start = (params: { caseId?: string; tabInfo: chrome.tabs.Tab }) => {
    const { caseId = "", tabInfo } = params || {};
    let pilotItem = this.getPilot({ tabId: tabInfo.id });
    if (!pilotItem) {
      pilotItem = {
        caseId,
        fill_data: {},
        tabInfo,
        timer: null,
        pilotStatus: PilotStatusEnum.HOLD,
        stepListCurrent: 0,
        stepListItems: [],
        repeatHash: "",
        repeatCurrent: 0,
      };
      this.pilotMap.set(caseId, pilotItem);
    }
    pilotItem.tabInfo = tabInfo; // update tabInfo

    const timer = setTimeout(async () => {
      await this.main({
        caseId: pilotItem.caseId,
        tabInfo: pilotItem.tabInfo,
      });
      clearTimeout(timer);
    }, 0);

    this.updatePilotMap({
      caseId: pilotItem.caseId,
      update: { timer, pilotStatus: PilotStatusEnum.HOLD },
    });
  };

  stop = (params: { caseId: string }) => {
    // 实现你的任务逻辑
    const { caseId } = params || {};
    const pilotItem = this.pilotMap.get(caseId);

    if (pilotItem) {
      if (pilotItem.timer) {
        clearTimeout(pilotItem.timer);
        pilotItem.timer = null;
      }

      // 会覆盖报错状态
      pilotItem.pilotStatus = PilotStatusEnum.HOLD;
      BackgroundEventManager.postConnectMessage({
        type: `ginkgo-background-all-case-update`,
        caseId: pilotItem?.caseId,
        pilotItem,
      });
    }

    // Don't need to delete pilotItem
    // this.pilotMap.delete(caseId);
  };
}

export default PilotManager.getInstance();
