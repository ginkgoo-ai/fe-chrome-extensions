import { useEffect, useRef, useState } from "react";
import { useEventManager } from "@/common/hooks/useEventManager";
import CaseManager from "@/common/kits/CaseManager";
import GlobalManager from "@/common/kits/GlobalManager";
import UserManager from "@/common/kits/UserManager";
import UtilsManager from "@/common/kits/UtilsManager";
import Api from "@/common/kits/api";
import { ICaseItemType } from "@/common/types/case";
import { PilotStatusEnum, WorkflowTypeEnum } from "@/common/types/casePilot";
import SPPageCore from "@/sidepanel/components/SPPageCore";
import SPPageHeader from "@/sidepanel/components/SPPageHeader";
import { CardCase } from "@/sidepanel/components/case/CardCase";
import { ModalNewWorkflow } from "@/sidepanel/components/case/ModalNewWorkflow";
import "./index.less";
import { mockCaseList } from "./mock";

export default function CasePortal() {
  const refCaseInfoSelect = useRef<ICaseItemType | null>(null);
  const refWorkflowDefinitionId = useRef<string>("");

  const [caseList, setCaseList] = useState<ICaseItemType[]>([]);
  const [isModalNewWorkflowOpen, setModalNewWorkflowOpen] = useState<boolean>(false);

  useEventManager("ginkgoo-message", (message) => {
    // console.log('🚀 ~ useEventManager ~ data:', message);

    const { type: typeMsg, pilotInfo: pilotInfoMsg } = message || {};

    switch (typeMsg) {
      case "ginkgoo-background-all-case-update": {
        const { caseId: caseIdMsg, workflowId: workflowIdMsg, pilotStatus: pilotStatusMsg } = pilotInfoMsg || {};
        if (pilotStatusMsg === PilotStatusEnum.START) {
          setModalNewWorkflowOpen(false);
          setTimeout(() => {
            UtilsManager.navigateTo("/case-detail", {
              caseId: caseIdMsg,
              workflowId: workflowIdMsg,
            });
          }, 500);
        }

        break;
      }
      default: {
        break;
      }
    }
  });

  const init = async () => {
    const caseListTmp = mockCaseList.map((item) => {
      return CaseManager.parseCaseInfo(item);
    });

    setCaseList(caseListTmp);

    const resWorkflowDefinitions = await Api.Ginkgoo.getWorkflowDefinitions({
      page: 1,
      page_size: 1,
      workflow_type: WorkflowTypeEnum.VISA,
    });

    if (resWorkflowDefinitions?.items?.length > 0) {
      const item = resWorkflowDefinitions?.items[0];
      refWorkflowDefinitionId.current = item.workflow_definition_id;
    }
  };

  useEffect(() => {
    init();
  }, []);

  const handleCardStartClick = (itemCase: ICaseItemType) => {
    refCaseInfoSelect.current = itemCase;
    setModalNewWorkflowOpen(true);
  };

  const handleNewWorkflowFinish = async (values: Record<string, string>) => {
    const { url } = values;

    // const url = "https://visas-immigration.service.gov.uk/next"; // test
    // const url = "https://www.gov.uk/skilled-worker-visa/apply-from-outside-the-uk"; // start
    // const url = "https://visas-immigration.service.gov.uk/resume/3a0bec84-a910-4f74-b4de-763b458e770e"; // return
    // const url = "https://apply-to-visit-or-stay-in-the-uk.homeoffice.gov.uk/SKILLED_WORK/3434-4632-5724-0670/"; // uk

    try {
      GlobalManager.g_backgroundPort?.postMessage({
        type: "ginkgoo-sidepanel-all-case-start",
        url,
        userId: UserManager.userInfo?.id || "",
        caseId: refCaseInfoSelect.current?.id || "",
        workflowDefinitionId: refWorkflowDefinitionId.current,
      });
    } catch (error) {
      console.error("[Ginkgoo] Sidepanel handleCardClick error", error);
    }
  };

  return (
    <SPPageCore
      renderPageHeader={() => {
        return <SPPageHeader title="Case" />;
      }}
    >
      <div className="-mt-4 flex flex-col gap-3">
        {caseList.map((itemCase, indexCase) => (
          <CardCase
            key={`case-${indexCase}`}
            itemCase={itemCase}
            onCardStartClick={() => handleCardStartClick(itemCase)}
            // onCardEditClick={() => handleCardEditClick(itemCase)}
          />
        ))}
      </div>

      {/* Modal Create */}
      <ModalNewWorkflow isOpen={isModalNewWorkflowOpen} onOpenUpdate={setModalNewWorkflowOpen} onFinish={handleNewWorkflowFinish} />
    </SPPageCore>
  );
}
