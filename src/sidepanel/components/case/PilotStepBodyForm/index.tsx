import { Form, Radio } from "antd";
import { memo } from "react";
import { Button } from "@/common/components/ui/button";
import { IWorkflowStepType } from "@/common/types/casePilot";
import "./index.css";

interface PilotStepBodyFormProps {
  itemStep: IWorkflowStepType;
  indexStep: number;
}

function PurePilotStepBodyForm(props: PilotStepBodyFormProps) {
  const { itemStep, indexStep } = props;

  const handleFormFinish = (values: any) => {
    console.log("handleFormFinish", values);
  };

  return (
    <Form
      className="pilot-step-body-form-wrap"
      name={itemStep.step_key}
      layout="vertical"
      size="small"
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      requiredMark={false}
      onFinish={handleFormFinish}
      autoComplete="off"
    >
      {itemStep?.data?.form_data?.map((itemQuestion, indexQuestion) => {
        const type = itemQuestion?.question?.answer.type; // itemQuestion?.question?.answer.type;

        return (
          <Form.Item
            key={`pilot-step-body-form-${indexQuestion}`}
            label={<div className="w-full truncate">{itemQuestion.question.data.name}</div>}
            name={`question_${itemQuestion.question.data.name}`}
            rules={[{ required: true, message: "" }]}
          >
            {
              {
                radio: (
                  <Radio.Group className="flex flex-col">
                    {itemQuestion?.question?.answer?.data?.map((itemAnswer, indexAnswer) => {
                      return (
                        <Radio key={`pilot-step-body-form-${indexQuestion}-${indexAnswer}`} value={itemAnswer.selector}>
                          {itemAnswer.name}
                        </Radio>
                      );
                    })}
                  </Radio.Group>
                ),
              }[type]
            }
          </Form.Item>
        );
      })}

      <Button variant="ghost" className="border-primary -mt-4 h-9 w-full border border-solid" type="submit">
        <span className="text-primary truncate">Sync & Continue Filling</span>
      </Button>
    </Form>
  );
}

export const PilotStepBodyForm = memo(PurePilotStepBodyForm);
