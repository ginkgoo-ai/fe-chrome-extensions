import { Alert, Button, Spin, message as messageAntd } from "antd";
import { produce } from "immer";
import { cloneDeep } from "lodash";
import { Loader2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IconExtensionStart, IconExtensionStop } from "@/common/components/ui/icon";
import { MESSAGE } from "@/common/config/message";
import { useEventManager } from "@/common/hooks/useEventManager";
import { usePageParams } from "@/common/hooks/usePageParams";
import { useStateCallback } from "@/common/hooks/useStateCallback";
import { cn } from "@/common/kits";
import CaseManager from "@/common/kits/CaseManager";
import GlobalManager from "@/common/kits/GlobalManager";
import LockManager from "@/common/kits/LockManager";
import UserManager from "@/common/kits/UserManager";
import UtilsManager from "@/common/kits/UtilsManager";
import Api from "@/common/kits/api";
import { ICaseItemType } from "@/common/types/case";
import { IPilotType, PilotStatusEnum, WorkflowTypeEnum } from "@/common/types/casePilot";
import SPPageCore from "@/sidepanel/components/SPPageCore";
import SPPageHeader from "@/sidepanel/components/SPPageHeader";
import { ModalNewWorkflow } from "@/sidepanel/components/case/ModalNewWorkflow";
import { PilotReady } from "@/sidepanel/components/case/PilotReady";
import { PilotWorkflow } from "@/sidepanel/components/case/PilotWorkflow";
import "./index.less";

export default function CaseDetail() {
  const { location, paramsRouter } = usePageParams();

  const locationRef = useRef(location);
  const paramsRouterRef = useRef(paramsRouter);

  const [caseInfo, setCaseInfo] = useState<ICaseItemType | null>(null);
  const [workflowDefinitionId, setWorkflowDefinitionId] = useState<string>("");
  const [pilotInfoCurrent, setPilotInfoCurrent] = useState<IPilotType | null>(null);
  const [pilotList, setPilotList] = useStateCallback<IPilotType[]>([]);
  const [isLoadingQueryWorkflowList, setLoadingQueryWorkflowList] = useState<boolean>(true);
  const [isLoadingExtensionStop, setLoadingExtensionStop] = useState<boolean>(false);
  const [isModalNewWorkflowOpen, setModalNewWorkflowOpen] = useState<boolean>(false);

  const lockId = "pilot-workflow-list";

  useEventManager("ginkgoo-extensions", async (message) => {
    const { type: typeMsg } = message || {};

    switch (typeMsg) {
      case "ginkgoo-background-all-pilot-update": {
        console.log("ginkgoo-background-all-pilot-update", message);
        const { pilotInfo: pilotInfoMsg } = message;
        const {
          pilotStatus: pilotStatusMsg,
          pilotCaseInfo: pilotCaseInfoMsg,
          pilotWorkflowInfo: pilotWorkflowInfoMsg,
        } = pilotInfoMsg || {};
        const { id: caseIdMsg } = pilotCaseInfoMsg || {};
        const { workflow_instance_id: workflowIdMsg } = pilotWorkflowInfoMsg || {};

        if (caseIdMsg !== paramsRouter.caseId || !pilotCaseInfoMsg) {
          break;
        }

        if (!!workflowIdMsg) {
          setModalNewWorkflowOpen(false);
          setPilotInfoCurrent(pilotInfoMsg);
        }

        if (pilotStatusMsg === PilotStatusEnum.START) {
          refreshWorkflowList({
            cb: () => {
              GlobalManager.postMessage({
                type: "ginkgoo-sidepanel-background-pilot-query",
                workflowId: workflowIdMsg,
              });
            },
          });
          break;
        }

        await LockManager.acquireLock(lockId);
        setPilotList(
          (prev) =>
            cloneDeep(
              produce(prev, (draft) => {
                const indexPilot = draft.findIndex((item) => {
                  return item?.pilotWorkflowInfo?.workflow_instance_id === workflowIdMsg;
                });
                if (indexPilot >= 0) {
                  draft[indexPilot] = pilotInfoMsg;
                }
              })
            ),
          () => {
            LockManager.releaseLock(lockId);
          }
        );
        break;
      }
      case "ginkgoo-background-all-pilot-done": {
        const { pilotInfo: pilotInfoMsg } = message;
        const { pilotWorkflowInfo: pilotWorkflowInfoMsg } = pilotInfoMsg || {};
        const { workflow_instance_id: workflowIdMsg } = pilotWorkflowInfoMsg || {};

        await LockManager.acquireLock(lockId);
        setPilotList(
          (prev) =>
            produce(prev, (draft) => {
              let indexPilot = -1;
              draft.forEach((itemDraft, indexDraft) => {
                if (itemDraft?.pilotWorkflowInfo?.workflow_instance_id === workflowIdMsg) {
                  indexPilot = indexDraft;
                }
                itemDraft.pilotStatus = PilotStatusEnum.HOLD;
              });

              console.log("ginkgoo-background-all-pilot-done", workflowIdMsg, indexPilot);

              if (indexPilot >= 0) {
                window.document
                  .getElementById(`workflow-item-btn-download-${indexPilot}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "center" });

                setPilotInfoCurrent(pilotInfoMsg);
                draft[indexPilot] = pilotInfoMsg;
              }
            }),
          () => {
            LockManager.releaseLock(lockId);
            setTimeout(() => {
              refreshWorkflowList();
            }, 200);
          }
        );

        break;
      }
      default: {
        break;
      }
    }
  });

  const refreshCaseDetail = async () => {
    const resCaseDetail = await Api.Ginkgoo.queryCaseDetail({
      caseId: paramsRouter.caseId,
    });

    if (resCaseDetail?.id) {
      setCaseInfo(CaseManager.parseCaseInfo(resCaseDetail));
      return;
    }

    messageAntd.open({
      type: "error",
      content: MESSAGE.TOAST_REFRESH_CASE_DETAIL_FAILED,
    });
  };

  const refreshWorkflowDefinitions = async () => {
    const resWorkflowDefinitions = await Api.Ginkgoo.getWorkflowDefinitions({
      page: 1,
      page_size: 1,
      workflow_type: WorkflowTypeEnum.VISA,
    });

    if (resWorkflowDefinitions?.items?.length > 0) {
      const item = resWorkflowDefinitions?.items[0];
      setWorkflowDefinitionId(item.workflow_definition_id);
      return;
    }

    messageAntd.open({
      type: "error",
      content: MESSAGE.TOAST_WORKFLOW_DEFINITIONS_MISSING,
    });
  };

  const refreshWorkflowList = async (params?: { cb?: () => void }) => {
    const { cb } = params || {};

    // setLoadingQueryWorkflowList(true);

    const resWorkflowList = await Api.Ginkgoo.getWorkflowList({
      userId: UserManager.userInfo?.id || "",
      caseId: paramsRouter.caseId || "",
    });

    if (resWorkflowList?.length >= 0) {
      await LockManager.acquireLock(lockId);
      setPilotList(
        (prev) => {
          return resWorkflowList?.map((itemNewWorkflow) => {
            const oldPilot = prev.find((itemOld) => {
              return itemOld?.pilotWorkflowInfo?.workflow_instance_id === itemNewWorkflow.workflow_instance_id;
            });

            return {
              pilotId: itemNewWorkflow.workflow_instance_id,
              pilotTimer: null,
              pilotTabInfo: {} as chrome.tabs.Tab,
              pilotStatus: PilotStatusEnum.HOLD,
              pilotLastMessage: "",
              pilotRepeatHash: "",
              pilotRepeatCurrent: 0,
              pilotThirdPartUrl: "",
              pilotThirdPartMethod: "",
              pilotCookie: "",
              pilotCsrfToken: "",
              ...(oldPilot || {}),
              pilotCaseInfo: caseInfo,
              pilotWorkflowInfo: {
                ...oldPilot?.pilotWorkflowInfo,
                ...(itemNewWorkflow || {}),
              },
              // pilotRefreshTS: +dayjs(),
            };
          });
        },
        () => {
          LockManager.releaseLock(lockId);
          setLoadingQueryWorkflowList(false);
          cb?.();
        }
      );
      return;
    }

    messageAntd.open({
      type: "error",
      content: MESSAGE.TOAST_REFRESH_WORKFLOW_LIST_FAILED,
    });
  };

  const init = async () => {
    await refreshCaseDetail();
    refreshWorkflowDefinitions();
    refreshWorkflowList({
      cb: () => {
        GlobalManager.postMessage({
          type: "ginkgoo-sidepanel-background-pilot-query",
        });
      },
    });
  };

  useEffect(() => {
    locationRef.current = location;
    paramsRouterRef.current = paramsRouter;
  }, [location, paramsRouter]);

  useEffect(() => {
    init();
  }, [location.search]);

  useEffect(() => {
    if (!!pilotInfoCurrent?.pilotWorkflowInfo?.workflow_instance_id && pilotInfoCurrent?.pilotStatus !== PilotStatusEnum.HOLD) {
      setLoadingExtensionStop(false);
    }
  }, [pilotInfoCurrent?.pilotWorkflowInfo?.workflow_instance_id, pilotInfoCurrent?.pilotStatus]);

  const handleBtnBackClick = () => {
    UtilsManager.redirectTo("/case-portal");
  };

  const handleBtnExtensionStartClick = () => {
    if (workflowDefinitionId) {
      setModalNewWorkflowOpen(true);
    } else {
      messageAntd.open({
        type: "error",
        content: MESSAGE.TOAST_WORKFLOW_DEFINITIONS_MISSING,
      });
      refreshWorkflowDefinitions();
    }
  };

  const handleBtnExtensionStopClick = () => {
    setLoadingExtensionStop(true);

    GlobalManager.postMessage({
      type: "ginkgoo-sidepanel-all-pilot-stop",
      workflowId: pilotInfoCurrent?.pilotWorkflowInfo?.workflow_instance_id,
    });
  };

  const handleNewWorkflowFinish = async () => {
    if (!workflowDefinitionId) {
      messageAntd.open({
        type: "error",
        content: MESSAGE.TOAST_WORKFLOW_DEFINITIONS_MISSING,
      });
      refreshWorkflowDefinitions();
      return;
    }

    GlobalManager.postMessage({
      type: "ginkgoo-sidepanel-all-pilot-start",
      isNewWorkflow: true,
      caseId: caseInfo?.id || "",
      workflowDefinitionId,
    });
  };

  const handleBtnContinueClick = async (params: { workflowId: string }) => {
    const { workflowId } = params || {};

    GlobalManager.postMessage({
      type: "ginkgoo-sidepanel-all-pilot-start",
      workflowId,
      caseId: caseInfo?.id || "",
    });
  };

  const handleQueryWorkflowDetail = async (params: { workflowId: string }) => {
    const { workflowId } = params || {};

    const resWorkflowDetail = await Api.Ginkgoo.getWorkflowDetail({
      workflowId,
    });

    if (!resWorkflowDetail?.workflow_instance_id) {
      messageAntd.open({
        type: "error",
        content: MESSAGE.TOAST_REFRESH_WORKFLOW_DETAIL_FAILED,
      });
      return;
    }

    await LockManager.acquireLock(lockId);

    setPilotList(
      (prev) =>
        cloneDeep(
          produce(prev, (draft) => {
            const indexPilot = draft.findIndex((item) => {
              return item?.pilotWorkflowInfo?.workflow_instance_id === resWorkflowDetail?.workflow_instance_id;
            });
            if (indexPilot >= 0) {
              draft[indexPilot].pilotWorkflowInfo = resWorkflowDetail;
            }
          })
        ),
      () => {
        LockManager.releaseLock(lockId);
      }
    );
  };

  return (
    <SPPageCore
      renderPageHeader={() => {
        return (
          <div className="flex w-full flex-col">
            <SPPageHeader
              title={`${caseInfo?.title || ""}`}
              renderTitleExtend={() => {
                return (
                  <div className="flex flex-row items-center justify-between gap-2.5">
                    {!pilotInfoCurrent || pilotInfoCurrent?.pilotStatus === PilotStatusEnum.HOLD ? (
                      <Button type="primary" className="h-9 flex-1" onClick={handleBtnExtensionStartClick}>
                        <div className="flex flex-row items-center gap-2">
                          <IconExtensionStart />
                          <span className="font-bold">Start auto-fill</span>
                        </div>
                      </Button>
                    ) : (
                      <Button type="primary" className="h-9 flex-1" disabled={isLoadingExtensionStop} onClick={handleBtnExtensionStopClick}>
                        {/* color-[#0D1118] dark:color-[#F1F1F4] */}
                        <div className="flex flex-row items-center gap-2">
                          {isLoadingExtensionStop ? <Loader2Icon className="animate-spin" /> : <IconExtensionStop />}
                          <span className="font-bold">Stop auto-fill</span>
                        </div>
                      </Button>
                    )}
                  </div>
                );
              }}
              onBtnBackClick={handleBtnBackClick}
            />
          </div>
        );
      }}
    >
      {isLoadingQueryWorkflowList ? (
        <Spin>
          <div className="min-h-screen w-full bg-transparent"></div>
        </Spin>
      ) : (
        <>
          {pilotList?.length === 0 ? (
            <PilotReady />
          ) : (
            <div className={cn("box-border flex flex-1 flex-col gap-3 overflow-y-auto p-4")}>
              {pilotInfoCurrent?.pilotStatus === PilotStatusEnum.HOLD && !!pilotInfoCurrent?.pilotLastMessage ? (
                <Alert style={{ width: "100%" }} message={pilotInfoCurrent.pilotLastMessage} type="warning" showIcon closable />
              ) : null}
              {pilotList.map((itemPilot, indexPilot) => {
                return (
                  <PilotWorkflow
                    key={`pilot-item-${indexPilot}`}
                    caseInfo={caseInfo}
                    pilotInfo={itemPilot}
                    indexPilot={indexPilot}
                    pilotInfoCurrent={pilotInfoCurrent}
                    onQueryWorkflowDetail={handleQueryWorkflowDetail}
                    onBtnContinueClick={handleBtnContinueClick}
                  />
                );
              })}
            </div>
          )}
        </>
      )}
      {/* isModalInstallExtension isModalNewWorkflow */}
      <ModalNewWorkflow isOpen={isModalNewWorkflowOpen} onOpenUpdate={setModalNewWorkflowOpen} onFinish={handleNewWorkflowFinish} />
    </SPPageCore>
  );
}
