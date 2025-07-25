import { MouseEventHandler, memo, useEffect, useState } from "react";
import { Button } from "@/common/components/ui/button";
import { IWorkflowStepDataFormDataType, IWorkflowStepType } from "@/common/types/casePilot";

interface PilotStepBodyNormalProps {
  itemStep: IWorkflowStepType;
  // indexStep: number;
  // onContinueFilling: (params: { actionlistPre: IActionItemType[] }) => void;
  onBtnProceedToFormClick: MouseEventHandler<HTMLButtonElement>;
}

function PurePilotStepBodyNormal(props: PilotStepBodyNormalProps) {
  const { itemStep, onBtnProceedToFormClick } = props;

  // const [formDataNormalStep] = useState<IWorkflowStepDataFormDataType[]>([]);
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

    // setFormDataNormalStep(formDataNormalStepTmp);
    setFormDataNormalInterrupt(formDataNormalInterruptTmp);
  }, [itemStep]);

  return (
    <div className="flex flex-col">
      {/* <PilotStepBodyNormalStep formDataNormal={formDataNormalStep} indexStep={indexStep} /> */}
      {formDataNormalInterrupt.length > 0 ? (
        // <PilotStepBodyNormalInterrupt
        //   formDataNormal={formDataNormalInterrupt}
        //   stepKey={itemStep.step_key}
        //   indexStep={indexStep}
        //   onContinueFilling={onContinueFilling}
        // />
        <Button variant="ghost" className="h-9 w-full border border-solid border-primary" onClick={onBtnProceedToFormClick}>
          <span className="truncate text-primary">Proceed to Form</span>
        </Button>
      ) : null}
    </div>
  );
}

export const PilotStepBodyNormal = memo(PurePilotStepBodyNormal);
