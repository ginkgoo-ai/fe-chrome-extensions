export interface IGetWorkflowListType {
  workflowId: string;
}

export interface IGetWorkflowStepDataType {
  workflowId: string;
  stepKey: string;
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
      type: string; //'radio';
    };
    data: {
      name: string;
    };
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

export interface IWorkflowType {
  workflow_instance_id: string;
  user_id: string;
  status: string; // 'IN_PROGRESS';
  current_step_key: string; // 'applicant_setup';
  created_at: string | null;
  updated_at: string | null;
  completed_at: string | null;
  workflow_definition_id: string;
  steps: IWorkflowStepType[];
}
