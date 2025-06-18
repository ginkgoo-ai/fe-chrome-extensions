export enum PilotStatusEnum {
  INIT = "INIT",
  OPEN = "OPEN",
  QUERY_WORKFLOW = "QUERY_WORKFLOW",
  QUERY = "QUERY",
  ANALYSIS = "ANALYSIS",
  ACTION = "ACTION",
  WAIT = "WAIT",
  HOLD = "HOLD",
  MANUAL = "MANUAL",
  NOT_SUPPORT = "NOT_SUPPORT",
  COMING_SOON = "COMING_SOON",
  PAUSE = "PAUSE",
  COMPLETED = "COMPLETED",
}

export enum PilotModeEnum {
  NOT_INSTALL = "NOT_INSTALL",
  PREPARING = "PREPARING",
  READY = "READY",
  RUNNING = "RUNNING",
}

export interface IPilotType {
  caseId: string;
  workflowId: string;
  fill_data: Record<string, unknown>;
  progress_file_id: string;
  dummy_data_usage: IWorkflowDummyDataType[];
  tabInfo: chrome.tabs.Tab;
  timer: NodeJS.Timeout | null;
  pilotStatus: PilotStatusEnum;
  steps: IWorkflowStepType[];
  repeatHash: string;
  repeatCurrent: number;
  pdfUrl: string;
  cookiesStr: string;
}

export interface IStepResultType {
  result: boolean;
}

export interface ISelectorResult {
  [key: string]: unknown;
}

export interface IGetWorkflowListType {
  workflowId: string;
}

export interface IGetWorkflowStepDataType {
  workflowId: string;
  stepKey: string;
}

export interface IWorkflowsProcessFormType {
  workflowId: string;
  message: string;
  fill_data: Record<string, unknown>;
}

export interface IWorkflowsUploadProgressFileType {
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
}

export interface IWorkflowStepDataType {
  actions: unknown[];
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
  status: string; // 'IN_PROGRESS';
  current_step_key: string; // 'applicant_setup';
  created_at: string | null;
  dummy_data_usage: IWorkflowDummyDataType[];
  progress_file_id: string;
  updated_at: string | null;
  completed_at: string | null;
  workflow_definition_id: string;
  steps: IWorkflowStepType[];
}
