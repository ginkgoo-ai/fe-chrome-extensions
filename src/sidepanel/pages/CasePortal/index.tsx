import { useEffect, useState } from "react";
import CaseManager from "@/common/kits/CaseManager";
import GlobalManager from "@/common/kits/GlobalManager";
import UtilsManager from "@/common/kits/UtilsManager";
import Api from "@/common/kits/api";
import { ICaseItemType } from "@/common/types/case";
import { WorkflowTypeEnum } from "@/common/types/casePilot";
import SPPageCore from "@/sidepanel/components/SPPageCore";
import SPPageHeader from "@/sidepanel/components/SPPageHeader";
import { CardCase } from "@/sidepanel/components/case/CardCase";
import "./index.less";
import { mockCaseList } from "./mock";

export default function CasePortal() {
  const [caseList, setCaseList] = useState<ICaseItemType[]>([]);
  const [workflowDefinitionId, setWorkflowDefinitionId] = useState<string>("");

  const init = async () => {
    const caseListTmp = mockCaseList.map((item) => {
      return CaseManager.parseCaseInfo(item);
    });

    setCaseList(caseListTmp);

    const resWorkflowDefinitions = await Api.Ginkgo.getWorkflowDefinitions({
      page: 1,
      page_size: 1,
      workflow_type: WorkflowTypeEnum.VISA,
    });

    if (resWorkflowDefinitions?.items?.length > 0) {
      const item = resWorkflowDefinitions?.items[0];
      setWorkflowDefinitionId(item.workflow_definition_id);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const handleCardClick = (itemCase: ICaseItemType) => {
    const workflowId = "1221f2f4-5311-4e15-b7dd-aecd4f8d9401";
    const url = "https://visas-immigration.service.gov.uk/next"; // test
    // const url = "https://www.gov.uk/skilled-worker-visa/apply-from-outside-the-uk"; // start
    // const url = "https://visas-immigration.service.gov.uk/resume/3a0bec84-a910-4f74-b4de-763b458e770e"; // return
    // const url = "https://apply-to-visit-or-stay-in-the-uk.homeoffice.gov.uk/SKILLED_WORK/3434-4632-5724-0670/"; // uk

    try {
      GlobalManager.g_backgroundPort?.postMessage({
        type: "ginkgo-sidepanel-all-case-start",
        url,
        caseId: itemCase.id,
        workflowId,
        fill_data: {}, // refFillData.current,
      });
    } catch (error) {
      console.error("[Ginkgo] Sidepanel handleCardClick error", error);
    }

    setTimeout(() => {
      UtilsManager.navigateTo("/case-detail", {
        caseId: itemCase.id,
        workflowId,
      });
    }, 500);
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
            workflowDefinitionId={workflowDefinitionId}
            onCardClick={() => handleCardClick(itemCase)}
            // onCardEditClick={() => handleCardEditClick(itemCase)}
          />
        ))}
      </div>
    </SPPageCore>
  );
}
