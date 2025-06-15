import dayjs from "dayjs";
import { CaseStatusEnum, ICaseItemType } from "@/common/types/case";

/**
 * @description Case管理器
 */
class CaseManager {
  static instance: CaseManager | null = null;

  CASE_STATUS_MAP = {
    [CaseStatusEnum.ANALYZING]: {
      colorBackground: "#EEE5FF",
      colorText: "#8950FC",
      text: "Analyzing",
    },
    [CaseStatusEnum.PROGRESS]: {
      colorBackground: "#F1FAFF",
      colorText: "#00A3FF",
      text: "In Progress",
    },
    [CaseStatusEnum.READY]: {
      colorBackground: "#C9F7F5",
      colorText: "#1BC5BD",
      text: "Ready to Fill",
    },
    [CaseStatusEnum.AUTO_FILLING]: {
      colorBackground: "#EEE5FF",
      colorText: "#8950FC",
      text: "Auto-Filling",
    },
    [CaseStatusEnum.HOLD]: {
      colorBackground: "#FFF4DE",
      colorText: "#FFA800",
      text: "On Hold",
    },
    [CaseStatusEnum.FINAL_REVIEW]: {
      colorBackground: "#FFF4DE",
      colorText: "#FFA800",
      text: "Final Review",
    },
    [CaseStatusEnum.DEFAULT]: {
      colorBackground: "#F5F5F5",
      colorText: "#999999",
      text: "",
    },
  };

  static getInstance(): CaseManager {
    if (!this.instance) {
      this.instance = new CaseManager();
    }
    return this.instance;
  }

  parseCaseInfo = (caseInfo: ICaseItemType): ICaseItemType => {
    return {
      ...caseInfo,
      caseStatusForFront: this.CASE_STATUS_MAP[caseInfo.status] || this.CASE_STATUS_MAP[CaseStatusEnum.DEFAULT],
      timestamp: +dayjs(),
    };
  };
}

export default CaseManager.getInstance();
