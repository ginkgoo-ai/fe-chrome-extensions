import { message as messageAntd } from "antd";
import { useEffect, useRef, useState } from "react";
import { MESSAGE } from "@/common/config/message";
import CaseManager from "@/common/kits/CaseManager";
import GlobalManager from "@/common/kits/GlobalManager";
import Api from "@/common/kits/api";
import { ICaseItemType } from "@/common/types/case";
import { WorkflowTypeEnum } from "@/common/types/casePilot";
import SPPageCore from "@/sidepanel/components/SPPageCore";
import SPPageHeader from "@/sidepanel/components/SPPageHeader";
import { CardCase } from "@/sidepanel/components/case/CardCase";
import { ModalNewWorkflow } from "@/sidepanel/components/case/ModalNewWorkflow";
import "./index.less";

export default function CasePortal() {
  const refCaseInfoSelect = useRef<ICaseItemType | null>(null);
  const refWorkflowDefinitionId = useRef<string>("");

  const [caseList, setCaseList] = useState<ICaseItemType[]>([]);
  const [isModalNewWorkflowOpen, setModalNewWorkflowOpen] = useState<boolean>(false);

  const refreshCaseList = async () => {
    const resCaseList = await Api.Ginkgoo.queryCaseList();

    if (resCaseList?.content) {
      const caseListTmp = resCaseList?.content?.map((item) => {
        return CaseManager.parseCaseInfo(item);
      });

      setCaseList(caseListTmp);
      return;
    }

    messageAntd.open({
      type: "error",
      content: MESSAGE.TOAST_REFRESH_CASE_LIST_FAILED,
    });
  };

  const refreshWorkflowDefinitions = async () => {
    const resWorkflowDefinitions = await Api.Ginkgoo.getWorkflowDefinitions({
      page: 1,
      page_size: 1,
      workflow_type: WorkflowTypeEnum.VISA,
    });

    if (resWorkflowDefinitions?.items?.length > 0) {
      const item = resWorkflowDefinitions?.items[0];
      refWorkflowDefinitionId.current = item.workflow_definition_id;
      return;
    }

    messageAntd.open({
      type: "error",
      content: MESSAGE.TOAST_WORKFLOW_DEFINITIONS_MISSING,
    });
  };

  const init = async () => {
    refreshCaseList();
    refreshWorkflowDefinitions();
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
    if (!refWorkflowDefinitionId.current) {
      messageAntd.open({
        type: "error",
        content: MESSAGE.TOAST_REFRESH_WORKFLOW_DEFINITIONS_FAILED,
      });
    }

    try {
      GlobalManager.g_backgroundPort?.postMessage({
        type: "ginkgoo-sidepanel-all-case-start",
        url,
        caseInfo: refCaseInfoSelect.current,
        workflowDefinitionId: refWorkflowDefinitionId.current,
      });
    } catch (error) {
      console.log("[Ginkgoo] Sidepanel handleCardClick error", error);
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
