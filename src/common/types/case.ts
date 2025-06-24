import { StepProps } from "antd";
import { IOcrFileType } from "@/common/types/file";

export enum CaseStreamStatusEnum {
  INIT = "INIT",
  STREAMING = "STREAMING",
  ERROR = "ERROR",
  DONE = "DONE",
}

export enum CaseStatusEnum {
  ANALYZING = "ANALYZING",
  PROGRESS = "PROGRESS",
  READY = "READY",
  AUTO_FILLING = "AUTO_FILLING",
  HOLD = "HOLD",
  FINAL_REVIEW = "FINAL_REVIEW",
  DEFAULT = "DEFAULT",
}

export type ActionResultType = "success" | "notFound" | "manual";

export interface IProfileVaultDocumentType extends IOcrFileType {
  metadataForFrontList: Record<string, string>[];
}

export interface ICaseItemType {
  additionalData: null;
  clientId: string | null;
  clientName: string | null;
  createdAt: string;
  description: string | null;
  documentChecklist: any; // ICaseDocumentChecklistType
  documents?: IOcrFileType[];
  documentsCount: number;
  endDate: null;
  eventsCount: number;
  id: string;
  profileChecklist: any; // ICaseProfileChecklistType
  profileId: string;
  profileName: string | null;
  startDate: string | null;
  status: string;
  title: string;
  travelDate: string | null;
  updatedAt: string;
  visaType: string | null;
  caseStatusForFront?: {
    colorBackground: string;
    colorText: string;
    text: string;
  };
  timestamp?: number;
  profileData?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface IAddressItemType {
  hidden?: boolean;
  type: string;
  label: string;
  value: string;
}

export interface IProfileItemType {
  label: string;
  value: string | IAddressItemType[];
}

export interface IProfileType {
  [key: string]: IProfileItemType;
}

export interface IActionItemType {
  selector: string;
  type: "input" | "click" | "manual";
  value?: string;
  actionresult?: ActionResultType;
  actiontimestamp?: string;
}

export interface IFormItemType {
  name: string;
  label: string;
  value: string;
  type: "input" | "radio" | "checkbox";
  options?: {
    label: string;
    value: string;
  };
}

export interface IStepActionType {
  actioncurrent?: number;
  actionresult?: "success" | "error";
  actiontimestamp?: string;
  actionlist?: IActionItemType[];
}

export interface IStepItemType extends StepProps {
  descriptionText: string;
  actioncurrent?: number;
  actionlist?: IActionItemType[];
  formList?: IFormItemType[];
}
