import { useEffect, useState } from "react";
import { useEventManager } from "@/common/hooks/useEventManager";
import { usePageParams } from "@/common/hooks/usePageParams";
import GlobalManager from "@/common/kits/GlobalManager";
import { IPilotType } from "@/common/types/case";
import { IWorkflowStepType } from "@/common/types/casePilot";
import SPPageCore from "@/sidepanel/components/SPPageCore";
import SPPageHeader from "@/sidepanel/components/SPPageHeader";
import { PilotStepBody } from "@/sidepanel/components/case/PilotStepBody";
import { stepListItemsDeclaration } from "@/sidepanel/pages/CaseDetail/config";
import "./index.less";

export default function CaseDetail() {
  const { paramsRouter } = usePageParams();
  const { caseId, workflowId } = paramsRouter || {};

  const [pilotInfo, setPilotInfo] = useState<IPilotType | null>(null);
  const [stepListItems, setStepListItems] = useState<IWorkflowStepType[]>([]);

  useEventManager("ginkgo-message", (message) => {
    // console.log('🚀 ~ useEventManager ~ data:', message);

    const { type: typeMsg, pilotInfo: pilotInfoMsg } = message || {};

    switch (typeMsg) {
      case "ginkgo-background-all-case-update": {
        const { steps: stepsMsg } = pilotInfoMsg || {};

        setPilotInfo(pilotInfoMsg);
        if (stepsMsg?.length > 0) {
          setStepListItems(stepsMsg.concat(stepListItemsDeclaration));
        }

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
    GlobalManager.g_backgroundPort?.postMessage({
      type: "ginkgo-sidepanel-background-case-query",
      caseId,
      workflowId,
    });
  }, []);

  const handleStepCollapseChange = async (stepKey: string) => {
    try {
      GlobalManager.g_backgroundPort?.postMessage({
        type: "ginkgo-sidepanel-background-polit-step-query",
        workflowId,
        stepKey,
      });
    } catch (error) {
      console.error("[Ginkgo] Sidepanel handleCardClick error", error);
    }
  };

  return (
    <SPPageCore
      renderPageHeader={() => {
        return <SPPageHeader title="CaseDetail" />;
      }}
    >
      <PilotStepBody pilotInfo={pilotInfo} stepListItems={stepListItems} onCollapseChange={handleStepCollapseChange} />
    </SPPageCore>
  );
}
