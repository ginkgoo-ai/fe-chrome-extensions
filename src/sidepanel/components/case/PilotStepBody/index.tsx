import type { CollapseProps } from "antd";
import { Alert, Button, Collapse, Spin } from "antd";
import { Check } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { IconInfo, IconLoading, IconStepDeclaration, IconStepDot } from "@/common/components/ui/icon";
import { cn } from "@/common/kits";
import GlobalManager from "@/common/kits/GlobalManager";
import { IPilotType, IWorkflowStepType, PilotStatusEnum } from "@/common/types/casePilot";
import { PilotStepBodyNormal } from "@/sidepanel/components/case/PilotStepBodyNormal";
import "./index.css";

interface PilotStepBodyProps {
  pilotInfo: IPilotType | null;
}

function PurePilotStepBody(props: PilotStepBodyProps) {
  const { pilotInfo } = props;

  const [stepListActiveKeyBody, setStepListActiveKeyBody] = useState<string>("");
  const [stepListItemsBody, setStepListItemsBody] = useState<CollapseProps["items"]>([]);
  // const [percent, setPercent] = useState(0);

  // const handleContinueFilling = (params: { actionlistPre: IActionItemType[] }) => {
  //   const { actionlistPre } = params || {};

  //   GlobalManager.postMessage({
  //     type: "ginkgoo-sidepanel-all-pilot-start",
  //     workflowId: pilotInfo?.pilotWorkflowInfo?.workflow_instance_id,
  //     caseId,
  //     actionlistPre,
  //   });
  // };

  const handleBtnProceedToFormClick = useCallback(() => {
    if (!!pilotInfo?.pilotTabInfo?.id) {
      GlobalManager.postMessage({
        type: "ginkgoo-sidepanel-background-tab-update",
        tabId: pilotInfo?.pilotTabInfo?.id,
        updateProperties: { active: true },
      });
    }
  }, [pilotInfo?.pilotTabInfo?.id]);

  // update collapse
  useEffect(() => {
    // console.log('PilotStepBodyProps', pilotInfo?.pilotWorkflowInfo?.steps);
    if (!pilotInfo?.pilotWorkflowInfo?.steps) {
      return;
    }

    const renderStepLabel = (itemStep: IWorkflowStepType, indexStep: number) => {
      // const isSelect = stepListActiveKeyBody.includes(itemStep.step_key);
      return (
        <div
          id={`step-item-${indexStep}`}
          className={cn("flex w-full flex-row items-center justify-between gap-3", {
            "border-bottom": indexStep < Number(pilotInfo?.pilotWorkflowInfo?.steps?.length) - 1,
          })}
        >
          <div className="flex w-0 flex-1 flex-row gap-3.5">
            <div className="flex h-6 w-4 flex-[0_0_auto] flex-row items-center justify-center">
              {itemStep.step_key === "Declaration" ? (
                <IconStepDeclaration size={16} />
              ) : (
                <>
                  {itemStep.status === "COMPLETED_SUCCESS" ? (
                    <Check size={16} color="#00ff00" />
                  ) : pilotInfo?.pilotStatus !== PilotStatusEnum.HOLD &&
                    itemStep.step_key === pilotInfo?.pilotWorkflowInfo?.current_step_key ? (
                    <IconLoading size={16} className="animate-spin" />
                  ) : (
                    <IconStepDot size={16} />
                  )}
                </>
              )}
            </div>
            <div className="flex w-0 flex-1 items-center justify-start gap-3">
              <div className="truncate">{itemStep.name}</div>
              {itemStep.step_key === "Declaration" ? (
                <div className="mt-0.5 flex h-full flex-[0_0_auto] items-center justify-center text-xs text-[#FF55CB]">
                  Confirm Declaration
                </div>
              ) : null}
            </div>
          </div>
          {/* <div className="flex-[0_0_auto]">
            <IconStepDown
              size={10}
              color={isSelect ? "#0061FD" : "#98A1B7"}
              className={cn("transition-all", {
                "rotate-180": isSelect,
              })}
            />
          </div> */}
        </div>
      );
    };

    const renderStepChildren = (itemStep: IWorkflowStepType) => {
      return (
        <div className="border-bottom">
          <PilotStepBodyNormal itemStep={itemStep} onBtnProceedToFormClick={handleBtnProceedToFormClick} />
        </div>
      );
    };

    setStepListItemsBody(
      pilotInfo?.pilotWorkflowInfo?.steps?.map((itemStep, indexStep) => {
        return {
          key: itemStep.step_key,
          label: renderStepLabel(itemStep, indexStep),
          showArrow: false,
          children: renderStepChildren(itemStep),
        };
      })
    );
  }, [pilotInfo, handleBtnProceedToFormClick]);

  useEffect(() => {
    if (Number(pilotInfo?.pilotWorkflowInfo?.steps?.length) > 0) {
      const indexCurrentStep: number = Number(
        pilotInfo?.pilotWorkflowInfo?.steps?.findIndex((itemStep) => {
          return itemStep.step_key === pilotInfo?.pilotWorkflowInfo?.current_step_key;
        })
      );

      if (!(indexCurrentStep >= 0)) {
        return;
      }

      const currentStep = pilotInfo?.pilotWorkflowInfo?.steps?.[indexCurrentStep];
      // const percentTmp = ((indexCurrentStep + 1) / Number(workflowSteps?.length)) * 100;
      // setPercent(percentTmp);

      if (pilotInfo?.pilotStatus === PilotStatusEnum.HOLD) {
        const isInterrupt = currentStep?.data?.form_data?.some((itemFormData) => {
          return itemFormData.question.type === "interrupt";
        });
        if (isInterrupt && pilotInfo.pilotWorkflowInfo?.current_step_key) {
          setStepListActiveKeyBody(pilotInfo.pilotWorkflowInfo?.current_step_key || "");
          setTimeout(() => {
            window.document
              .getElementById(`step-item-${pilotInfo?.pilotWorkflowInfo?.current_step_key}`)
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 500);
          return;
        }
      }
    }

    setStepListActiveKeyBody("");
  }, [pilotInfo]);

  return stepListItemsBody && stepListItemsBody.length > 0 ? (
    <div className="relative box-border flex w-full flex-col items-center justify-start rounded-lg border border-[#D8DFF5] p-2">
      <Collapse className="w-full" activeKey={stepListActiveKeyBody} ghost items={stepListItemsBody} />
      {pilotInfo?.pilotTabInfo?.id ? (
        <Alert
          message={<div className="text-base text-[#075985]">Manual Input Required</div>}
          icon={<IconInfo size={16} className="mr-2 mt-1" />}
          description={
            <div className="-ml-8 flex flex-col items-start gap-2">
              <div className="text-sm text-[#0369A1]">
                To ensure full compliance with legal standards, your personal attention is required for specific items in this form. The
                system will now direct you to the relevant section for your manual input and confirmation.
              </div>
              <Button color="primary" variant="outlined" onClick={handleBtnProceedToFormClick}>
                Proceed to Form
              </Button>
            </div>
          }
          type="info"
          showIcon
          closable
        />
      ) : null}
    </div>
  ) : (
    <Spin tip="Loading" size="small">
      <div className="h-20 w-full"></div>
    </Spin>
  );
}

export const PilotStepBody = memo(PurePilotStepBody);
