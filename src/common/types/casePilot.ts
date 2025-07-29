import { ICaseItemType } from "./case";

export enum PilotStatusEnum {
  INIT = "INIT",
  OPEN_NEW = "OPEN_NEW",
  OPEN_OLD = "OPEN_OLD",
  START = "START",
  QUERY_TAB = "QUERY_TAB",
  QUERY_WORKFLOW = "QUERY_WORKFLOW",
  QUERY_HTML = "QUERY_HTML",
  QUERY_COOKIES = "QUERY_COOKIES",
  QUERY_PDF = "QUERY_PDF",
  ANALYSIS = "ANALYSIS",
  ACTION = "ACTION",
  WAIT = "WAIT",
  HOLD = "HOLD",
  MANUAL = "MANUAL",
  COMING_SOON = "COMING_SOON",
  PAUSE = "PAUSE",
  COMPLETED = "COMPLETED",
}

export enum PilotThirdPartTypeEnum {
  NONE = "NONE",
  EU = "EU",
  NotEU = "NotEU",
}

export enum PilotModeEnum {
  NOT_INSTALL = "NOT_INSTALL",
  PREPARING = "PREPARING",
  READY = "READY",
  RUNNING = "RUNNING",
}

export enum WorkflowTypeEnum {
  VISA = "visa",
  PASSPORT = "passport",
  IMMIGRATION = "immigration",
  STUDENT_VISA = "student_visa",
  WORK_PERMIT = "work_permit",
  FAMILY_VISA = "family_visa",
}

export interface IPilotType {
  pilotId: string;
  pilotTimer: NodeJS.Timeout | null;
  pilotTabInfo: chrome.tabs.Tab | null;
  pilotStatus: PilotStatusEnum;
  pilotLastMessage: string;
  pilotRepeatHash: string;
  pilotRepeatCurrent: number;
  pilotThirdPartType: PilotThirdPartTypeEnum;
  pilotThirdPartMethod: string;
  pilotThirdPartUrl: string;
  pilotCookie: string;
  pilotCsrfToken: string;
  pilotUniqueApplicationNumber: string;
  pilotCaseInfo: ICaseItemType | null;
  pilotWorkflowInfo: IWorkflowType | null;
  pilotRefreshTS?: number;
}

export interface IStepResultType {
  result: boolean;
}

export interface ISelectorResult {
  [key: string]: unknown;
}

export interface IGetWorkflowDefinitionsParamsType {
  page: number;
  page_size: number;
  workflow_type: WorkflowTypeEnum;
}

export interface IGetWorkflowListParamsType {
  userId: string;
  caseId: string;
}

export interface IGetWorkflowDetailParamsType {
  workflowId: string;
}

export interface IGetWorkflowStepDataParamsType {
  workflowId: string;
  stepKey: string;
}

export interface ICreateWorkflowParamsType {
  user_id: string;
  case_id: string;
  workflow_definition_id: string;
}

export interface IWorkflowsProcessFormParamsType {
  workflowId: string;
  form_html: string;
  fill_data: Record<string, unknown>;
  profile_dummy_data: Record<string, unknown>;
}

export interface IWorkflowsUpdateDetailParamsType {
  workflowId: string;
  unique_application_number: string;
}

export interface IWorkflowsUploadProgressFileParamsType {
  workflowId: string;
  fileId: string;
}

export interface IWorkflowStepDataFormDataType {
  question: {
    answer: {
      data: {
        name: string;
        value: string;
        check: number;
        selector: string;
      }[];
      selector: string;
      type?: string; //'radio';
    };
    data: {
      name: string;
    };
    type?: string; // "interrupt";
  };
  _metadata?: {
    id: string;
    field_selector: string;
    field_name: string;
    field_type: string;
    field_label: string;
    required: boolean;
    options: unknown[];
    confidence: number;
    reasoning: string;
    needs_intervention: boolean;
    has_valid_answer: boolean;
    grouped_fields: unknown;
  };
}

export interface IWorkflowStepDataCurrentInterruptQuestionsType {
  question_id: string;
  question_text: string;
  field_name: string;
  field_type: string;
  field_selector: string;
  required: boolean;
  confidence: number;
  reasoning: string;
  needs_intervention: boolean;
  options: any[];
  grouped_fields: any[];
  extracted_at: string;
  answer_options: any[];
}

export interface IWorkflowStepDataType {
  actions: unknown[];
  current_interrupt_questions: IWorkflowStepDataCurrentInterruptQuestionsType[];
  form_data: IWorkflowStepDataFormDataType[];
  metadata: unknown;
  questions: unknown[];
  history?: unknown[];
}

export interface IWorkflowStepType {
  step_instance_id: string;
  workflow_instance_id: string;
  step_key: string; // 'applicant_setup';
  name: string;
  order: number;
  status: string; // 'ACTIVE' | 'PENDING';
  data: IWorkflowStepDataType | null;
  next_step_url: string | null;
  started_at: string | null;
  completed_at: string | null;
  error_details: null;
}

export interface IWorkflowDummyDataType {
  answer: string;
  processed_at: string;
  question: string;
  step_key: string;
}

export interface IWorkflowType {
  workflow_instance_id: string;
  user_id: string;
  case_id?: string;
  status: string; // 'IN_PROGRESS' | "PENDING";
  current_step_key: string; // 'applicant_setup';
  created_at: string | null;
  updated_at: string | null;
  completed_at: string | null;
  dummy_data_usage?: IWorkflowDummyDataType[];
  progress_file_id?: string;
  progress_percentage?: number;
  workflow_definition_id?: string;
  unique_application_number?: string | null;
  steps?: IWorkflowStepType[];
}
