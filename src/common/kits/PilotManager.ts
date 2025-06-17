import md5 from "blueimp-md5";
import BackgroundEventManager from "@/common/kits/BackgroundEventManager";
import ChromeManager from "@/common/kits/ChromeManager";
import HTMLManager from "@/common/kits/HTMLManager";
import UtilsManager from "@/common/kits/UtilsManager";
import Api from "@/common/kits/api";
import { IActionItemType, PilotStatusEnum } from "@/common/types/case";
import { IWorkflowStepType } from "@/common/types/casePilot";

interface IPilotType {
  caseId: string;
  workflowId: string;
  fill_data: Record<string, unknown>;
  tabInfo: chrome.tabs.Tab;
  timer: NodeJS.Timeout | null;
  pilotStatus: PilotStatusEnum;
  steps: IWorkflowStepType[];
  repeatHash: string;
  repeatCurrent: number;
  pdfUrl: string;
  cookiesStr: string;
}

interface IStepResultType {
  result: boolean;
}

interface ISelectorResult {
  [key: string]: unknown;
}

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
    "demo": "https://www.gov.uk/skilled-worker-visa/apply-from-outside-the-uk",
  };

  pilotMap: Map<string, IPilotType> = new Map();
  private updateLocks: Map<string, boolean> = new Map();

  private async acquireLock(workflowId: string): Promise<void> {
    while (this.updateLocks.get(workflowId)) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    this.updateLocks.set(workflowId, true);
  }

  private releaseLock(workflowId: string): void {
    this.updateLocks.delete(workflowId);
  }

  static getInstance(): PilotManager {
    if (!this.instance) {
      this.instance = new PilotManager();
    }
    return this.instance;
  }

  genPilot = (pilot: IPilotType): IPilotType => {
    return pilot;
  };

  getPilot = (params: { tabId?: number; caseId?: string; workflowId?: string }): IPilotType | undefined => {
    const { caseId, tabId, workflowId } = params || {};

    if (!tabId && !caseId && !workflowId) {
      return void 0;
    }

    return Array.from(this.pilotMap.values()).find((pilot) => {
      // 如果提供了 tabId，则必须匹配
      if (tabId && pilot.tabInfo?.id !== tabId) {
        return false;
      }
      // 如果提供了 caseId
      if (caseId && pilot.caseId !== caseId) {
        return false;
      }
      // 如果提供了 caseId
      if (workflowId && pilot.workflowId !== workflowId) {
        return false;
      }
      // 所有条件都满足
      return true;
    });
  };

  updatePilotMap = async (params: { workflowId: string; update: Partial<IPilotType> }) => {
    const { workflowId, update } = params || {};

    try {
      // 获取锁
      await this.acquireLock(workflowId);

      const pilot = this.pilotMap.get(workflowId);

      if (pilot) {
        Object.keys(update).forEach((key) => {
          (pilot as any)[key] = (update as any)[key];
        });
      }
    } finally {
      // 确保在finally中释放锁
      this.releaseLock(workflowId);
    }
  };

  queryWorkflowList = async (params: { workflowId: string }): Promise<IStepResultType> => {
    const { workflowId = "" } = params || {};
    const pilotInfo = this.getPilot({ workflowId });

    if (!pilotInfo) {
      return { result: false };
    }

    pilotInfo.pilotStatus = PilotStatusEnum.QUERY_WORKFLOW;
    BackgroundEventManager.postConnectMessage({
      type: `ginkgo-background-all-case-update`,
      pilotInfo,
    });

    const resWorkflowList = await Api.Ginkgo.getWorkflowList({
      workflowId,
    });

    console.log("queryWorkflowList", resWorkflowList);

    if (!resWorkflowList?.steps) {
      pilotInfo.pilotStatus = PilotStatusEnum.COMING_SOON;
      BackgroundEventManager.postConnectMessage({
        type: `ginkgo-background-all-case-update`,
        pilotInfo,
      });
      return { result: false };
    }

    await this.updatePilotMap({
      workflowId,
      update: {
        steps: resWorkflowList?.steps,
      },
    });

    BackgroundEventManager.postConnectMessage({
      type: `ginkgo-background-all-case-update`,
      pilotInfo,
    });

    return { result: true };
  };

  queryWorkflowStep = async (params: { workflowId: string; stepKey: string }): Promise<IStepResultType> => {
    const { workflowId = "", stepKey = "" } = params || {};
    const pilotInfo = this.getPilot({ workflowId });

    if (!pilotInfo) {
      return { result: false };
    }

    const resWorkflowStepData = await Api.Ginkgo.getWorkflowStepData({
      workflowId,
      stepKey,
    });

    if (!resWorkflowStepData?.data) {
      return { result: false };
    }

    const stepsNew = pilotInfo.steps.map((item) => {
      return {
        ...item,
        data: resWorkflowStepData?.data,
      };
    });

    await this.updatePilotMap({
      workflowId,
      update: {
        steps: stepsNew,
      },
    });

    BackgroundEventManager.postConnectMessage({
      type: `ginkgo-background-all-case-update`,
      pilotInfo,
    });

    return { result: true };
  };

  queryHtmlInfo = async (params: {
    workflowId: string;
    tabInfo: chrome.tabs.Tab;
  }): Promise<IStepResultType & { title?: string; htmlCleansing?: string }> => {
    const { workflowId, tabInfo } = params || {};
    const pilotInfo = this.getPilot({ workflowId });

    if (!pilotInfo) {
      return { result: false };
    }

    pilotInfo.pilotStatus = PilotStatusEnum.QUERY;
    BackgroundEventManager.postConnectMessage({
      type: `ginkgo-background-all-case-update`,
      pilotInfo,
    });

    const resQueryHtmlInfo = await ChromeManager.executeScript(tabInfo, {
      cbName: "queryHtmlInfo",
      cbParams: {},
    });

    const html = resQueryHtmlInfo?.[0]?.result;

    if (!html) {
      // setAlertTip({ type: "error", message: MESSAGE.NOT_SUPPORT_PAGE });
      pilotInfo.pilotStatus = PilotStatusEnum.NOT_SUPPORT;
      BackgroundEventManager.postConnectMessage({
        type: `ginkgo-background-all-case-update`,
        pilotInfo,
      });
      return { result: false };
    }

    const { rootHtml, mainHtml, h1Text } = HTMLManager.cleansingHtml({ html });
    const title = h1Text || "Unknown Page";
    const htmlCleansing = mainHtml || rootHtml;

    const hash = md5(title + htmlCleansing);

    if (hash === pilotInfo?.repeatHash) {
      await this.updatePilotMap({
        workflowId,
        update: {
          repeatCurrent: pilotInfo?.repeatCurrent + 1,
        },
      });
    } else {
      await this.updatePilotMap({
        workflowId,
        update: {
          repeatCurrent: 1,
          repeatHash: hash,
        },
      });
    }

    if (Number(pilotInfo?.repeatCurrent) > this.REPEAT_MAX) {
      BackgroundEventManager.postConnectMessage({
        type: `ginkgo-background-all-toast`,
        content: "Repeat Max",
      });
      // Max
      return { result: false };
    }

    return { result: true, title, htmlCleansing };
  };

  queryCookies = async (params: { workflowId: string; tabInfo: chrome.tabs.Tab }): Promise<IStepResultType> => {
    const { workflowId, tabInfo } = params || {};
    const pilotInfo = this.getPilot({ workflowId });

    if (!pilotInfo) {
      return { result: false };
    }

    const resCookies = await ChromeManager.getSyncCookiesCore(tabInfo);
    const { cookiesStr } = resCookies || {};

    // console.log("queryCookies", resCookies);

    if (cookiesStr) {
      await this.updatePilotMap({
        workflowId,
        update: {
          cookiesStr,
        },
      });
    }

    return { result: true };
  };

  queryDom = async (params: { workflowId: string; tabInfo: chrome.tabs.Tab }): Promise<IStepResultType> => {
    const { workflowId, tabInfo } = params || {};
    const pilotInfo = this.getPilot({ workflowId });

    if (!pilotInfo) {
      return { result: false };
    }

    const resHtmlInfo = await ChromeManager.executeScript(tabInfo, {
      cbName: "querySelectors",
      cbParams: {
        selectors: [
          {
            selector: `a[id="pdfLink"]`,
            attr: [{ key: "href" }],
          },
        ],
      },
    });
    const pdfUrl = (resHtmlInfo?.[0]?.result as ISelectorResult[])?.[0]?.href as string;
    // const { origin } = UtilsManager.getUrlInfo(tabInfo.url);

    if (pdfUrl) {
      await this.updatePilotMap({
        workflowId,
        update: {
          pdfUrl, // `${origin}${pdfUrl}`,
        },
      });
    }

    // console.log("queryDom", resHtmlInfo);

    return { result: true };
  };

  queryActionList = async (params: {
    workflowId: string;
    htmlCleansing?: string;
  }): Promise<IStepResultType & { actionlist?: IActionItemType[] }> => {
    const { workflowId, htmlCleansing = "" } = params || {};
    const pilotInfo = this.getPilot({ workflowId });
    let actionlist: IActionItemType[];

    if (!pilotInfo) {
      return { result: false };
    }

    pilotInfo.pilotStatus = PilotStatusEnum.ANALYSIS;
    BackgroundEventManager.postConnectMessage({
      type: `ginkgo-background-all-case-update`,
      pilotInfo,
    });

    const resWorkflowsProcessForm = await Api.Ginkgo.postWorkflowsProcessForm({
      workflowId,
      message: htmlCleansing,
      fill_data: pilotInfo.fill_data,
    });

    actionlist = resWorkflowsProcessForm?.actions;

    if (!actionlist) {
      return { result: false };
    }

    // await this.updatePilotMap({
    //   workflowId,
    //   update: {
    //     actionlist,
    //   },
    // });

    return { result: true, actionlist };
  };

  executeActionList = async (params: {
    workflowId: string;
    tabInfo: chrome.tabs.Tab;
    actionlist?: IActionItemType[];
  }): Promise<IStepResultType> => {
    const { workflowId, tabInfo, actionlist = [] } = params || {};
    const pilotInfo = this.getPilot({ workflowId });

    if (!pilotInfo) {
      return { result: false };
    }

    pilotInfo.pilotStatus = PilotStatusEnum.ACTION;
    BackgroundEventManager.postConnectMessage({
      type: `ginkgo-background-all-case-update`,
      pilotInfo,
    });

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
      console.log("executeActionList", action, type);
    }

    return { result: true };
  };

  delayStep = async (params: { workflowId: string }) => {
    const { workflowId } = params || {};
    const pilotInfo = this.getPilot({ workflowId });

    if (!pilotInfo) {
      return { result: false };
    }

    pilotInfo.pilotStatus = PilotStatusEnum.WAIT;
    BackgroundEventManager.postConnectMessage({
      type: `ginkgo-background-all-case-update`,
      pilotInfo,
    });
    await UtilsManager.sleep(this.DELAY_STEP);

    return { result: true };
  };

  main = async (pilotInfo: IPilotType) => {
    const { workflowId, tabInfo } = pilotInfo || {};

    // if (!!pilotInfo?.timer) {
    //   // 查询 workflow List
    //   const resQueryWorkflowList = await this.queryWorkflowList({ workflowId });
    //   if (!pilotInfo?.timer || !resQueryWorkflowList.result) {
    //     return;
    //   }
    // }

    // if (0 === 0) {
    //   return;
    // }

    while (!!pilotInfo?.timer) {
      // 查询 workflow List
      const resQueryWorkflowList = await this.queryWorkflowList({ workflowId });
      if (!pilotInfo?.timer || !resQueryWorkflowList.result) {
        return;
      }

      // 查询页面
      const resQueryHtmlInfo = await this.queryHtmlInfo({ workflowId, tabInfo });
      if (!pilotInfo?.timer || !resQueryHtmlInfo.result) {
        break;
      }

      // 查询cookies
      const resQueryCookies = await this.queryCookies({ workflowId, tabInfo });
      if (!pilotInfo?.timer || !resQueryCookies.result) {
        break;
      }

      // 查询pdf Url
      const resQueryDom = await this.queryDom({ workflowId, tabInfo });
      if (!pilotInfo?.timer || !resQueryDom.result) {
        break;
      }

      // 分析页面
      const { title, htmlCleansing } = resQueryHtmlInfo;
      const resQueryActionList = await this.queryActionList({ workflowId, htmlCleansing });
      if (!pilotInfo?.timer || !resQueryActionList.result) {
        break;
      }

      // 执行动作
      const { actionlist } = resQueryActionList;
      const resExecuteActionList = await this.executeActionList({ workflowId, tabInfo, actionlist });
      if (!pilotInfo?.timer || !resExecuteActionList.result) {
        break;
      }

      // 等待
      const resDelayStep = await this.delayStep({ workflowId });
      if (!pilotInfo?.timer || !resDelayStep.result) {
        break;
      }
    }
  };

  open = async (params: { caseId: string; workflowId: string; fill_data: Record<string, unknown> }) => {
    const { caseId, workflowId, fill_data } = params || {};

    const tabInfo = await ChromeManager.createTab({
      url: this.caseUrlMap[caseId] || this.caseUrlMap.demo,
      active: false,
    });
    const pilotInfo = {
      caseId,
      workflowId,
      fill_data,
      tabInfo,
      timer: null,
      pilotStatus: PilotStatusEnum.OPEN,
      steps: [],
      repeatHash: "",
      repeatCurrent: 0,
      pdfUrl: "",
      cookiesStr: "",
    };

    this.pilotMap.set(workflowId, pilotInfo);

    BackgroundEventManager.postConnectMessage({
      type: `ginkgo-background-all-case-open`,
      caseId,
      pilotInfo,
    });
  };

  start = async (params: { tabInfo: chrome.tabs.Tab; caseId?: string; workflowId?: string; fill_data?: Record<string, unknown> }) => {
    const { tabInfo, caseId = "", workflowId = "", fill_data = {} } = params || {};
    let pilotInfo = this.getPilot({ tabId: tabInfo.id });

    if (!pilotInfo) {
      pilotInfo = this.genPilot({
        caseId,
        workflowId,
        fill_data,
        tabInfo,
        timer: null,
        pilotStatus: PilotStatusEnum.HOLD,
        steps: [],
        repeatHash: "",
        repeatCurrent: 0,
        pdfUrl: "",
        cookiesStr: "",
      });
      this.pilotMap.set(workflowId, pilotInfo);
    }
    // pilotInfo.tabInfo = tabInfo; // update tabInfo

    const timer = setTimeout(async () => {
      await this.main(pilotInfo);
      clearTimeout(timer);
    }, 0);

    await this.updatePilotMap({
      workflowId: pilotInfo.workflowId,
      update: { timer, pilotStatus: PilotStatusEnum.HOLD },
    });
  };

  stop = (params: { workflowId: string }) => {
    // 实现你的任务逻辑
    const { workflowId } = params || {};
    const pilotInfo = this.pilotMap.get(workflowId);

    if (pilotInfo) {
      if (pilotInfo.timer) {
        clearTimeout(pilotInfo.timer);
        pilotInfo.timer = null;
      }

      // 会覆盖报错状态
      pilotInfo.pilotStatus = PilotStatusEnum.HOLD;
      pilotInfo.repeatHash = "";
      pilotInfo.repeatCurrent = 0;
      BackgroundEventManager.postConnectMessage({
        type: `ginkgo-background-all-case-update`,
        pilotInfo,
      });
    }

    // Don't need to delete pilotInfo
    // this.pilotMap.delete(caseId);
  };

  delete = (params: { workflowId?: string; tabId?: number }) => {
    const pilotInfo = this.getPilot(params);
    if (pilotInfo?.workflowId) {
      this.pilotMap.delete(pilotInfo.workflowId);
    }
  };
}

export default PilotManager.getInstance();
