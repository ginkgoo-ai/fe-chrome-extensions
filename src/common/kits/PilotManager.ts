import md5 from "blueimp-md5";
import { cloneDeep } from "lodash";
import { MESSAGE } from "@/common/config/message";
import BackgroundEventManager from "@/common/kits/BackgroundEventManager";
import ChromeManager from "@/common/kits/ChromeManager";
import HTMLManager from "@/common/kits/HTMLManager";
import LockManager from "@/common/kits/LockManager";
import UserManager from "@/common/kits/UserManager";
import UtilsManager from "@/common/kits/UtilsManager";
import Api from "@/common/kits/api";
import { IActionItemType, ICaseItemType } from "@/common/types/case";
import { IPilotType, ISelectorResult, IStepResultType, IWorkflowType, PilotStatusEnum } from "@/common/types/casePilot";

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

  getPilot = (params: { pilotId?: string; tabId?: number; workflowId?: string }): IPilotType | undefined => {
    const { pilotId, tabId, workflowId } = params || {};

    if (!pilotId && !tabId && !workflowId) {
      return void 0;
    }

    return Array.from(this.pilotMap.values()).find((pilot) => {
      // 如果提供了 id
      if (pilotId && pilot.pilotId !== pilotId) {
        return false;
      }
      // 如果提供了 tabId，则必须匹配
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

  updatePilotMap = async (params: { workflowId: string; update: Partial<IPilotType> }) => {
    const { workflowId, update } = params || {};
    const lockId = `workflowId-${workflowId}`;
    const pilotInfo = this.pilotMap.get(workflowId);

    try {
      // 获取锁
      await LockManager.acquireLock(lockId);

      if (pilotInfo) {
        Object.keys(update).forEach((key) => {
          (pilotInfo as any)[key] = (update as any)[key];
        });
      }
    } finally {
      BackgroundEventManager.postConnectMessage({
        type: `ginkgoo-background-all-pilot-update`,
        pilotInfo,
      });

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

    console.log("queryHtmlInfo", hash, pilotInfo?.pilotRepeatHash, Number(pilotInfo?.pilotRepeatCurrent));

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

    if (!pilotInfo) {
      return { result: false };
    }

    const resCookies = await ChromeManager.getSyncCookiesCore(tabInfo);
    const { cookies, cookiesStr } = resCookies || {};

    if (cookiesStr) {
      const objCsrfToken = cookies.find((item) => {
        return item.name.toLocaleUpperCase() === "CSRF-TOKEN";
      });

      // console.log("queryCookies", cookies, objCsrfToken);

      await this.updatePilotMap({
        workflowId,
        update: {
          pilotCookie: cookiesStr,
          pilotCsrfToken: objCsrfToken?.value || "",
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

    const type = "EU";
    let thirdPartUrl = "";

    switch (type) {
      case "EU": {
        const resHtmlInfo = await ChromeManager.executeScript(tabInfo, {
          cbName: "querySelectors",
          cbParams: {
            selectors: [
              {
                selector: `#task-list-subtitle h2 span[class="govuk-body-m"]`,
                attr: [{ key: "innerText" }],
              },
            ],
          },
        });
        const id = (resHtmlInfo?.[0]?.result as ISelectorResult[])?.[0]?.innerText as string;
        if (id) {
          thirdPartUrl = `https://apply-to-visit-or-stay-in-the-uk.homeoffice.gov.uk/form/api/applications/download-partial-pdf/${id}`;
        }
        break;
      }
      default: {
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
        thirdPartUrl = (resHtmlInfo?.[0]?.result as ISelectorResult[])?.[0]?.href as string;
        break;
      }
    }

    if (thirdPartUrl) {
      await this.updatePilotMap({
        workflowId,
        update: {
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

    if (!actionlist) {
      return { result: false };
    }

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

  uploadAndBindPDF = async (params: { workflowId: string; thirdPartUrl: string; cookie: string; csrfToken: string }) => {
    const { workflowId, thirdPartUrl, cookie, csrfToken } = params || {};

    const resFilesThirdPart = await Api.Ginkgoo.postFilesThirdPart({
      thirdPartUrl,
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

    console.log("resWorkflowsUploadProgressFile", resWorkflowsUploadProgressFile);
  };

  main = async (pilotInfo: IPilotType, actionlistPre?: IActionItemType[]) => {
    const { pilotTabInfo: tabInfo, pilotWorkflowInfo } = pilotInfo || {};
    const { workflow_instance_id: workflowId = "" } = pilotWorkflowInfo || {};
    const timerSource = cloneDeep(pilotInfo?.pilotTimer);

    await this.updatePilotMap({
      workflowId,
      update: {
        pilotStatus: PilotStatusEnum.START,
        pilotLastMessage: "",
      },
    });

    if (timerSource === pilotInfo?.pilotTimer) {
      if (actionlistPre) {
        // 执行动作
        const resExecuteActionList = await this.executeActionList({
          workflowId,
          tabInfo,
          actionlist: actionlistPre.concat([
            {
              selector: "input[id='submit']",
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
        const resQueryWorkflowDetail = await this.queryWorkflowDetail({ workflowId });
        if (timerSource !== pilotInfo?.pilotTimer || !resQueryWorkflowDetail.result) {
          return;
        }
      }
    }

    console.log("main 0");

    while (timerSource === pilotInfo?.pilotTimer) {
      console.log("main 1");
      // 查询页面
      const resQueryHtmlInfo = await this.queryHtmlInfo({ workflowId, tabInfo });
      if (timerSource !== pilotInfo?.pilotTimer || !resQueryHtmlInfo.result) {
        break;
      }

      console.log("main 2");
      // 查询cookies
      const resQueryCookies = await this.queryCookies({ workflowId, tabInfo });
      if (timerSource !== pilotInfo?.pilotTimer || !resQueryCookies.result) {
        break;
      }

      console.log("main 3");
      // 查询pdf Url
      const resQueryDom = await this.queryDom({ workflowId, tabInfo });
      if (timerSource !== pilotInfo?.pilotTimer || !resQueryDom.result) {
        break;
      }

      console.log("main 4");
      // 分析页面
      const { htmlCleansing } = resQueryHtmlInfo;
      const resQueryActionList = await this.queryActionList({ workflowId, htmlCleansing });
      if (timerSource !== pilotInfo?.pilotTimer || !resQueryActionList.result) {
        break;
      }

      console.log("main 5");
      // 执行动作
      const { actionlist } = resQueryActionList;
      const resExecuteActionList = await this.executeActionList({ workflowId, tabInfo, actionlist });
      if (timerSource !== pilotInfo?.pilotTimer || !resExecuteActionList.result) {
        break;
      }

      console.log("main 6");
      // 等待
      const resDelayStep = await this.delayStep({ workflowId });
      if (timerSource !== pilotInfo?.pilotTimer || !resDelayStep.result) {
        break;
      }

      console.log("main 7");

      // 查询 Workflow Detail
      const resQueryWorkflowDetail = await this.queryWorkflowDetail({ workflowId });
      if (timerSource !== pilotInfo?.pilotTimer || !resQueryWorkflowDetail.result) {
        break;
      }

      console.log("main 8");
    }
    console.log("main 9");
  };

  start = async (params: {
    url?: string; // 'create'
    caseInfo?: ICaseItemType; // 'create'
    workflowDefinitionId?: string; // 'create'
    pilotId?: string; // 'continue'
    actionlistPre?: IActionItemType[]; // 'continue'
  }) => {
    const { url = "", caseInfo = null, workflowDefinitionId = "", pilotId = "", actionlistPre } = params || {};
    let pilotInfo = this.getPilot({ pilotId });

    console.log("start 0", pilotInfo, this.pilotMap);
    const isCheckAuth = await UserManager.checkAuth();

    console.log("start 1", isCheckAuth);

    if (!isCheckAuth) {
      BackgroundEventManager.postConnectMessage({
        type: `ginkgoo-background-all-auth-check`,
        value: isCheckAuth,
      });
      return;
    }

    const tabInfo = !!pilotInfo?.pilotTabInfo?.id
      ? await ChromeManager.getTabInfo(pilotInfo?.pilotTabInfo?.id)
      : (
          await ChromeManager.queryTabs({
            url,
          })
        )?.[0];

    console.log("start 2", tabInfo);

    if (!tabInfo) {
      BackgroundEventManager.postConnectMessage({
        type: `ginkgoo-background-all-pilot-no-match-page`,
        typeToast: "error",
        contentToast: "No matching page found.",
      });
      return;
    }

    console.log("start 3", pilotId, pilotInfo, pilotInfo?.pilotTimer);

    if (pilotInfo) {
      pilotInfo.pilotTabInfo = tabInfo;
      if (pilotInfo.pilotTimer) {
        await this.stop({ workflowId: pilotInfo.pilotWorkflowInfo?.workflow_instance_id || "" });
      }
    } else {
      const [resCaseInfo, resWorkflowInfo] = await Promise.all([
        this.queryCaseDetail({ caseId: caseInfo?.id || "" }),
        this.createWorkflow({
          caseId: caseInfo?.id || "",
          workflowDefinitionId,
        }),
      ]);

      if (!resWorkflowInfo) {
        return;
      }

      pilotInfo = this.genPilot({
        pilotId: resWorkflowInfo.workflow_instance_id,
        pilotTimer: null,
        pilotTabInfo: tabInfo,
        pilotStatus: PilotStatusEnum.HOLD,
        pilotLastMessage: "",
        pilotRepeatHash: "",
        pilotRepeatCurrent: 0,
        pilotThirdPartUrl: "",
        pilotCookie: "",
        pilotCsrfToken: "",
        pilotCaseInfo: resCaseInfo || caseInfo,
        pilotWorkflowInfo: resWorkflowInfo,
      });
      this.pilotMap.set(resWorkflowInfo.workflow_instance_id, pilotInfo);
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

    // 上传 pdf 文件 Cookie ，以及将文件 fileId 同 workflow 绑定
    if (pilotInfo?.pilotThirdPartUrl && pilotInfo?.pilotCookie && pilotInfo?.pilotCsrfToken) {
      await this.uploadAndBindPDF({
        workflowId,
        thirdPartUrl: pilotInfo?.pilotThirdPartUrl,
        cookie: pilotInfo.pilotCookie,
        csrfToken: pilotInfo.pilotCsrfToken,
      });
    }

    BackgroundEventManager.postConnectMessage({
      type: `ginkgoo-background-all-pilot-done`,
      pilotInfo,
    });

    // Don't need to delete pilotInfo
    // this.pilotMap.delete(caseId);
  };

  delete = (params: { workflowId?: string; tabId?: number }) => {
    const pilotInfo = this.getPilot(params);
    if (pilotInfo?.pilotTimer) {
      clearTimeout(pilotInfo?.pilotTimer);
    }
    if (pilotInfo?.pilotWorkflowInfo?.workflow_instance_id) {
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
