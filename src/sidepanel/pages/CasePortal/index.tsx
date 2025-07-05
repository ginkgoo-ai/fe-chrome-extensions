import { Spin, message as messageAntd } from "antd";
import { useEffect, useState } from "react";
import { MESSAGE } from "@/common/config/message";
import CaseManager from "@/common/kits/CaseManager";
import UtilsManager from "@/common/kits/UtilsManager";
import Api from "@/common/kits/api";
import { ICaseItemType } from "@/common/types/case";
import SPPageCore from "@/sidepanel/components/SPPageCore";
import SPPageHeader from "@/sidepanel/components/SPPageHeader";
import { CardCase } from "@/sidepanel/components/case/CardCase";
import "./index.less";

export default function CasePortal() {
  const [caseList, setCaseList] = useState<ICaseItemType[]>([]);
  const [isLoadingQueryCaseList, setLoadingQueryCaseList] = useState<boolean>(true);

  const refreshCaseList = async () => {
    const resCaseList = await Api.Ginkgoo.queryCaseList();

    setLoadingQueryCaseList(false);
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

  const init = async () => {
    refreshCaseList();
    // refreshWorkflowDefinitions();
  };

  useEffect(() => {
    init();
  }, []);

  const handleCardClick = (itemCase: ICaseItemType) => {
    UtilsManager.redirectTo("/case-detail", {
      caseId: itemCase.id,
    });
  };

  // const handleNewWorkflowFinish = async (values: Record<string, string>) => {
  //   const { url } = values;

  //   // const url = "https://visas-immigration.service.gov.uk/next"; // test
  //   // const url = "https://www.gov.uk/skilled-worker-visa/apply-from-outside-the-uk"; // start
  //   // const url = "https://visas-immigration.service.gov.uk/resume/3a0bec84-a910-4f74-b4de-763b458e770e"; // return
  //   // const url = "https://apply-to-visit-or-stay-in-the-uk.homeoffice.gov.uk/SKILLED_WORK/3434-4632-5724-0670/"; // uk
  //   if (!refWorkflowDefinitionId.current) {
  //     messageAntd.open({
  //       type: "error",
  //       content: MESSAGE.TOAST_REFRESH_WORKFLOW_DEFINITIONS_FAILED,
  //     });
  //   }

  //   try {
  //     GlobalManager.g_backgroundPort?.postMessage({
  //       type: "ginkgoo-sidepanel-all-pilot-start",
  //       url,
  //       caseInfo: refCaseInfoSelect.current,
  //       workflowDefinitionId: refWorkflowDefinitionId.current,
  //     });
  //   } catch (error) {
  //     console.log("[Ginkgoo] Sidepanel handleCardClick error", error);
  //   }
  // };

  return (
    <SPPageCore
      renderPageHeader={() => {
        return <SPPageHeader title="Case" />;
      }}
    >
      <div className="-mt-4 box-border flex flex-col gap-3 px-4">
        {isLoadingQueryCaseList ? (
          <Spin>
            <div className="h-40 w-full"></div>
          </Spin>
        ) : (
          <>
            {caseList.map((itemCase, indexCase) => (
              <CardCase
                key={`case-${indexCase}`}
                itemCase={itemCase}
                onCardClick={() => handleCardClick(itemCase)}
                // onCardEditClick={() => handleCardEditClick(itemCase)}
              />
            ))}
          </>
        )}
      </div>
    </SPPageCore>
  );
}
