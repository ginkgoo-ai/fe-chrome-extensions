import md5 from "blueimp-md5";
import { cloneDeep } from "lodash";
import { v4 as uuidV4 } from "uuid";
import BackgroundEventManager from "@/common/kits/BackgroundEventManager";
import ChromeManager from "@/common/kits/ChromeManager";
import HTMLManager from "@/common/kits/HTMLManager";
import LockManager from "@/common/kits/LockManager";
import UserManager from "@/common/kits/UserManager";
import UtilsManager from "@/common/kits/UtilsManager";
import Api from "@/common/kits/api";
import { IActionItemType } from "@/common/types/case";
import { IPilotType, ISelectorResult, IStepResultType, PilotStatusEnum } from "@/common/types/casePilot";

/**
 * @description 处理HTML管理器
 */

class PilotManager {
  static instance: PilotManager | null = null;

  DELAY_MOCK_ANALYSIS = 2000;
  DELAY_STEP = 2000;
  DELAY_ACTION = 1000;
  REPEAT_MAX = 5;

  pilotMap: Map<string, IPilotType> = new Map();

  static getInstance(): PilotManager {
    if (!this.instance) {
      this.instance = new PilotManager();
    }
    return this.instance;
  }

  genPilot = (pilot: IPilotType): IPilotType => {
    return pilot;
  };

  getPilot = (params: { id?: string; tabId?: number; caseId?: string; workflowId?: string }): IPilotType | undefined => {
    const { id, caseId, tabId, workflowId } = params || {};

    if (!id && !tabId && !caseId && !workflowId) {
      return void 0;
    }

    return Array.from(this.pilotMap.values()).find((pilot) => {
      // 如果提供了 id
      if (id && pilot.id !== id) {
        return false;
      }
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
    const lockId = `workflowId-${workflowId}`;

    try {
      // 获取锁
      await LockManager.acquireLock(lockId);

      const pilot = this.pilotMap.get(workflowId);

      if (pilot) {
        Object.keys(update).forEach((key) => {
          (pilot as any)[key] = (update as any)[key];
        });
      }
    } finally {
      // 确保在finally中释放锁
      LockManager.releaseLock(lockId);
    }
  };

  queryWorkflowDetail = async (params: { workflowId: string }): Promise<IStepResultType> => {
    const { workflowId = "" } = params || {};
    const pilotInfo = this.getPilot({ workflowId });

    if (!pilotInfo) {
      return { result: false };
    }

    pilotInfo.pilotStatus = PilotStatusEnum.QUERY_WORKFLOW;
    BackgroundEventManager.postConnectMessage({
      type: `ginkgoo-background-all-case-update`,
      pilotInfo,
    });

    const resWorkflowDetail = await Api.Ginkgoo.getWorkflowDetail({
      workflowId,
    });

    // console.log("queryWorkflowDetail", resWorkflowDetail);

    if (!resWorkflowDetail?.steps) {
      pilotInfo.pilotStatus = PilotStatusEnum.COMING_SOON;
      BackgroundEventManager.postConnectMessage({
        type: `ginkgoo-background-all-case-update`,
        pilotInfo,
      });
      return { result: false };
    }

    await this.updatePilotMap({
      workflowId,
      update: {
        progress_file_id: resWorkflowDetail?.progress_file_id,
        dummy_data_usage: resWorkflowDetail?.dummy_data_usage,
        steps: resWorkflowDetail?.steps,
      },
    });

    BackgroundEventManager.postConnectMessage({
      type: `ginkgoo-background-all-case-update`,
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

    const resWorkflowStepData = await Api.Ginkgoo.getWorkflowStepData({
      workflowId,
      stepKey,
    });

    if (!resWorkflowStepData?.data) {
      return { result: false };
    }

    const stepsNew = pilotInfo.steps.map((item) => {
      return {
        ...item,
        data: item.step_key === stepKey ? resWorkflowStepData?.data : item.data,
      };
    });

    await this.updatePilotMap({
      workflowId,
      update: {
        steps: stepsNew,
      },
    });

    BackgroundEventManager.postConnectMessage({
      type: `ginkgoo-background-all-case-update`,
      pilotInfo,
    });

    return { result: true };
  };

  queryFillData = async (params: { caseId: string }): Promise<Record<string, unknown>> => {
    const { caseId } = params || {};
    const resCaseDetail = await await Api.Ginkgoo.queryCaseDetail({
      caseId,
    });
    if (resCaseDetail?.profileData) {
      return resCaseDetail?.profileData;
    } else {
      BackgroundEventManager.postConnectMessage({
        type: `ginkgoo-background-all-toast`,
        typeToast: "error",
        contentToast: "Query fill data failed.",
      });
      return {};
    }
  };

  queryWorkflowId = async (params: { userId: string; caseId: string; workflowDefinitionId: string }): Promise<string> => {
    const { userId, caseId, workflowDefinitionId } = params || {};
    const res = await Api.Ginkgoo.createWorkflow({
      user_id: userId,
      case_id: caseId,
      workflow_definition_id: workflowDefinitionId,
    });

    if (!res?.workflow_instance_id) {
      BackgroundEventManager.postConnectMessage({
        type: `ginkgoo-background-all-toast`,
        typeToast: "error",
        contentToast: "Create workflow failed.",
      });
    }

    return res?.workflow_instance_id;
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
      type: `ginkgoo-background-all-case-update`,
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
        type: `ginkgoo-background-all-case-update`,
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

    console.log("queryHtmlInfo", hash, pilotInfo?.repeatHash, Number(pilotInfo?.repeatCurrent));

    if (Number(pilotInfo?.repeatCurrent) > this.REPEAT_MAX) {
      BackgroundEventManager.postConnectMessage({
        type: `ginkgoo-background-all-toast`,
        typeToast: "info",
        contentToast: "Repeat Max",
      });
      // Max
      pilotInfo.pilotStatus = PilotStatusEnum.HOLD;
      BackgroundEventManager.postConnectMessage({
        type: `ginkgoo-background-all-case-update`,
        pilotInfo,
      });
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
      type: `ginkgoo-background-all-case-update`,
      pilotInfo,
    });

    const resWorkflowsProcessForm = await Api.Ginkgoo.postWorkflowsProcessForm({
      workflowId,
      form_html: htmlCleansing,
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
      type: `ginkgoo-background-all-case-update`,
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
      type: `ginkgoo-background-all-case-update`,
      pilotInfo,
    });
    await UtilsManager.sleep(this.DELAY_STEP);

    return { result: true };
  };

  uploadAndBindPDF = async (params: { workflowId: string; pdfUrl: string; cookiesStr: string }) => {
    const { workflowId, pdfUrl, cookiesStr } = params || {};

    const resFilesThirdPart = await Api.Ginkgoo.postFilesThirdPart({
      thirdPartUrl: pdfUrl,
      cookie: cookiesStr,
    });

    // console.log("uploadPdf", resFilesThirdPart);
    if (!resFilesThirdPart?.id) {
      BackgroundEventManager.postConnectMessage({
        type: `ginkgoo-background-all-toast`,
        typeToast: "error",
        contentToast: "Upload PDF failed.",
      });
      return;
    }

    const resWorkflowsUploadProgressFile = await Api.Ginkgoo.postWorkflowsUploadProgressFile({
      workflowId,
      fileId: resFilesThirdPart.id,
    });

    if (!resWorkflowsUploadProgressFile?.success) {
      BackgroundEventManager.postConnectMessage({
        type: `ginkgoo-background-all-toast`,
        typeToast: "error",
        contentToast: "Bind PDF failed.",
      });
      return;
    }

    console.log("resWorkflowsUploadProgressFile", resWorkflowsUploadProgressFile);
  };

  main = async (pilotInfo: IPilotType, actionlistPre?: IActionItemType[]) => {
    const { workflowId, tabInfo } = pilotInfo || {};
    const timerSource = cloneDeep(pilotInfo?.timer);

    pilotInfo.pilotStatus = PilotStatusEnum.START;
    BackgroundEventManager.postConnectMessage({
      type: `ginkgoo-background-all-case-update`,
      pilotInfo,
    });

    if (timerSource === pilotInfo?.timer && actionlistPre) {
      // 执行动作
      const resExecuteActionList = await this.executeActionList({
        workflowId,
        tabInfo,
        actionlist: actionlistPre.concat({
          selector: "input[id='submit']",
          type: "click",
        }),
      });
      if (timerSource === pilotInfo?.timer || !resExecuteActionList.result) {
        return;
      }

      // 等待
      const resDelayStep = await this.delayStep({ workflowId });
      if (timerSource === pilotInfo?.timer || !resDelayStep.result) {
        return;
      }
    }

    while (timerSource === pilotInfo?.timer) {
      console.log("main 0");
      // 查询 workflow List
      const resQueryWorkflowDetail = await this.queryWorkflowDetail({ workflowId });
      if (timerSource !== pilotInfo?.timer || !resQueryWorkflowDetail.result) {
        break;
      }

      console.log("main 1");
      // 查询页面
      const resQueryHtmlInfo = await this.queryHtmlInfo({ workflowId, tabInfo });
      if (timerSource !== pilotInfo?.timer || !resQueryHtmlInfo.result) {
        break;
      }

      console.log("main 2");
      // 查询cookies
      const resQueryCookies = await this.queryCookies({ workflowId, tabInfo });
      if (timerSource !== pilotInfo?.timer || !resQueryCookies.result) {
        break;
      }

      console.log("main 3");
      // 查询pdf Url
      const resQueryDom = await this.queryDom({ workflowId, tabInfo });
      if (timerSource !== pilotInfo?.timer || !resQueryDom.result) {
        break;
      }

      console.log("main 4");
      // 分析页面
      const { title, htmlCleansing } = resQueryHtmlInfo;
      const resQueryActionList = await this.queryActionList({ workflowId, htmlCleansing });
      if (timerSource !== pilotInfo?.timer || !resQueryActionList.result) {
        break;
      }

      console.log("main 5");
      // 执行动作
      const { actionlist } = resQueryActionList;
      const resExecuteActionList = await this.executeActionList({ workflowId, tabInfo, actionlist });
      if (timerSource !== pilotInfo?.timer || !resExecuteActionList.result) {
        break;
      }

      console.log("main 6");
      // 等待
      const resDelayStep = await this.delayStep({ workflowId });
      if (timerSource !== pilotInfo?.timer || !resDelayStep.result) {
        break;
      }

      console.log("main 7");
    }
    console.log("main 8");
  };

  open = async (params: { caseId: string; workflowId: string; fill_data: Record<string, unknown> }) => {
    const { caseId, workflowId, fill_data } = params || {};

    const tabInfo = await ChromeManager.createTab({
      url: "https://www.gov.uk/skilled-worker-visa/apply-from-outside-the-uk",
      active: false,
    });
    const pilotInfo = {
      id: uuidV4(),
      caseId,
      workflowId,
      fill_data,
      progress_file_id: "",
      dummy_data_usage: [],
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
      type: `ginkgoo-background-all-case-open`,
      caseId,
      pilotInfo,
    });
  };

  start = async (params: {
    url?: string;
    pilotId?: string; // 'continue'
    userId?: string; // 'create'
    caseId?: string; // 'create'
    workflowDefinitionId?: string; // 'create'
    actionlistPre?: IActionItemType[]; // 'continue'
  }) => {
    const { url, pilotId = "", userId = "", caseId = "", workflowDefinitionId = "", actionlistPre } = params || {};
    // let pilotInfo = this.getPilot({ tabId: tabInfo.id });

    const resTabs = await ChromeManager.queryTabs({
      url,
    });
    const tabInfo = resTabs?.[0];

    console.log("start 0", tabInfo);
    const isCheckAuth = await UserManager.checkAuth();

    console.log("start 1", isCheckAuth);

    if (!isCheckAuth) {
      BackgroundEventManager.postConnectMessage({
        type: `ginkgoo-background-all-auth-check`,
        value: isCheckAuth,
      });
      return;
    }

    console.log("start 2", tabInfo);

    if (!tabInfo) {
      BackgroundEventManager.postConnectMessage({
        type: `ginkgoo-background-all-case-no-match-page`,
        typeToast: "error",
        contentToast: "No matching page found.",
      });
      return;
    }

    let pilotInfo = pilotId ? this.getPilot({ id: pilotId }) : this.getPilot({ tabId: tabInfo.id });

    console.log("start 3", pilotId, pilotInfo);

    if (pilotInfo) {
      if (pilotInfo.timer) {
        await this.stop({ workflowId: pilotInfo.workflowId });
      }
    } else {
      const [fill_data, workflowId] = await Promise.all([
        this.queryFillData({ caseId }),
        this.queryWorkflowId({
          caseId,
          userId,
          workflowDefinitionId,
        }), //
      ]);

      if (!caseId || !workflowId) {
        return;
      }

      pilotInfo = this.genPilot({
        id: uuidV4(),
        caseId,
        workflowId,
        fill_data,
        progress_file_id: "",
        dummy_data_usage: [],
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

    pilotInfo.timer = setTimeout(async () => {
      await this.main(pilotInfo, actionlistPre);
      if (pilotInfo.timer) {
        await this.stop({ workflowId: pilotInfo.workflowId });
      }
    }, 0);

    // if (tabInfo.id) {
    //   ChromeManager.updateTab(tabInfo.id, { active: true });
    // }

    // await this.updatePilotMap({
    //   workflowId: pilotInfo.workflowId,
    //   update: { pilotStatus: PilotStatusEnum.HOLD },
    // });
  };

  stop = async (params: { workflowId: string }) => {
    const { workflowId } = params || {};
    const pilotInfo = this.pilotMap.get(workflowId);

    console.log("stop", workflowId, pilotInfo);

    if (!pilotInfo) {
      return;
    }

    if (pilotInfo?.timer) {
      console.log("stop 1");
      clearTimeout(pilotInfo.timer);
      pilotInfo.timer = null;
    }

    console.log("stop 2");
    // 会覆盖报错状态
    pilotInfo.pilotStatus = PilotStatusEnum.HOLD;
    pilotInfo.repeatHash = "";
    pilotInfo.repeatCurrent = 0;
    BackgroundEventManager.postConnectMessage({
      type: `ginkgoo-background-all-case-update`,
      pilotInfo,
    });

    // 上传 pdf 文件 Cookie ，以及将文件 fileId 同 workflow 绑定
    if (pilotInfo?.pdfUrl && pilotInfo.cookiesStr) {
      await this.uploadAndBindPDF({
        workflowId,
        pdfUrl: pilotInfo?.pdfUrl,
        cookiesStr: pilotInfo.cookiesStr,
      });
    }

    BackgroundEventManager.postConnectMessage({
      type: `ginkgoo-background-all-case-done`,
      pilotInfo,
    });

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
