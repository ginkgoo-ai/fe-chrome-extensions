"use client";

import { Button, Card, Progress, message as messageAntd } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { produce } from "immer";
import { ChevronRight, Download, Play } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { IconCompleted, IconIncompleted, IconLoading } from "@/common/components/ui/icon";
import { MESSAGE } from "@/common/config/message";
import { useEventManager } from "@/common/hooks/useEventManager";
import { cn } from "@/common/kits";
import GlobalManager from "@/common/kits/GlobalManager";
import UtilsManager from "@/common/kits/UtilsManager";
import Api from "@/common/kits/api";
import { ICaseItemType } from "@/common/types/case";
import { IPilotType, IWorkflowType, PilotStatusEnum, PilotThirdPartTypeEnum } from "@/common/types/casePilot";
import { PilotStepBody } from "@/sidepanel/components/case/PilotStepBody";
import "./index.css";

interface PilotWorkflowProps {
  caseInfo: ICaseItemType | null;
  workflowInfo: IWorkflowType;
  indexKey: string;
  pilotInfoCurrent: IPilotType | null;
}

dayjs.extend(utc);

function PurePilotWorkflow(props: PilotWorkflowProps) {
  const { caseInfo, workflowInfo, indexKey, pilotInfoCurrent } = props;

  const isFoldInit = useRef<boolean>(true);

  const [isFold, setFold] = useState<boolean>(true);
  const [isLoadingDownload, setLoadingDownload] = useState<boolean>(false);
  const [pilotInfo, setPilotInfo] = useState<IPilotType | null>(null);

  const isCurrentPilot = useMemo(() => {
    return workflowInfo?.workflow_instance_id === pilotInfoCurrent?.pilotWorkflowInfo?.workflow_instance_id;
  }, [workflowInfo?.workflow_instance_id, pilotInfoCurrent?.pilotWorkflowInfo?.workflow_instance_id]);

  const isShowBtnContinue = useMemo(() => {
    return (
      pilotInfo?.pilotStatus === PilotStatusEnum.HOLD &&
      (!!pilotInfo?.pilotWorkflowInfo?.unique_application_number || !!pilotInfo?.pilotTabInfo?.id)
    );
  }, [pilotInfo]);

  const isDisableBtnDownload = useMemo(() => {
    return !pilotInfo?.pilotWorkflowInfo?.progress_file_id;
  }, [pilotInfo?.pilotWorkflowInfo?.progress_file_id]);

  const workflowCreateTime = useMemo(() => {
    return pilotInfo?.pilotWorkflowInfo?.created_at
      ? dayjs.utc(pilotInfo?.pilotWorkflowInfo?.created_at).local().format("MMM DD, YYYY HH: mm")
      : "";
  }, [pilotInfo?.pilotWorkflowInfo?.created_at]);

  useEventManager("ginkgoo-extensions", (message) => {
    const { type: typeMsg } = message;

    switch (typeMsg) {
      case "ginkgoo-background-all-pilot-query": {
        const { pilotInfo: pilotInfoMsg } = message;

        if (pilotInfoMsg?.pilotWorkflowInfo?.workflow_instance_id === workflowInfo?.workflow_instance_id) {
          setPilotInfo(pilotInfoMsg);
        }
        break;
      }
      default: {
        break;
      }
    }
  });

  useEffect(() => {
    if (isCurrentPilot) {
      setPilotInfo(pilotInfoCurrent);
    } else {
      setPilotInfo((prev) => {
        if (prev) {
          return produce(prev, (draft) => {
            draft.pilotWorkflowInfo = {
              ...(workflowInfo || {}),
              ...(draft.pilotWorkflowInfo || {}),
            };
          });
        } else {
          return {
            pilotId: workflowInfo.workflow_instance_id,
            pilotTimer: null,
            pilotTabInfo: null,
            pilotStatus: PilotStatusEnum.HOLD,
            pilotLastMessage: "",
            pilotRepeatHash: "",
            pilotRepeatCurrent: 0,
            pilotThirdPartType: PilotThirdPartTypeEnum.NONE,
            pilotThirdPartMethod: "",
            pilotThirdPartUrl: "",
            pilotCookie: "",
            pilotCsrfToken: "",
            pilotUniqueApplicationNumber: "",
            pilotCaseInfo: caseInfo,
            pilotWorkflowInfo: workflowInfo,
          };
        }
      });
    }
  }, [isCurrentPilot, caseInfo, workflowInfo, pilotInfoCurrent]);

  useEffect(() => {
    const getIsInterrupt = () => {
      const indexCurrentStep: number = Number(
        pilotInfo?.pilotWorkflowInfo?.steps?.findIndex((itemStep) => {
          return itemStep.step_key === pilotInfo.pilotWorkflowInfo?.current_step_key;
        })
      );

      if (!(indexCurrentStep >= 0)) {
        return;
      }

      const currentStep = pilotInfo?.pilotWorkflowInfo?.steps?.[indexCurrentStep];
      const isInterrupt = currentStep?.data?.form_data?.some((itemFormData) => {
        return itemFormData.question.type === "interrupt";
      });
      return isInterrupt;
    };

    if (isCurrentPilot && pilotInfo?.pilotStatus === PilotStatusEnum.HOLD && getIsInterrupt()) {
      if (isFoldInit.current) {
        isFoldInit.current = false;
        setFold(false);
        window.document.getElementById(`workflow-item-${indexKey}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      isFoldInit.current = true;
    }
  }, [pilotInfo, isCurrentPilot, indexKey]);

  useEffect(() => {
    if (workflowInfo?.workflow_instance_id) {
      GlobalManager.postMessage({
        type: "ginkgoo-sidepanel-background-pilot-query",
        workflowId: workflowInfo?.workflow_instance_id,
      });
    }
  }, [workflowInfo?.workflow_instance_id]);

  const handleQueryWorkflowDetail = async () => {
    const resWorkflowDetail = await Api.Ginkgoo.getWorkflowDetail({
      workflowId: workflowInfo.workflow_instance_id,
    });

    if (!resWorkflowDetail?.workflow_instance_id) {
      messageAntd.open({
        type: "error",
        content: MESSAGE.TOAST_REFRESH_WORKFLOW_DETAIL_FAILED,
      });
      return;
    }

    setPilotInfo((prev) => {
      if (prev) {
        return produce(prev, (draft) => {
          draft.pilotWorkflowInfo = resWorkflowDetail;
        });
      } else {
        return {
          pilotId: resWorkflowDetail.workflow_instance_id,
          pilotTimer: null,
          pilotTabInfo: null,
          pilotStatus: PilotStatusEnum.HOLD,
          pilotLastMessage: "",
          pilotRepeatHash: "",
          pilotRepeatCurrent: 0,
          pilotThirdPartType: PilotThirdPartTypeEnum.NONE,
          pilotThirdPartMethod: "",
          pilotThirdPartUrl: "",
          pilotCookie: "",
          pilotCsrfToken: "",
          pilotUniqueApplicationNumber: "",
          pilotCaseInfo: caseInfo,
          pilotWorkflowInfo: resWorkflowDetail,
        };
      }
    });
  };

  const handleHeaderClick = () => {
    if (isFold) {
      handleQueryWorkflowDetail();
    }
    setFold((prev) => {
      return !prev;
    });
  };

  const handleBtnPDFDownloadClick = async () => {
    setLoadingDownload(true);

    // Step1: Query workflow Detail

    // Step2: Get PDF blob
    const resFilesPDFHighlight = await Api.Ginkgoo.postFilesPDFHighlight({
      fileId: pilotInfo?.pilotWorkflowInfo?.progress_file_id || "",
      highlightData: pilotInfo?.pilotWorkflowInfo?.dummy_data_usage || [],
    });
    // Step3: Download PDF file
    console.log("handleBtnDownloadPdfClick", resFilesPDFHighlight);
    if (resFilesPDFHighlight) {
      UtilsManager.downloadBlob({
        blobPart: resFilesPDFHighlight,
        fileName: `${caseInfo?.clientName || ""}-${caseInfo?.visaType || ""}-${dayjs.utc(pilotInfo?.pilotWorkflowInfo?.updated_at).local().format("YYYYMMDDHHmmss")}.pdf`,
      });
    } else {
      messageAntd.open({
        type: "error",
        content: MESSAGE.TOAST_DOWNLOAD_PDF_FILE_FAILED,
      });
    }

    setTimeout(() => {
      setLoadingDownload(false);
    }, 200);
  };

  const handleBtnContinueClick = () => {
    GlobalManager.postMessage({
      type: "ginkgoo-sidepanel-all-pilot-start",
      workflowId: pilotInfo?.pilotWorkflowInfo?.workflow_instance_id || "",
      caseId: caseInfo?.id || "",
    });
  };

  return (
    <div
      id={`workflow-item-${indexKey}`}
      className="workflow-wrap relative flex w-full flex-[0_0_auto] items-center justify-center overflow-hidden rounded-lg"
    >
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-full overflow-hidden rounded-lg bg-[#E2E4E8] pr-[800%]"
          // {
          //   'animate-spin-workflow':
          //     isCurrentPilot && pilotInfo?.pilotStatus !== PilotStatusEnum.HOLD,
          // }
        )}
      ></div>
      <div className="relative box-border flex w-full flex-col bg-[rgba(0,0,0,0)] p-0.5">
        <Card>
          <div className="box-border flex h-full w-full flex-col gap-3 overflow-hidden">
            <div className="flex cursor-pointer flex-row items-start justify-between gap-3" onClick={handleHeaderClick}>
              <div className="flex flex-[0_0_auto]">
                {isCurrentPilot && pilotInfo?.pilotWorkflowInfo?.status === "COMPLETED_SUCCESS" ? (
                  <IconCompleted size={40} />
                ) : (
                  <IconIncompleted size={40} />
                )}
              </div>
              <div className="flex w-0 flex-1 flex-col">
                <div className="flex flex-row items-center gap-2">
                  {pilotInfo?.pilotStatus !== PilotStatusEnum.HOLD ? <IconLoading size={16} className="animate-spin" /> : null}
                  <span
                    className={cn("w-full truncate text-sm", {
                      "font-bold": pilotInfo?.pilotStatus !== PilotStatusEnum.HOLD,
                    })}
                  >
                    {/* {`${caseInfo?.clientName || ""}` + ` - ${caseInfo?.visaType || ""}` + ` - ${pilotInfo?.pilotStatus || ""}`} */}
                    {pilotInfo?.pilotStatus || "--"}
                  </span>
                </div>
                <div className="w-full truncate text-sm font-bold text-[#2665FF]">{workflowCreateTime}</div>
              </div>
              <div className="flex-[0_0_auto]">
                <ChevronRight
                  size={20}
                  className={cn("transition-all", {
                    "rotate-90": !isFold,
                  })}
                />
              </div>
            </div>

            {Number(pilotInfo?.pilotWorkflowInfo?.progress_percentage) >= 0 ? (
              <Progress percent={pilotInfo?.pilotWorkflowInfo?.progress_percentage} showInfo={false} />
            ) : null}

            {!isFold ? <PilotStepBody pilotInfo={pilotInfo} /> : null}

            <div className="flex w-full flex-row items-center justify-between gap-2">
              <Button
                id={`pilot-item-btn-download-${indexKey}`}
                type="default"
                className="flex-1"
                disabled={isDisableBtnDownload}
                loading={isLoadingDownload}
                onClick={handleBtnPDFDownloadClick}
              >
                <Download size={20} />
                <div className="truncate">
                  <span className="font-bold">Download</span>
                  {!isShowBtnContinue ? <span className="font-bold"> PDF</span> : null}
                </div>
              </Button>
              {isShowBtnContinue ? (
                <Button id={`pilot-item-btn-continue-${indexKey}`} type="default" className="flex-1" onClick={handleBtnContinueClick}>
                  <Play size={20} />
                  <div className="truncate">
                    <span className="font-bold">Continue</span>
                  </div>
                </Button>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export const PilotWorkflow = memo(PurePilotWorkflow);
