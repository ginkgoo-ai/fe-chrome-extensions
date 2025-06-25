import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useEventManager } from "@/common/hooks/useEventManager";
import { usePageParams } from "@/common/hooks/usePageParams";
import GlobalManager from "@/common/kits/GlobalManager";
import { IPilotType } from "@/common/types/casePilot";
import SPPageCore from "@/sidepanel/components/SPPageCore";
import SPPageHeader from "@/sidepanel/components/SPPageHeader";
import { PilotStepBody } from "@/sidepanel/components/case/PilotStepBody";
import "./index.less";

export default function CaseDetail() {
  const { paramsRouter } = usePageParams();
  const { caseId, workflowId } = paramsRouter || {};

  const [pilotInfo, setPilotInfo] = useState<IPilotType | null>(null);

  useEventManager("ginkgoo-message", (message) => {
    const { type: typeMsg } = message || {};

    switch (typeMsg) {
      case "ginkgoo-background-all-pilot-update": {
        console.log("ginkgoo-background-all-pilot-update", message);
        const { pilotInfo: pilotInfoMsg } = message;
        const {
          // pilotStatus: pilotStatusMsg,
          pilotCaseInfo: pilotCaseInfoMsg,
          pilotWorkflowInfo: pilotWorkflowInfoMsg,
        } = pilotInfoMsg || {};
        const { id: caseIdMsg } = pilotCaseInfoMsg || {};
        const { workflow_instance_id: workflowIdMsg } = pilotWorkflowInfoMsg || {};

        if (caseIdMsg !== caseId || workflowIdMsg !== workflowId || !pilotCaseInfoMsg) {
          break;
        }

        setPilotInfo({
          ...pilotInfoMsg,
          pilotRefreshTS: +dayjs(),
        });
        break;
      }
      default: {
        break;
      }
    }
  });

  useEffect(() => {
    try {
      GlobalManager.g_backgroundPort?.postMessage({
        type: "ginkgoo-sidepanel-background-pilot-query",
        workflowId,
      });
    } catch (error) {
      console.debug("[Ginkgoo] CaseDetail init", error);
    }
  }, []);

  // const handleBtnBackClick = () => {
  //   try {
  //     GlobalManager.g_backgroundPort?.postMessage({
  //       type: "ginkgoo-sidepanel-all-pilot-stop",
  //       workflowId,
  //     });
  //   } catch (error) {
  //     console.log("[Ginkgoo] Sidepanel handleBtnBackClick error", error);
  //   }
  //   UtilsManager.redirectTo("/case-portal");
  // };

  return (
    <SPPageCore
      renderPageHeader={() => {
        return (
          <div className="flex w-full flex-col">
            <SPPageHeader
              title={`CaseDetail-${pilotInfo?.pilotStatus}`}
              // onBtnBackClick={handleBtnBackClick}
            />
          </div>
        );
      }}
    >
      <PilotStepBody pilotInfo={pilotInfo} />
    </SPPageCore>
  );
}
