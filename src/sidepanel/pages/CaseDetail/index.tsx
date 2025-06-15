import { produce } from "immer";
import { cloneDeep } from "lodash";
import { useState } from "react";
import { useEffectStrictMode } from "@/common/hooks/useEffectStrictMode";
import { useEventManager } from "@/common/hooks/useEventManager";
import { usePageParams } from "@/common/hooks/usePageParams";
import Api from "@/common/kits/api";
import { IPilotType } from "@/common/types/case";
import { IWorkflowStepType } from "@/common/types/casePilot";
import SPPageCore from "@/sidepanel/components/SPPageCore";
import SPPageHeader from "@/sidepanel/components/SPPageHeader";
import { PilotStepBody } from "@/sidepanel/components/case/PilotStepBody";
import "./index.less";

export default function CaseDetail() {
  const { location, pathRouter, paramsRouter } = usePageParams();
  const { caseId, workflowId = "1221f2f4-5311-4e15-b7dd-aecd4f8d9401" } = paramsRouter || {};

  const [pilotInfo, setPilotInfo] = useState<IPilotType | null>(null);
  const [stepListCurrent, setStepListCurrent] = useState<number>(0);
  const [stepListItems, setStepListItems] = useState<IWorkflowStepType[]>([]);

  useEventManager("ginkgo-message", (message) => {
    // console.log('🚀 ~ useEventManager ~ data:', message);

    const { type: typeMsg, pilotInfo: pilotInfoMsg } = message;
    if (typeMsg === "ginkgo-background-all-case-update") {
      const { stepListCurrent: stepListCurrentMsg, stepListItems: stepListItemsMsg } = pilotInfoMsg || {};

      // pilotInfoMsg && (pilotInfoMsg.pilotStatus = PilotStatusEnum.COMPLETED);

      setPilotInfo(pilotInfoMsg);
      // setStepListCurrent(stepListCurrentMsg);
      // setStepListItems(stepListItemsMsg);

      if (stepListCurrentMsg >= 0 && stepListItemsMsg?.length > 0 && !!stepListItemsMsg[stepListCurrentMsg]) {
        setTimeout(() => {
          const { actioncurrent, actionlist } = stepListItemsMsg[stepListCurrentMsg] || {};
          if (actioncurrent >= 0 && actionlist?.length > 0) {
            document
              .getElementById(`action-item-${stepListCurrentMsg}-${actioncurrent}`)
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          } else {
            document.getElementById(`step-item-${stepListCurrentMsg}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 40);
      }
    }
  });

  const init = async () => {
    const res = await Api.Ginkgo.getWorkflowList({
      workflowId,
    });

    if (res) {
      setStepListItems(res.steps);
    }
  };

  useEffectStrictMode(() => {
    init();
  }, [workflowId]);

  const handleStepCollapseChange = async (stepKey: string) => {
    console.log("handleStepCollapseChange", stepKey);

    const res = await Api.Ginkgo.getWorkflowStepData({
      workflowId,
      stepKey,
    });

    setStepListItems((prev) =>
      cloneDeep(
        produce(prev, (draft) => {
          const index = draft.findIndex((item) => {
            return item.step_key === stepKey;
          });
          if (index >= 0) {
            draft[index].data = res;
          }
        })
      )
    );
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
