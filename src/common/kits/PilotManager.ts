import md5 from "blueimp-md5";
import { cloneDeep } from "lodash";
import { MESSAGE } from "@/common/config/message";
import BackgroundEventManager from "@/common/kits/BackgroundEventManager";
import ChromeManager from "@/common/kits/ChromeManager";
import FetchManager from "@/common/kits/FetchManager";
import HTMLManager from "@/common/kits/HTMLManager";
import LockManager from "@/common/kits/LockManager";
import UserManager from "@/common/kits/UserManager";
import UtilsManager from "@/common/kits/UtilsManager";
import Api from "@/common/kits/api";
import { IActionItemType, ICaseItemType } from "@/common/types/case";
import {
  IPilotType,
  ISelectorResult,
  IStepResultType,
  IWorkflowType,
  PilotStatusEnum,
  PilotThirdPartTypeEnum,
} from "@/common/types/casePilot";

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

  createPilot = async (params: {
    caseId: string;
    workflowId: string;
    workflowDefinitionId: string;
    update: Partial<IPilotType>;
  }): Promise<IPilotType | undefined> => {
    const { caseId, workflowId, workflowDefinitionId, update } = params || {};

    // const resWorkflowInfo = await this.createWorkflow({
    //   caseId: caseInfo?.id || "",
    //   workflowDefinitionId,
    // });

    const [resWorkflowInfo, resCaseDetail] = await Promise.all([
      workflowId
        ? Api.Ginkgoo.getWorkflowDetail({
            workflowId,
          })
        : this.createWorkflow({
            caseId,
            workflowDefinitionId,
          }),
      this.queryCaseDetail({ caseId }),
    ]);

    if (!resWorkflowInfo) {
      BackgroundEventManager.postConnectMessage({
        type: `ginkgoo-background-all-pilot-start-failed`,
        typeToast: "error",
        contentToast: MESSAGE.TOAST_CREATE_WORKFLOW_FAILED,
      });
      return void 0;
    }

    if (!resCaseDetail) {
      BackgroundEventManager.postConnectMessage({
        type: `ginkgoo-background-all-pilot-start-failed`,
        typeToast: "error",
        contentToast: MESSAGE.TOAST_REFRESH_CASE_DETAIL_FAILED,
      });
      return void 0;
    }

    const newPilot = {
      pilotId: resWorkflowInfo.workflow_instance_id,
      pilotTimer: null,
      pilotTabInfo: null,
      pilotStatus: PilotStatusEnum.INIT,
      pilotLastMessage: "",
      pilotRepeatHash: "",
      pilotRepeatCurrent: 0,
      pilotThirdPartType: PilotThirdPartTypeEnum.NONE,
      pilotThirdPartMethod: "",
      pilotThirdPartUrl: "",
      pilotCookie: "",
      pilotCsrfToken: "",
      pilotUniqueApplicationNumber: "",
      pilotCaseInfo: resCaseDetail,
      pilotWorkflowInfo: resWorkflowInfo,
      ...update,
    };
    this.pilotMap.set(resWorkflowInfo.workflow_instance_id, newPilot);

    BackgroundEventManager.postConnectMessage({
      type: `ginkgoo-background-all-pilot-update`,
      pilotInfo: newPilot,
    });

    return newPilot;
  };

  getPilot = (params: { caseId?: string; pilotId?: string; tabId?: number; workflowId?: string }): IPilotType | undefined => {
    const { caseId, pilotId, tabId, workflowId } = params || {};

    if (!caseId && !pilotId && !tabId && !workflowId) {
      return void 0;
    }

    return Array.from(this.pilotMap.values()).find((pilot) => {
      // 如果提供了 caseId
      if (caseId && pilot.pilotCaseInfo?.id !== caseId) {
        return false;
      }

      // 如果提供了 pilotId
      if (pilotId && pilot.pilotId !== pilotId) {
        return false;
      }
      // 如果提供了 tabId
      if (tabId && pilot.pilotTabInfo?.id !== tabId) {
        return false;
      }
      // 如果提供了 caseId
      if (workflowId && pilot.pilotWorkflowInfo?.workflow_instance_id !== workflowId) {
        return false;
      }
      // 所有条件都满足
      return true;
    });
  };

  getPilotActived = (): IPilotType | undefined => {
    return Array.from(this.pilotMap.values()).find((pilot) => !!pilot.pilotTimer);
  };

  getPilotHostUrl = (params: { caseInfo: ICaseItemType | null }) => {
    const { caseInfo } = params || {};

    switch (caseInfo?.visaType) {
      default: {
        return "https://www.gov.uk/skilled-worker-visa/apply-from-outside-the-uk";
      }
    }
  };

  updatePilotMap = async (params: { workflowId: string; update: Partial<IPilotType>; isForcePostMessage?: boolean }) => {
    const { workflowId, update, isForcePostMessage } = params || {};
    const lockId = `workflowId-${workflowId}`;
    const pilotInfo = this.pilotMap.get(workflowId);
    const pilotStatusOld = pilotInfo?.pilotStatus;

    try {
      // 获取锁
      await LockManager.acquireLock(lockId);

      if (pilotInfo) {
        Object.keys(update).forEach((key) => {
          (pilotInfo as any)[key] = (update as any)[key];
        });
      }
    } finally {
      if (pilotStatusOld !== PilotStatusEnum.HOLD || isForcePostMessage) {
        BackgroundEventManager.postConnectMessage({
          type: `ginkgoo-background-all-pilot-update`,
          pilotInfo,
        });
      }

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

    await this.updatePilotMap({
      workflowId,
      update: {
        pilotStatus: PilotStatusEnum.QUERY_WORKFLOW,
      },
    });

    const resWorkflowDetail = await Api.Ginkgoo.getWorkflowDetail({
      workflowId,
    });

    // console.log("queryWorkflowDetail", resWorkflowDetail);

    if (!resWorkflowDetail?.steps) {
      await this.updatePilotMap({
        workflowId,
        update: {
          pilotStatus: PilotStatusEnum.HOLD,
          pilotLastMessage: MESSAGE.TOAST_REFRESH_WORKFLOW_DETAIL_FAILED,
        },
      });
      return { result: false };
    }

    const currentStep = resWorkflowDetail?.steps?.find((itemStep) => {
      return itemStep.step_key === resWorkflowDetail?.current_step_key;
    });
    const isInterrupt = currentStep?.data?.form_data?.some((itemFormData) => {
      return itemFormData.question.type === "interrupt";
    });

    if (isInterrupt) {
      await this.updatePilotMap({
        workflowId,
        update: {
          pilotStatus: PilotStatusEnum.HOLD,
          pilotLastMessage: MESSAGE.ALERT_MANUAL_TIP,
          pilotWorkflowInfo: resWorkflowDetail,
        },
      });
      return { result: false };
    }

    await this.updatePilotMap({
      workflowId,
      update: {
        pilotWorkflowInfo: resWorkflowDetail,
      },
    });

    return { result: true };
  };

  queryWorkflowStep = async (params: { workflowId: string; stepKey: string }): Promise<IStepResultType> => {
    const { workflowId = "", stepKey = "" } = params || {};
    const pilotInfo = this.getPilot({ workflowId });

    if (!pilotInfo || !pilotInfo?.pilotWorkflowInfo) {
      return { result: false };
    }

    const resWorkflowStepData = await Api.Ginkgoo.getWorkflowStepData({
      workflowId,
      stepKey,
    });

    if (!resWorkflowStepData?.data) {
      return { result: false };
    }

    const pilotWorkflowInfoNew = cloneDeep(pilotInfo?.pilotWorkflowInfo);
    pilotWorkflowInfoNew.steps = pilotWorkflowInfoNew?.steps?.map((item) => {
      return {
        ...item,
        data: item.step_key === stepKey ? resWorkflowStepData?.data : item.data,
      };
    });

    await this.updatePilotMap({
      workflowId,
      update: {
        pilotWorkflowInfo: pilotWorkflowInfoNew,
      },
    });

    return { result: true };
  };

  queryCaseDetail = async (params: { caseId: string }): Promise<ICaseItemType | null> => {
    const { caseId } = params || {};
    const resCaseDetail = await Api.Ginkgoo.queryCaseDetail({
      caseId,
    });
    if (resCaseDetail?.id) {
      return resCaseDetail;
    } else {
      // BackgroundEventManager.postConnectMessage({
      //   type: `ginkgoo-background-all-toast`,
      //   typeToast: "error",
      //   contentToast: "Query fill data failed.",
      // });
      return null;
    }
  };

  createWorkflow = async (params: { caseId: string; workflowDefinitionId: string }): Promise<IWorkflowType | null> => {
    const { caseId, workflowDefinitionId } = params || {};
    const userId = UserManager.userInfo?.id || "";

    if (!userId) {
      BackgroundEventManager.postConnectMessage({
        type: `ginkgoo-background-all-toast`,
        typeToast: "error",
        contentToast: MESSAGE.TOAST_USER_ID_EMPTY,
      });
      return null;
    }

    const resWorkflow = await Api.Ginkgoo.createWorkflow({
      user_id: userId,
      case_id: caseId,
      workflow_definition_id: workflowDefinitionId,
    });

    if (!resWorkflow?.workflow_instance_id) {
      BackgroundEventManager.postConnectMessage({
        type: `ginkgoo-background-all-toast`,
        typeToast: "error",
        contentToast: MESSAGE.TOAST_CREATE_WORKFLOW_FAILED,
      });
      return null;
    }

    return resWorkflow;
  };

  queryTabInfo = async (params: { workflowId: string; tabInfo: chrome.tabs.Tab }): Promise<IStepResultType> => {
    const { workflowId } = params || {};
    const pilotInfo = this.getPilot({ workflowId });
    const { pilotTabInfo, pilotCaseInfo, pilotUniqueApplicationNumber: pilotUniqueApplicationNumberPilotInfo } = pilotInfo || {};

    if (!pilotTabInfo?.id) {
      return { result: false };
    }

    await this.updatePilotMap({
      workflowId,
      update: {
        pilotStatus: PilotStatusEnum.QUERY_TAB,
      },
    });

    const resTabInfo = await ChromeManager.getTabInfo(pilotTabInfo?.id);

    if (resTabInfo) {
      let pilotUniqueApplicationNumber = pilotUniqueApplicationNumberPilotInfo;

      switch (pilotCaseInfo?.visaType) {
        default: {
          const extractIdFromUrl = (url: string) => {
            const regex = /\/SKILLED_WORK\/(\d{4}-\d{4}-\d{4}-\d{4})\//;
            const match = url.match(regex);
            if (match && match[1]) {
              return match[1];
            }
            return pilotUniqueApplicationNumberPilotInfo; // Return null if no match is found
          };

          pilotUniqueApplicationNumber = extractIdFromUrl(resTabInfo.url || "");
        }
      }

      await this.updatePilotMap({
        workflowId,
        update: {
          pilotTabInfo: resTabInfo,
          pilotUniqueApplicationNumber,
        },
      });
    }

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

    await this.updatePilotMap({
      workflowId,
      update: {
        pilotStatus: PilotStatusEnum.QUERY_HTML,
      },
    });

    const resQueryHtmlInfo = await ChromeManager.executeScript(tabInfo, {
      cbName: "queryHtmlInfo",
      cbParams: {},
    });

    const html = resQueryHtmlInfo?.[0]?.result;

    if (!html) {
      await this.updatePilotMap({
        workflowId,
        update: {
          pilotStatus: PilotStatusEnum.HOLD,
          pilotLastMessage: MESSAGE.ALERT_QUERY_HTML_FAILED,
        },
      });
      return { result: false };
    }

    const { rootHtml, mainHtml, h1Text } = HTMLManager.cleansingHtml({ html });
    const title = h1Text || "Unknown Page";
    const htmlCleansing = mainHtml || rootHtml;

    const hash = md5(title + htmlCleansing);

    console.log("queryHtmlInfo", hash, pilotInfo?.pilotRepeatHash, Number(pilotInfo?.pilotRepeatCurrent));

    if (hash === pilotInfo?.pilotRepeatHash) {
      await this.updatePilotMap({
        workflowId,
        update: {
          pilotRepeatCurrent: pilotInfo?.pilotRepeatCurrent + 1,
        },
      });
    } else {
      await this.updatePilotMap({
        workflowId,
        update: {
          pilotRepeatCurrent: 1,
          pilotRepeatHash: hash,
        },
      });
    }

    if (Number(pilotInfo?.pilotRepeatCurrent) > this.REPEAT_MAX) {
      // Max
      await this.updatePilotMap({
        workflowId,
        update: {
          pilotStatus: PilotStatusEnum.HOLD,
          pilotLastMessage: MESSAGE.ALERT_REPEAT_MAX,
        },
      });
      return { result: false };
    }

    return { result: true, title, htmlCleansing };
  };

  queryCookies = async (params: { workflowId: string; tabInfo: chrome.tabs.Tab }): Promise<IStepResultType> => {
    const { workflowId, tabInfo } = params || {};
    const pilotInfo = this.getPilot({ workflowId });
    const { pilotThirdPartType } = pilotInfo || {};

    if (!pilotInfo) {
      return { result: false };
    }

    await this.updatePilotMap({
      workflowId,
      update: {
        pilotStatus: PilotStatusEnum.QUERY_COOKIES,
      },
    });

    const resCookies = await ChromeManager.getSyncCookiesCore(tabInfo);
    const { cookies, cookiesStr } = resCookies || {};
    const objCsrfToken = cookies.find((item) => {
      return item.name.toLocaleUpperCase() === "CSRF-TOKEN";
    });

    console.log("queryCookies", pilotThirdPartType, cookies, cookiesStr, objCsrfToken);

    if (pilotThirdPartType === PilotThirdPartTypeEnum.NotEU && cookiesStr) {
      await this.updatePilotMap({
        workflowId,
        update: {
          pilotCookie: cookiesStr,
        },
      });
    } else if (pilotThirdPartType === PilotThirdPartTypeEnum.EU && cookiesStr && objCsrfToken?.value) {
      await this.updatePilotMap({
        workflowId,
        update: {
          pilotCookie: cookiesStr,
          pilotCsrfToken: objCsrfToken?.value,
        },
      });
    }

    return { result: true };
  };

  queryDomForEU = async (params: { uniqueApplicationNumber: string }) => {
    let thirdPartMethod = "";
    let thirdPartUrl = "";

    const { uniqueApplicationNumber } = params || {};
    // const resHtmlInfo = await ChromeManager.executeScript(tabInfo, {
    //   cbName: "querySelectors",
    //   cbParams: {
    //     selectors: [
    //       {
    //         selector: `#task-list-subtitle h2 span[class="govuk-body-m"]`,
    //         attr: [{ key: "innerText" }],
    //       },
    //     ],
    //   },
    // });
    // const id = (resHtmlInfo?.[0]?.result as ISelectorResult[])?.[0]?.innerText as string;
    if (uniqueApplicationNumber) {
      thirdPartMethod = "POST";
      thirdPartUrl = `https://apply-to-visit-or-stay-in-the-uk.homeoffice.gov.uk/form/api/applications/download-partial-pdf/${uniqueApplicationNumber}`;
    }

    return {
      thirdPartMethod,
      thirdPartUrl,
    };
  };

  queryDomForNotEU = async (params: { tabInfo: chrome.tabs.Tab }) => {
    let thirdPartMethod = "";
    let thirdPartUrl = "";

    const { tabInfo } = params || {};
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
    const href = (resHtmlInfo?.[0]?.result as ISelectorResult[])?.[0]?.href as string;
    if (href) {
      thirdPartMethod = "GET";
      thirdPartUrl = href;
    }

    return {
      thirdPartMethod,
      thirdPartUrl,
    };
  };

  queryDom = async (params: { workflowId: string; tabInfo: chrome.tabs.Tab }): Promise<IStepResultType> => {
    const { workflowId, tabInfo } = params || {};
    const pilotInfo = this.getPilot({ workflowId });

    if (!pilotInfo) {
      return { result: false };
    }

    await this.updatePilotMap({
      workflowId,
      update: {
        pilotStatus: PilotStatusEnum.QUERY_PDF,
      },
    });

    let thirdPartType = PilotThirdPartTypeEnum.NONE;
    let thirdPartMethod = "";
    let thirdPartUrl = "";

    if (!thirdPartUrl) {
      const { thirdPartMethod: thirdPartMethodForEU, thirdPartUrl: thirdPartUrlForEU } = await this.queryDomForEU({
        uniqueApplicationNumber: pilotInfo.pilotUniqueApplicationNumber,
      });
      thirdPartType = PilotThirdPartTypeEnum.EU;
      thirdPartMethod = thirdPartMethodForEU;
      thirdPartUrl = thirdPartUrlForEU;
    }
    if (!thirdPartUrl) {
      const { thirdPartMethod: thirdPartMethodForNotEU, thirdPartUrl: thirdPartUrlForNotEU } = await this.queryDomForNotEU({
        tabInfo,
      });
      thirdPartType = PilotThirdPartTypeEnum.NotEU;
      thirdPartMethod = thirdPartMethodForNotEU;
      thirdPartUrl = thirdPartUrlForNotEU;
    }

    if (thirdPartUrl) {
      await this.updatePilotMap({
        workflowId,
        update: {
          pilotThirdPartType: thirdPartType,
          pilotThirdPartMethod: thirdPartMethod,
          pilotThirdPartUrl: thirdPartUrl,
        },
      });
    }

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

    await this.updatePilotMap({
      workflowId,
      update: {
        pilotStatus: PilotStatusEnum.ANALYSIS,
      },
    });

    const resWorkflowsProcessForm = await Api.Ginkgoo.postWorkflowsProcessForm({
      workflowId,
      form_html: htmlCleansing,
      fill_data: pilotInfo.pilotCaseInfo?.profileData || {},
      profile_dummy_data: pilotInfo.pilotCaseInfo?.profileDummyData || {},
    });

    actionlist = resWorkflowsProcessForm?.actions;

    if (pilotInfo.pilotStatus !== PilotStatusEnum.HOLD && !actionlist) {
      BackgroundEventManager.postConnectMessage({
        type: `ginkgoo-background-all-toast`,
        typeToast: "error",
        contentToast: MESSAGE.TOAST_ANALYZE_ACTION_ERROR,
      });
    }

    // if (!actionlist) {
    //   return { result: false };
    // }

    return { result: true, actionlist: actionlist || [] };
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

    await this.updatePilotMap({
      workflowId,
      update: {
        pilotStatus: PilotStatusEnum.ACTION,
      },
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
          stopRuleList: [
            // {
            //   type: "declaration",
            //   method: "endsWith",
            //   key: "href",
            //   value: "/travelInformationAppendixFm",
            // },
            {
              type: "declaration",
              method: "endsWith",
              key: "href",
              value: "/declaration/standard-conditions",
            },
          ],
        },
      });

      const { type } = resActionDom?.[0]?.result || {};

      console.log("executeActionList", action, type);
      if (type === "declaration") {
        await this.updatePilotMap({
          workflowId,
          update: {
            pilotStatus: PilotStatusEnum.HOLD,
            pilotLastMessage: MESSAGE.ALERT_MANUAL_TIP,
          },
        });
        return { result: false };
      }
    }

    return { result: true };
  };

  delayStep = async (params: { workflowId: string; delayTime?: number }) => {
    const { workflowId, delayTime } = params || {};
    const pilotInfo = this.getPilot({ workflowId });

    if (!pilotInfo) {
      return { result: false };
    }

    await this.updatePilotMap({
      workflowId,
      update: {
        pilotStatus: PilotStatusEnum.WAIT,
      },
    });
    await UtilsManager.sleep(delayTime ?? this.DELAY_STEP);

    return { result: true };
  };

  uploadAndBindPDF = async (params: { workflowId: string; method: string; thirdPartUrl: string; cookie: string; csrfToken: string }) => {
    const { workflowId, method, thirdPartUrl, cookie, csrfToken } = params || {};

    const resFilesThirdPart = await Api.Ginkgoo.postFilesThirdPart({
      thirdPartUrl,
      method,
      cookie,
      csrfToken,
    });

    // console.log("uploadPdf", resFilesThirdPart);
    if (!resFilesThirdPart?.id) {
      BackgroundEventManager.postConnectMessage({
        type: `ginkgoo-background-all-toast`,
        typeToast: "error",
        contentToast: MESSAGE.TOAST_UPLOAD_PDF_FILE_FAILED,
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
        contentToast: MESSAGE.TOAST_BIND_PDF_FILE_FAILED,
      });
      return;
    }
  };

  uploadWorkflowsDetail = async (params: { workflowId: string; unique_application_number: string }) => {
    const { workflowId, unique_application_number } = params || {};

    const resWorkflowsUpdateDetail = await Api.Ginkgoo.putWorkflowsUpdateDetail({
      workflowId,
      unique_application_number,
    });

    if (!resWorkflowsUpdateDetail?.workflow_instance_id) {
      BackgroundEventManager.postConnectMessage({
        type: `ginkgoo-background-all-toast`,
        typeToast: "error",
        contentToast: MESSAGE.TOAST_UPLOAD_UNIQUE_APPLICATION_NUMBER_FAILED,
      });
      return;
    }
  };

  main = async (pilotInfo: IPilotType, actionlistPre?: IActionItemType[]) => {
    const { pilotTabInfo: tabInfo, pilotCaseInfo, pilotWorkflowInfo } = pilotInfo || {};
    const { workflow_instance_id: workflowId = "" } = pilotWorkflowInfo || {};
    const timerSource = cloneDeep(pilotInfo?.pilotTimer);

    const resCaseDetail = await this.queryCaseDetail({ caseId: pilotCaseInfo?.id || "" });
    if (!resCaseDetail) {
      BackgroundEventManager.postConnectMessage({
        type: `ginkgoo-background-all-toast`,
        typeToast: "error",
        contentToast: MESSAGE.TOAST_REFRESH_CASE_DETAIL_FAILED,
      });
      return;
    }

    await this.updatePilotMap({
      workflowId,
      update: {
        pilotStatus: PilotStatusEnum.START,
        pilotLastMessage: "",
        pilotCaseInfo: resCaseDetail || pilotCaseInfo,
      },
      isForcePostMessage: true,
    });

    if (timerSource === pilotInfo?.pilotTimer) {
      if (actionlistPre) {
        // 执行动作
        const resExecuteActionList = await this.executeActionList({
          workflowId,
          tabInfo: tabInfo!,
          actionlist: actionlistPre.concat([
            {
              selector: "input[type='submit']",
              type: "click",
            },
            {
              selector: "button[type='submit']",
              type: "click",
            },
          ]),
        });
        if (timerSource !== pilotInfo?.pilotTimer || !resExecuteActionList.result) {
          return;
        }

        // 等待
        const resDelayStep = await this.delayStep({ workflowId, delayTime: 3000 });
        if (timerSource !== pilotInfo?.pilotTimer || !resDelayStep.result) {
          return;
        }
      } else {
        // 查询 Workflow Detail
        // const resQueryWorkflowDetail = await this.queryWorkflowDetail({ workflowId });
        // if (timerSource !== pilotInfo?.pilotTimer || !resQueryWorkflowDetail.result) {
        //   return;
        // }
      }
    }

    console.log("main 0");

    while (timerSource === pilotInfo?.pilotTimer) {
      console.log("main 1");

      // 查询并更新tabInfo
      const resUpdateTabInfo = await this.queryTabInfo({ workflowId, tabInfo: tabInfo! });
      if (timerSource !== pilotInfo?.pilotTimer || !resUpdateTabInfo.result) {
        console.log("main 1", timerSource, pilotInfo?.pilotTimer, resUpdateTabInfo.result);
        break;
      }

      console.log("main 2");
      // 查询页面
      const resQueryHtmlInfo = await this.queryHtmlInfo({ workflowId, tabInfo: tabInfo! });
      if (timerSource !== pilotInfo?.pilotTimer || !resQueryHtmlInfo.result) {
        console.log("main 2", timerSource, pilotInfo?.pilotTimer, resUpdateTabInfo.result);
        break;
      }

      console.log("main 3");
      // 查询pdf Url
      const resQueryDom = await this.queryDom({ workflowId, tabInfo: tabInfo! });
      if (timerSource !== pilotInfo?.pilotTimer || !resQueryDom.result) {
        console.log("main 4", timerSource, pilotInfo?.pilotTimer, resUpdateTabInfo.result);
        break;
      }

      console.log("main 4");
      // 查询cookies
      const resQueryCookies = await this.queryCookies({ workflowId, tabInfo: tabInfo! });
      if (timerSource !== pilotInfo?.pilotTimer || !resQueryCookies.result) {
        console.log("main 3", timerSource, pilotInfo?.pilotTimer, resUpdateTabInfo.result);
        break;
      }

      console.log("main 5");
      // 分析页面
      const { htmlCleansing } = resQueryHtmlInfo;
      const resQueryActionList = await this.queryActionList({ workflowId, htmlCleansing });
      if (timerSource !== pilotInfo?.pilotTimer || !resQueryActionList.result) {
        console.log("main 5", timerSource, pilotInfo?.pilotTimer, resUpdateTabInfo.result);
        break;
      }

      console.log("main 6");
      // 执行动作
      const { actionlist } = resQueryActionList;
      const resExecuteActionList = await this.executeActionList({ workflowId, tabInfo: tabInfo!, actionlist });
      if (timerSource !== pilotInfo?.pilotTimer || !resExecuteActionList.result) {
        console.log("main 6", timerSource, pilotInfo?.pilotTimer, resUpdateTabInfo.result);
        break;
      }

      console.log("main 7");
      // 等待
      const resDelayStep = await this.delayStep({ workflowId });
      if (timerSource !== pilotInfo?.pilotTimer || !resDelayStep.result) {
        console.log("main 7", timerSource, pilotInfo?.pilotTimer, resUpdateTabInfo.result);
        break;
      }

      console.log("main 8");

      // 查询 Workflow Detail
      const resQueryWorkflowDetail = await this.queryWorkflowDetail({ workflowId });
      if (timerSource !== pilotInfo?.pilotTimer || !resQueryWorkflowDetail.result) {
        console.log("main 8", timerSource, pilotInfo?.pilotTimer, resUpdateTabInfo.result);
        break;
      }

      console.log("main 9");
    }
    console.log("main 10");
  };

  start = async (params: {
    pilotInfo: IPilotType;
    actionlistPre?: IActionItemType[]; // 'continue'
  }) => {
    const { pilotInfo, actionlistPre } = params || {};

    console.log("start 0", pilotInfo, this.pilotMap);

    if (pilotInfo.pilotTimer) {
      await this.stop({ workflowId: pilotInfo.pilotWorkflowInfo?.workflow_instance_id || "" });
    }

    pilotInfo.pilotTimer = setTimeout(async () => {
      await this.main(pilotInfo, actionlistPre);
      if (pilotInfo.pilotTimer) {
        await this.stop({ workflowId: pilotInfo.pilotWorkflowInfo?.workflow_instance_id || "" });
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
    const { workflowId = "" } = params || {};
    const pilotInfo = this.pilotMap.get(workflowId);

    console.log("stop 1", workflowId, pilotInfo);

    if (!pilotInfo) {
      return;
    }

    if (pilotInfo?.pilotTimer) {
      console.log("stop 1");
      clearTimeout(pilotInfo.pilotTimer);
    }

    console.log("stop 2");
    // init pilot for stop
    await this.updatePilotMap({
      workflowId,
      update: {
        pilotTimer: null,
        pilotStatus: PilotStatusEnum.HOLD,
        pilotRepeatHash: "",
        pilotRepeatCurrent: 0,
      },
    });

    FetchManager.cancelAll();

    const taskList = [];
    // 上传 pdf 文件 Cookie ，以及将文件 fileId 同 workflow 绑定
    if (pilotInfo?.pilotThirdPartUrl && pilotInfo?.pilotCookie) {
      taskList.push(
        this.uploadAndBindPDF({
          workflowId,
          method: pilotInfo?.pilotThirdPartMethod,
          thirdPartUrl: pilotInfo?.pilotThirdPartUrl,
          cookie: pilotInfo.pilotCookie,
          csrfToken: pilotInfo.pilotCsrfToken,
        })
      );
    }

    if (pilotInfo?.pilotUniqueApplicationNumber) {
      taskList.push(
        this.uploadWorkflowsDetail({
          workflowId,
          unique_application_number: pilotInfo?.pilotUniqueApplicationNumber,
        })
      );
    }

    await Promise.all(taskList);

    BackgroundEventManager.postConnectMessage({
      type: `ginkgoo-background-all-pilot-done`,
      pilotInfo,
    });

    // Don't need to delete pilotInfo
    // this.pilotMap.delete(caseId);
  };

  delete = async (params: { workflowId?: string; tabId?: number }) => {
    const pilotInfo = this.getPilot(params);
    if (pilotInfo?.pilotTimer) {
      clearTimeout(pilotInfo?.pilotTimer);
    }
    if (pilotInfo?.pilotWorkflowInfo?.workflow_instance_id) {
      await this.updatePilotMap({
        workflowId: pilotInfo?.pilotWorkflowInfo?.workflow_instance_id,
        update: {
          pilotTabInfo: null,
        },
        isForcePostMessage: true,
      });
      this.pilotMap.delete(pilotInfo?.pilotWorkflowInfo?.workflow_instance_id);
    }
  };

  clear = () => {
    // 遍历pilotMap并调用delete方法
    for (const [workflowId] of this.pilotMap) {
      this.delete({ workflowId });
    }
    this.pilotMap.clear();
  };
}

export default PilotManager.getInstance();
