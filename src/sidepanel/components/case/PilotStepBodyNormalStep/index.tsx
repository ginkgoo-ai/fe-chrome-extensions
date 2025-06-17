import { Steps, Tooltip } from "antd";
import { memo } from "react";
import { IWorkflowStepDataFormDataType } from "@/common/types/casePilot";

interface PilotStepBodyNormalStepProps {
  formDataNormal: IWorkflowStepDataFormDataType[];
  stepKey: string;
  indexStep: number;
}

function PurePilotStepBodyNormalStep(props: PilotStepBodyNormalStepProps) {
  const { formDataNormal, stepKey, indexStep } = props;

  const calcActionItem = (item: IWorkflowStepDataFormDataType, indexStep: number, indexAction: number) => {
    const label = item.question.data.name;
    const value = item.question.answer.data
      .filter((item) => {
        return item.check === 1;
      })
      .map((item) => {
        return item.value;
      })
      .join(", ");

    return {
      title: (
        <div id={`action-item-${indexStep}-${indexAction}`} className="flex flex-row items-center gap-1">
          <Tooltip placement="top" title={label} mouseEnterDelay={1}>
            <div className="flex-1 truncate text-sm text-[#B4B3B3]">{label}</div>
          </Tooltip>
        </div>
      ),
      description: <div className="flex w-full flex-row gap-1 text-sm text-[#464E5F]">{value}</div>,
    };
  };

  return (
    <Steps
      progressDot
      direction="vertical"
      current={0}
      items={formDataNormal?.map((itemFormData: IWorkflowStepDataFormDataType, indexFormData: number) => {
        return calcActionItem(itemFormData, indexStep, indexFormData);
      })}
    />
  );
}

export const PilotStepBodyNormalStep = memo(PurePilotStepBodyNormalStep);
