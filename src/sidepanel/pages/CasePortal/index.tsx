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

  return (
    <SPPageCore
      renderPageHeader={() => {
        return <SPPageHeader title="Case" />;
      }}
    >
      <div className="-mt-4 box-border flex flex-col gap-3 px-4">
        {isLoadingQueryCaseList ? (
          <Spin>
            <div className="min-h-screen w-full bg-transparent"></div>
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
