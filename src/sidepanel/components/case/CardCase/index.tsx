"use client";

import { Button, Card } from "antd";
import dayjs from "dayjs";
import { MouseEventHandler, memo, useEffect, useState } from "react";
// import { Button } from "@/common/components/ui/button";
import { IconCardEdit, IconMagic } from "@/common/components/ui/icon";
import UserManager from "@/common/kits/UserManager";
import Api from "@/common/kits/api";
import { ICaseItemType } from "@/common/types/case";
import { TagStatus } from "@/sidepanel/components/case/TagStatus";

interface CardCaseProps {
  itemCase: ICaseItemType;
  onCardStartClick: MouseEventHandler<HTMLButtonElement>;
  onCardEditClick?: MouseEventHandler<HTMLButtonElement>;
}

function PureCardCase(props: CardCaseProps) {
  const { itemCase, onCardStartClick, onCardEditClick } = props;

  // const [workflowList, setWorkflowList] = useState<any[]>([]);

  // const queryWorkflowList = async () => {
  //   const resWorkflowList = await Api.Ginkgoo.getWorkflowList({
  //     userId: UserManager.userInfo?.id || "",
  //     caseId: itemCase.id || "",
  //   });

  //   setWorkflowList(resWorkflowList);
  // };

  // useEffect(() => {
  //   if (itemCase.id) {
  //     queryWorkflowList();
  //   }
  // }, [itemCase.id]);

  const handleBtnStartClick = (e: any) => {
    onCardStartClick?.(e);
  };

  return (
    <Card
      hoverable={false}
      style={{
        borderRadius: "12px",
      }}
    >
      <div className="flex w-full flex-col">
        <div className="flex w-full flex-row items-center justify-between">
          <span className="line-clamp-2 text-base font-bold">{itemCase.title}</span>
          {onCardEditClick ? (
            <Button
              type="text"
              className="!p-1"
              onClick={(e: any) => {
                e.stopPropagation();
                e.preventDefault();
                onCardEditClick?.(e);
              }}
            >
              <IconCardEdit size={28} className="" />
            </Button>
          ) : null}
        </div>
        <div className="mt-1 flex w-full flex-row items-center justify-start">
          <span className="text-base text-[#B5B5C3]">{itemCase.visaType}</span>
        </div>
        {/* <div className="w-full flex-1"></div> */}
        <div className="mt-1 flex w-full flex-row items-center justify-between">
          <span className="text-sm">
            <span className="text-[#B4B3B3]">Created at </span>
            <span className="text-[#1F2937]">{dayjs(itemCase.createdAt).format("DD MMM YYYY")}</span>
          </span>
          {/* <TagStatus
            colorBackground={itemCase.caseStatusForFront?.colorBackground}
            colorText={itemCase.caseStatusForFront?.colorText}
            text={itemCase.caseStatusForFront?.text}
          /> */}
        </div>
        <div className="mt-2 flex w-full flex-col">
          {/* {workflowList.map((itemWorkflow, indexWorkflow) => {
            return <div key={`workflow-${indexWorkflow}`}>{itemWorkflow.workflow_instance_id}</div>;
          })} */}
          <Button color="default" variant="dashed" className="h-8" onClick={handleBtnStartClick}>
            <IconMagic size={24} />
            <span className="font-semibold text-primary">Start Auto-Fill</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export const CardCase = memo(PureCardCase);
