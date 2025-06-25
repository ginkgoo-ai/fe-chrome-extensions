import { useEffect, useState } from "react";
import { useEventManager } from "@/common/hooks/useEventManager";
import { usePageParams } from "@/common/hooks/usePageParams";
import GlobalManager from "@/common/kits/GlobalManager";
import UtilsManager from "@/common/kits/UtilsManager";
import { IActionItemType } from "@/common/types/case";
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
    // console.log('🚀 ~ useEventManager ~ data:', message);

    const { type: typeMsg, pilotInfo: pilotInfoMsg } = message || {};

    switch (typeMsg) {
      case "ginkgoo-background-all-case-update": {
        setPilotInfo(pilotInfoMsg);

        // if (stepListCurrentMsg >= 0 && stepListItemsMsg?.length > 0 && !!stepListItemsMsg[stepListCurrentMsg]) {
        //   setTimeout(() => {
        //     const { actioncurrent, actionlist } = stepListItemsMsg[stepListCurrentMsg] || {};
        //     if (actioncurrent >= 0 && actionlist?.length > 0) {
        //       document
        //         .getElementById(`action-item-${stepListCurrentMsg}-${actioncurrent}`)
        //         ?.scrollIntoView({ behavior: "smooth", block: "center" });
        //     } else {
        //       document.getElementById(`step-item-${stepListCurrentMsg}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        //     }
        //   }, 40);
        // }
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
        type: "ginkgoo-sidepanel-background-case-query",
        caseId,
        workflowId,
      });
    } catch (error) {
      console.debug("[Ginkgoo] CaseDetail init", error);
    }
  }, []);

  const handleBtnBackClick = () => {
    try {
      GlobalManager.g_backgroundPort?.postMessage({
        type: "ginkgoo-sidepanel-all-case-stop",
        workflowId,
      });
    } catch (error) {
      console.log("[Ginkgoo] Sidepanel handleBtnBackClick error", error);
    }
    UtilsManager.redirectTo("/case-portal");
  };

  // const handleStepCollapseChange = async (stepKey: string) => {
  //   try {
  //     GlobalManager.g_backgroundPort?.postMessage({
  //       type: "ginkgoo-sidepanel-background-polit-step-query",
  //       workflowId,
  //       stepKey,
  //     });
  //   } catch (error) {
  //     console.log("[Ginkgoo] Sidepanel handleStepCollapseChange error", error);
  //   }
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
