import { Spin } from "antd";
import { useEffect, useState } from "react";
import { useEventManager } from "@/common/hooks/useEventManager";
import GlobalManager from "@/common/kits/GlobalManager";
import UtilsManager from "@/common/kits/UtilsManager";
import SPPageCore from "@/sidepanel/components/SPPageCore";
import "./index.less";

export default function Entry() {
  const [track, setTrack] = useState<string>("");

  useEventManager("ginkgoo-message", (message) => {
    // console.log('🚀 ~ useEventManager ~ data:', message);

    const { type: typeMsg, pilotInfo: pilotInfoMsg } = message || {};
    const { pilotCaseInfo: pilotCaseInfoMsg, pilotWorkflowInfo: pilotWorkflowInfoMsg } = pilotInfoMsg || {};
    const { id: caseIdMsg } = pilotCaseInfoMsg || {};
    const { workflow_instance_id: workflowIdMsg } = pilotWorkflowInfoMsg || {};

    switch (typeMsg) {
      case "ginkgoo-background-all-pilot-update": {
        const trackTmp = !!pilotInfoMsg
          ? UtilsManager.router2url("/case-detail", {
              caseId: caseIdMsg,
              workflowId: workflowIdMsg,
            })
          : "/case-portal";

        setTrack(trackTmp);
        break;
      }
      default: {
        break;
      }
    }
  });

  const init = async () => {
    try {
      GlobalManager.g_backgroundPort?.postMessage({
        type: "ginkgoo-sidepanel-background-pilot-query",
      });
    } catch (error) {
      console.debug("[Ginkgoo] CaseDetail init", error);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return track ? (
    <SPPageCore track={track}>
      <div className="flex h-full w-full items-center justify-center">
        <Spin size="large"></Spin>
      </div>
    </SPPageCore>
  ) : (
    <div className="flex h-screen w-screen items-center justify-center">
      <Spin size="large"></Spin>
    </div>
  );
}
