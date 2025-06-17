import { memo, useEffect, useState } from "react";
import { IActionItemType } from "@/common/types/case";
import { IWorkflowStepDataFormDataType, IWorkflowStepType } from "@/common/types/casePilot";
import { PilotStepBodyNormalInterrupt } from "@/sidepanel/components/case/PilotStepBodyNormalInterrupt";
import { PilotStepBodyNormalStep } from "@/sidepanel/components/case/PilotStepBodyNormalStep";

interface PilotStepBodyNormalProps {
  itemStep: IWorkflowStepType;
  indexStep: number;
  onContinueFilling: (params: { actionlistPre: IActionItemType[] }) => void;
}

function PurePilotStepBodyNormal(props: PilotStepBodyNormalProps) {
  const { itemStep, indexStep, onContinueFilling } = props;

  const [formDataNormalStep, setFormDataNormalStep] = useState<IWorkflowStepDataFormDataType[]>([]);
  const [formDataNormalInterrupt, setFormDataNormalInterrupt] = useState<IWorkflowStepDataFormDataType[]>([]);

  useEffect(() => {
    const formDataNormalStepTmp: IWorkflowStepDataFormDataType[] = [];
    const formDataNormalInterruptTmp: IWorkflowStepDataFormDataType[] = [];

    itemStep.data?.form_data?.forEach((item) => {
      if (item.question.type === "interrupt") {
        formDataNormalInterruptTmp.push(item);
      } else {
        formDataNormalStepTmp.push(item);
      }
    });
    // console.log("PurePilotStepBodyNormal", itemStep, formDataNormalStepTmp, formDataNormalInterruptTmp);
    setFormDataNormalStep(formDataNormalStepTmp);
    setFormDataNormalInterrupt(formDataNormalInterruptTmp);
  }, [itemStep]);

  return (
    <div className="flex flex-col">
      <PilotStepBodyNormalStep formDataNormal={formDataNormalStep} stepKey={itemStep.step_key} indexStep={indexStep} />
      {formDataNormalInterrupt.length > 0 ? (
        <PilotStepBodyNormalInterrupt
          formDataNormal={formDataNormalInterrupt}
          stepKey={itemStep.step_key}
          indexStep={indexStep}
          onContinueFilling={onContinueFilling}
        />
      ) : null}
    </div>
  );
}

export const PilotStepBodyNormal = memo(PurePilotStepBodyNormal);
