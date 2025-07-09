import { MouseEventHandler, memo } from "react";
import { Button } from "@/common/components/ui/button";
import { IconAutoFill, IconCompleted, IconInfo, IconPause, IconView } from "@/common/components/ui/icon";
import GlobalManager from "@/common/kits/GlobalManager";
import UtilsManager from "@/common/kits/UtilsManager";
import Api from "@/common/kits/api";
import { IPilotType, PilotStatusEnum } from "@/common/types/casePilot";
import "./index.css";

interface PilotStepHeaderProps {
  pilotInfo: IPilotType | null;
  onBtnPauseClick: MouseEventHandler<HTMLButtonElement> | undefined;
}

function PurePilotStepHeader(props: PilotStepHeaderProps) {
  const { pilotInfo, onBtnPauseClick } = props;

  // const isRunning =
  //   !!pilotInfo &&
  //   [PilotStatusEnum.PAUSE, PilotStatusEnum.COMPLETED].includes(pilotInfo.pilotStatus);

  const handleBtnDownloadPdfClick = async () => {
    console.log("handleBtnDownloadPdfClick");
    if (!pilotInfo?.pilotWorkflowInfo?.progress_file_id) {
      return;
    }
    const resFilesPDFHighlight = await Api.Ginkgoo.postFilesPDFHighlight({
      fileId: pilotInfo?.pilotWorkflowInfo?.progress_file_id || "",
      highlightData: pilotInfo?.pilotWorkflowInfo?.dummy_data_usage || [],
    });
    console.log("handleBtnDownloadPdfClick", resFilesPDFHighlight);
    if (resFilesPDFHighlight) {
      UtilsManager.downloadBlob({
        blobPart: resFilesPDFHighlight,
      });
    }
  };

  // const handleBtnGotoOfficialClick = () => {
  //   console.log('handleBtnGotoOfficialClick');
  // };

  const handleBtnViewClick = () => {
    console.log("handleBtnViewClick");
    if (!!pilotInfo?.pilotTabInfo?.id) {
      GlobalManager.postMessage({
        type: "ginkgoo-sidepanel-background-tab-update",
        tabId: pilotInfo?.pilotTabInfo?.id,
        updateProperties: { active: true },
      });
    }
  };

  const renderPilotStepHeaderCompleted = () => {
    return (
      <>
        <div className="-translate-1/2 absolute left-[50%] top-[50%] min-h-full w-[200%] overflow-hidden rounded-lg bg-[#CAF4D0] pb-[100%]"></div>
        <div className="relative box-border w-full bg-[rgba(0,0,0,0)] p-0.5">
          <div className="box-border flex w-full flex-col gap-1.5 overflow-hidden rounded-lg bg-white p-3">
            <div className="flex flex-row items-start justify-between gap-3">
              <div className="flex flex-[0_0_auto]">
                <IconCompleted size={40} />
              </div>
              <div className="flex w-0 flex-1 flex-col items-start justify-start">
                <div className="flex w-full flex-row items-center">
                  <div className="flex-1 truncate text-lg text-[#1F2937]">Auto Form Fill Completed</div>
                  <div className="flex flex-[0_0_auto] flex-row gap-3">
                    <div className="text-xs">
                      <span className="font-bold text-[#000000]">32</span>
                      <span className="text-[#4B5563]"> of 45 fields</span>
                    </div>
                    <div className="text-xs text-[#1AC654]">33%</div>
                  </div>
                </div>
                <div className="w-full truncate text-sm text-[#98A1B7]">Ahmed Hassan - Skilled Worker Visa</div>
              </div>
            </div>
            <div className="box-border flex w-full flex-col rounded-lg bg-[#EEF4FF] p-2.5">
              <div className="mb-3.5 mt-2.5 flex flex-row">
                <div className="flex flex-[0_0_2.25rem] flex-row justify-center">
                  <IconInfo size={18} />
                </div>
                <div className="flex flex-1 flex-col text-sm text-primary">
                  <span>Ready for Your Final Check 🧐</span>
                  <span>For the final steps, including review and official submission, please visit the government website.</span>
                </div>
              </div>
              <div className="flex h-11 w-full flex-row items-center justify-between gap-1 rounded-xl border border-dashed border-[#D8DFF5] bg-white px-1">
                <Button variant="ghost" className="w-0 flex-[1_1_auto]" onClick={handleBtnDownloadPdfClick}>
                  <IconPause size={20} />
                  <span className="truncate text-primary">Download Complete PDF</span>
                </Button>

                <div className="h-3.5 w-0.5 flex-[0_0_auto] bg-[#CDA4F7]"></div>

                <Button variant="ghost" className="w-0 flex-[1_1_auto]" onClick={handleBtnViewClick}>
                  <IconView size={20} />
                  <span className="truncate text-primary">Inspect Current Step</span>
                  {/* <span className="text-primary truncate">Go to Official Submission Portal</span> */}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderPilotStepHeaderRunning = () => {
    return (
      <>
        <div className="animate-spin-header absolute left-[50%] top-[50%] min-h-full w-[200%] overflow-hidden rounded-lg pb-[100%]"></div>
        <div className="relative box-border w-full bg-[rgba(0,0,0,0)] p-0.5">
          <div className="box-border flex w-full flex-col gap-1.5 overflow-hidden rounded-lg bg-white p-3">
            <div className="flex flex-row items-start justify-between gap-3">
              <div className="flex flex-[0_0_auto]">
                <IconAutoFill size={40} isSpin={false} />
              </div>
              <div className="flex w-0 flex-1 flex-col items-start justify-start">
                <div className="flex w-full flex-row items-center">
                  <div className="flex-1 truncate text-lg text-[#1F2937]">Auto Form Filling...</div>
                  <div className="flex flex-[0_0_auto] flex-row gap-3">
                    <div className="text-xs">
                      <span className="font-bold text-[#000000]">32</span>
                      <span className="text-[#4B5563]"> of 45 fields</span>
                    </div>
                    <div className="text-xs text-[#1AC654]">33%</div>
                  </div>
                </div>
                <div className="w-full truncate text-sm text-[#98A1B7]">Ahmed Hassan - Skilled Worker Visa</div>
                <div className="-ml-4 flex w-full flex-row items-center justify-start overflow-hidden">
                  <Button variant="ghost" className="w-0 max-w-fit flex-[1_1_auto]" onClick={onBtnPauseClick}>
                    <IconPause size={20} />
                    <span className="truncate text-primary">Pause Automation</span>
                  </Button>

                  <div className="h-3.5 w-0.5 flex-[0_0_auto] bg-[#CDA4F7]"></div>

                  <Button variant="ghost" className="w-0 max-w-fit flex-[1_1_auto]" onClick={handleBtnViewClick}>
                    <IconView size={20} />
                    <span className="truncate text-primary">Inspect Current Step</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="relative flex w-full flex-[0_0_auto] items-center justify-center overflow-hidden rounded-lg">
      {pilotInfo?.pilotStatus === PilotStatusEnum.COMPLETED ? renderPilotStepHeaderCompleted() : renderPilotStepHeaderRunning()}
    </div>
  );
}

export const PilotStepHeader = memo(PurePilotStepHeader);
