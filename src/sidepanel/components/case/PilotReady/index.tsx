"use client";

import { memo } from "react";

function PurePilotReady() {
  return (
    <div className="flex flex-col">
      <div className="mb-4 mt-[2.75rem] flex w-full items-center justify-center font-bold">You're all set! 🎉️</div>
      <div className="box-border flex w-full flex-col rounded-lg p-2.5">
        <div className="mb-3.5 mt-2.5 flex flex-row">
          {/* <div className="flex-[0_0_2.25rem] flex flex-row justify-center">
            <IconInfo size={18} />
          </div> */}
          <div className="flex-1 text-center text-[#757072]">CLICK THE BUTTON BELOW TO START THE AUTOMATIC FORM FILLING.</div>
        </div>
        {/* <Button
          // className="border border-[#D8DFF5] border-dashed h-11 bg-white"
          onClick={onBtnStartClick}
        >
          <IconMagic size={24} />
          <span className="text-[var(--color-primary)] font-semibold">
            Start auto-Fill
          </span>
        </Button> */}
      </div>
    </div>
  );
}

export const PilotReady = memo(PurePilotReady);
