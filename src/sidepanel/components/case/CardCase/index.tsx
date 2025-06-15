"use client";

import { Card } from "antd";
import dayjs from "dayjs";
import { MouseEventHandler, memo } from "react";
import { Button } from "@/common/components/ui/button";
import { IconCardEdit } from "@/common/components/ui/icon";
import { ICaseItemType } from "@/common/types/case";
import { TagStatus } from "@/sidepanel/components/case/TagStatus";

interface CardCaseProps {
  itemCase: ICaseItemType;
  onCardClick: MouseEventHandler<HTMLDivElement>;
  onCardEditClick?: MouseEventHandler<HTMLButtonElement>;
}

function PureCardCase(props: CardCaseProps) {
  const { itemCase, onCardClick, onCardEditClick } = props;

  return (
    <Card
      hoverable
      style={{
        borderRadius: "12px",
      }}
      onClick={onCardClick}
    >
      <div className="flex h-[153px] w-full flex-col">
        <div className="flex w-full flex-row items-center justify-between">
          <span className="line-clamp-2 text-base font-bold">{itemCase.title}</span>
          {onCardEditClick ? (
            <Button
              variant="ghost"
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
          <span className="text-base text-[#B5B5C3]">{itemCase.caseType}</span>
        </div>
        <div className="w-full flex-1"></div>
        <div className="mt-1 flex w-full flex-row items-center justify-between">
          <span className="text-sm">
            <span className="text-[#B4B3B3]">Created at </span>
            <span className="text-[#1F2937]">{dayjs(itemCase.createdAt).format("DD MMM YYYY")}</span>
          </span>
          <TagStatus
            colorBackground={itemCase.caseStatusForFront?.colorBackground}
            colorText={itemCase.caseStatusForFront?.colorText}
            text={itemCase.caseStatusForFront?.text}
          />
        </div>
      </div>
    </Card>
  );
}

export const CardCase = memo(PureCardCase);
