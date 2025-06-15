import { useEffect, useState } from "react";
import CaseManager from "@/common/kits/CaseManager";
import GlobalManager from "@/common/kits/GlobalManager";
import UtilsManager from "@/common/kits/UtilsManager";
import { ICaseItemType } from "@/common/types/case";
import SPPageCore from "@/sidepanel/components/SPPageCore";
import SPPageHeader from "@/sidepanel/components/SPPageHeader";
import { CardCase } from "@/sidepanel/components/case/CardCase";
import "./index.less";
import { mockCaseList } from "./mock";

export default function CasePortal() {
  const [caseList, setCaseList] = useState<ICaseItemType[]>([]);

  useEffect(() => {
    setCaseList(
      mockCaseList.map((item) => {
        return CaseManager.parseCaseInfo(item);
      })
    );
  }, []);

  const handleCardClick = (itemCase: ICaseItemType) => {
    try {
      GlobalManager.g_backgroundPort?.postMessage({
        type: "ginkgo-sidepanel-all-case-start",
        caseId: itemCase.id,
        workflowId: "",
        fill_data: {}, // refFillData.current,
      });
    } catch (error) {
      console.error("[Ginkgo] Sidepanel handleCardClick error", error);
    }

    setTimeout(() => {
      UtilsManager.navigateTo("/case-detail", {
        caseId: itemCase.id,
      });
    }, 500);
  };

  return (
    <SPPageCore
      renderPageHeader={() => {
        return <SPPageHeader title="CasePortal" />;
      }}
    >
      <div className="flex flex-col gap-3">
        {caseList.map((itemCase, indexCase) => (
          <CardCase
            key={`case-${indexCase}`}
            itemCase={itemCase}
            onCardClick={() => handleCardClick(itemCase)}
            // onCardEditClick={() => handleCardEditClick(itemCase)}
          />
        ))}
      </div>
    </SPPageCore>
  );
}
