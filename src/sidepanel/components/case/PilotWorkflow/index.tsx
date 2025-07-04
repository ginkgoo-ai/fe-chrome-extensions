"use client";

import { Button, Progress, message as messageAntd } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { ChevronRight, Download } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { IconCompleted, IconIncompleted } from "@/common/components/ui/icon";
import { MESSAGE } from "@/common/config/message";
import { cn } from "@/common/kits";
import UtilsManager from "@/common/kits/UtilsManager";
import Api from "@/common/kits/api";
import { ICaseItemType } from "@/common/types/case";
import { IPilotType, PilotStatusEnum } from "@/common/types/casePilot";
import { PilotStepBody } from "@/sidepanel/components/case/PilotStepBody";
import "./index.css";

interface PilotWorkflowProps {
  caseInfo: ICaseItemType | null;
  pilotInfo: IPilotType;
  pilotInfoCurrent: IPilotType | null;
  indexPilot: number;
  onQueryWorkflowDetail: (params: { workflowId: string }) => void;
}

dayjs.extend(utc);

function PurePilotWorkflow(props: PilotWorkflowProps) {
  const { caseInfo, pilotInfo, pilotInfoCurrent, indexPilot, onQueryWorkflowDetail } = props;

  const isFoldInit = useRef<boolean>(true);

  const [isFold, setFold] = useState<boolean>(true);
  const [isDisableBtnDownload, setDisableBtnDownload] = useState<boolean>(true);
  const [isLoadingDownload, setLoadingDownload] = useState<boolean>(false);

  const workflowUpdateTime = useMemo(() => {
    return dayjs.utc(pilotInfo.pilotWorkflowInfo?.updated_at).local().format("MMM DD, YYYY HH: mm");
  }, [pilotInfo.pilotWorkflowInfo?.updated_at]);

  const isCurrentPilot = useMemo(() => {
    return pilotInfo?.pilotWorkflowInfo?.workflow_instance_id === pilotInfoCurrent?.pilotWorkflowInfo?.workflow_instance_id;
  }, [pilotInfo?.pilotWorkflowInfo?.workflow_instance_id, pilotInfoCurrent?.pilotWorkflowInfo?.workflow_instance_id]);

  useEffect(() => {
    setDisableBtnDownload(!pilotInfo.pilotWorkflowInfo?.progress_file_id);
  }, [pilotInfo.pilotWorkflowInfo?.progress_file_id]);

  // useEffect(() => {
  //   if (isCurrentPilot && pilotInfo?.pilotStatus !== PilotStatusEnum.HOLD) {
  //     if (isFoldInit.current) {
  //       isFoldInit.current = false;
  //       setFold(false);
  //       window.document.getElementById(`workflow-item-${indexPilot}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  //     }
  //   } else {
  //     isFoldInit.current = true;
  //   }
  // }, [pilotInfo, isCurrentPilot, indexPilot]);

  const handleHeaderClick = () => {
    if (isFold) {
      onQueryWorkflowDetail?.({
        workflowId: pilotInfo.pilotWorkflowInfo?.workflow_instance_id || "",
      });
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
      fileId: pilotInfo.pilotWorkflowInfo?.progress_file_id || "",
      highlightData: pilotInfo.pilotWorkflowInfo?.dummy_data_usage || [],
    });
    // Step3: Download PDF file
    console.log("handleBtnDownloadPdfClick", resFilesPDFHighlight);
    if (resFilesPDFHighlight) {
      UtilsManager.downloadBlob({
        blobPart: resFilesPDFHighlight,
        fileName: `${caseInfo?.clientName || ""}-${caseInfo?.visaType || ""}-${dayjs.utc(pilotInfo.pilotWorkflowInfo?.updated_at).local().format("YYYYMMDDHHmmss")}.pdf`,
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

  return (
    <div
      id={`workflow-item-${indexPilot}`}
      className="relative flex w-full flex-[0_0_auto] items-center justify-center overflow-hidden rounded-lg"
    >
      <div
        className={cn("workflow-wrap absolute left-[50%] top-[50%] h-[800%] min-w-full overflow-hidden rounded-lg pr-[800%]", {
          "animate-spin-workflow": isCurrentPilot && pilotInfo?.pilotStatus !== PilotStatusEnum.HOLD,
        })}
      ></div>
      <div className="relative box-border flex w-full flex-col bg-[rgba(0,0,0,0)] p-0.5">
        <div className="box-border flex h-full w-full flex-col gap-3 overflow-hidden rounded-lg bg-[#ffffff] p-3">
          <div className="flex cursor-pointer flex-row items-start justify-between gap-3" onClick={handleHeaderClick}>
            <div className="flex flex-[0_0_auto]">
              {pilotInfo.pilotWorkflowInfo?.status === "COMPLETED_SUCCESS" ? <IconCompleted size={40} /> : <IconIncompleted size={40} />}
            </div>
            <div className="flex w-0 flex-1 flex-col">
              <span className="w-full truncate text-sm text-[#4E4E4E]">
                {`${caseInfo?.clientName || ""}` + ` - ${caseInfo?.visaType || ""}` + ` - ${pilotInfo?.pilotStatus || ""}`}
              </span>
              <div className="w-full truncate text-sm text-[#98A1B7]">{workflowUpdateTime}</div>
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

          {Number(pilotInfo.pilotWorkflowInfo?.progress_percentage) >= 0 ? (
            <Progress percent={pilotInfo.pilotWorkflowInfo?.progress_percentage} showInfo={false} />
          ) : null}

          {!isFold ? <PilotStepBody pilotInfo={pilotInfo} /> : null}

          <Button
            id={`pilot-item-btn-download-${indexPilot}`}
            type="primary"
            className=""
            disabled={isDisableBtnDownload}
            loading={isLoadingDownload}
            onClick={handleBtnPDFDownloadClick}
          >
            <Download size={20} />
            <span className="font-bold">Download PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const PilotWorkflow = memo(PurePilotWorkflow);
