import { memo, useCallback } from "react";
import { Button } from "@/common/components/ui/button";
import GlobalManager from "@/common/kits/GlobalManager";
import { IPilotType } from "@/common/types/casePilot";
import imgDeclaration from "@/resource/oss/assets/imgDeclaration.webp";

interface PilotStepBodyDeclarationProps {
  pilotInfo: IPilotType | null;
}

function PurePilotStepBodyDeclaration(props: PilotStepBodyDeclarationProps) {
  const { pilotInfo } = props;

  const handleBtnJumpClick = useCallback(async () => {
    if (!!pilotInfo?.pilotTabInfo?.id) {
      GlobalManager.postMessage({
        type: "ginkgoo-sidepanel-background-tab-update",
        tabId: pilotInfo?.pilotTabInfo?.id,
        updateProperties: { active: true },
      });
    }
  }, [pilotInfo?.pilotTabInfo?.id]);

  return (
    <div className="box-border flex flex-row gap-1 rounded-xl bg-[#FF97DF1A] pl-6 pt-5">
      <div className="box-border flex flex-col pb-2.5">
        <div className="text-sm font-[600] text-[#FF55CB]">Manual Input Required</div>
        <div className="text-xs font-[400] text-[#FF97DF]">
          To ensure full compliance with legal standards, your personal attention is required for specific items in this form. The system
          will now direct you to the relevant section for your manual input and confirmation.
        </div>
        <Button
          variant="ghost"
          className="mt-4 h-[44px] w-[160px] self-end border border-dashed border-[#FF55CB] bg-[#FFFFFF]"
          onClick={handleBtnJumpClick}
        >
          <span className="text-[#FF55CB]">Proceed to Form</span>
        </Button>
      </div>
      <img
        src={imgDeclaration}
        className="!h-[107px] !w-[111px] flex-[0_0_auto] self-end justify-self-end"
        alt="Declaration"
        width={111}
        height={107}
      />
    </div>
  );
}

export const PilotStepBodyDeclaration = memo(PurePilotStepBodyDeclaration);
