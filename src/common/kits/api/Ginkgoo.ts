import { v4 as uuidV4 } from "uuid";
import FetchManager from "@/common/kits/FetchManager";
import GlobalManager from "@/common/kits/GlobalManager";
import UserManager from "@/common/kits/UserManager";
import {
  mockCaseDetail,
  mockCaseList,
  mockGetWorkflowDetail,
  mockGetWorkflowList,
  mockGetWorkflowStepData,
  mockPostFilesThirdPart,
  mockPostWorkflowsProcessForm,
  mockWorkflowDefinitions,
} from "@/common/kits/mock/Ginkgoo";
import { ICaseItemType } from "@/common/types/case";
import {
  ICreateWorkflowParamsType,
  IGetWorkflowDefinitionsParamsType,
  IGetWorkflowDetailParamsType,
  IGetWorkflowListParamsType,
  IGetWorkflowStepDataParamsType,
  IWorkflowStepDataType,
  IWorkflowType,
  IWorkflowsProcessFormParamsType,
  IWorkflowsUploadProgressFileParamsType,
} from "@/common/types/casePilot";
import { IRequestConfigType } from "@/common/types/fetch";
import { ICloudFileType, IFilesPDFHighlightParamsType, IFilesThirdPartParamsType } from "@/common/types/file";

const AuthApi = {
  authToken: "/oauth2/token",
  assistant: "/assistant",
  userInfo: "/userinfo",
};

const CaseApi = {
  case: "/legalcase/cases",
  caseDetail: "/legalcase/cases/:caseId",
};

const WorkflowApi = {
  workflows: "/workflows",
  workflowsDefinitions: "/workflows/definitions",
  workflowsList: "/workflows/user/:userId/case/:caseId",
  workflowsDetail: "/workflows/:workflowId",
  workflowsStep: "/workflows/:workflowId/steps/:stepKey",
  workflowsProcessForm: "/workflows/:workflowId/process-form",
  workflowsUploadProgressFile: "/workflows/:workflowId/upload-progress-file",
};

const StorageApi = {
  filesThirdPart: "/storage/v1/files/third-part",
  filesPDFHighlight: "/storage/v1/files/pdf-highlight",
};

const IS_MOCK_LIST: string[] = [
  // "queryCaseList",
  // "queryCaseDetail",
  // "getWorkflowDefinitions",
  // "getWorkflowList",
  // "getWorkflowDetail",
  // "getWorkflowStepData",
  // "createWorkflow",
  // "postWorkflowsProcessForm",
  // "postWorkflowsUploadProgressFile",
  // "postFilesThirdPart",
  // "postFilesPDFHighlight",
];
// const LOCAL_BASE_URL = "http://192.168.31.205:6011"; // David
// const LOCAL_BASE_URL_FILE = "http://192.168.31.205:8080/api"; // David

const genGinkgooHeaders = async (params?: { headers?: Record<string, string> }) => {
  const { headers = {} } = params || {};

  const accessToken = await UserManager.getAccessToken();

  return {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json;charset=UTF-8",
    "request-id": uuidV4(),
    ...headers,
  };
};

const authToken = async (config: IRequestConfigType = {}) => {
  const { headers = {}, body = {}, ...otherConfig } = config || {};
  const url = `${GlobalManager.g_API_CONFIG.authServerUrl}${AuthApi.authToken}`;

  const res = await FetchManager.fetchAPI({
    // background: true,
    method: "POST",
    url,
    headers: {
      "request-id": uuidV4(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body as Record<string, string>),
    ...otherConfig,
  });
  return res;
};

const queryUserInfo = async () => {
  const url = `${GlobalManager.g_API_CONFIG.authServerUrl}${AuthApi.userInfo}`;
  const headers = {
    ...(await genGinkgooHeaders()),
  };
  // console.log("queryUserInfo", headers);

  const res = await FetchManager.fetchAPI({
    // background: true,
    method: "GET",
    url,
    headers,
  });
  return res;
};

const queryCaseList = async (): Promise<{ content: ICaseItemType[] }> => {
  const url = `${GlobalManager.g_API_CONFIG.apiServerUrl}${CaseApi.case}`;
  const headers = {
    ...(await genGinkgooHeaders()),
  };
  if (IS_MOCK_LIST.includes("queryCaseList")) {
    return new Promise((resolve) => {
      resolve({ content: mockCaseList });
    });
  }

  const res = await FetchManager.fetchAPI({
    method: "GET",
    url,
    headers,
  });

  return res;
};

const queryCaseDetail = async (params: { caseId: string }) => {
  const { caseId } = params || {};
  const url = `${GlobalManager.g_API_CONFIG.apiServerUrl}${CaseApi.caseDetail}`.replace(":caseId", caseId);
  const headers = {
    ...(await genGinkgooHeaders()),
  };

  if (IS_MOCK_LIST.includes("queryCaseDetail")) {
    return new Promise((resolve) => {
      resolve(mockCaseDetail);
    });
  }

  const res = await FetchManager.fetchAPI({
    method: "GET",
    url,
    headers,
  });

  return res;
};

const getWorkflowDefinitions = async (params: IGetWorkflowDefinitionsParamsType) => {
  // const { page, page_size, workflow_type } = params || {};
  const url = `${GlobalManager.g_API_CONFIG.apiAiServerUrl}${WorkflowApi.workflowsDefinitions}`;
  const headers = {
    ...(await genGinkgooHeaders()),
  };

  if (IS_MOCK_LIST.includes("getWorkflowDefinitions")) {
    return new Promise((resolve) => {
      resolve(mockWorkflowDefinitions);
    });
  }

  const res = await FetchManager.fetchAPI({
    method: "GET",
    url,
    headers,
    params,
  });

  return res;
};

const getWorkflowList = async (params: IGetWorkflowListParamsType) => {
  const { userId = "", caseId = "" } = params;
  const url = `${GlobalManager.g_API_CONFIG.apiAiServerUrl}${WorkflowApi.workflowsList}`
    .replace(":userId", userId)
    .replace(":caseId", caseId);
  const headers = {
    ...(await genGinkgooHeaders()),
  };

  if (IS_MOCK_LIST.includes("getWorkflowList")) {
    return new Promise((resolve) => {
      resolve(mockGetWorkflowList);
    });
  }

  const res = await FetchManager.fetchAPI({
    method: "GET",
    url,
    headers,
  });

  return res;
};

const getWorkflowDetail = async (params: IGetWorkflowDetailParamsType): Promise<IWorkflowType> => {
  const { workflowId = "" } = params;
  const url = `${GlobalManager.g_API_CONFIG.apiAiServerUrl}${WorkflowApi.workflowsDetail}`.replace(":workflowId", workflowId);
  const headers = {
    ...(await genGinkgooHeaders()),
  };

  if (IS_MOCK_LIST.includes("getWorkflowDetail")) {
    return new Promise((resolve) => {
      resolve(mockGetWorkflowDetail);
    });
  }

  const res = await FetchManager.fetchAPI({
    method: "GET",
    url,
    headers,
  });

  return res;
};

const getWorkflowStepData = async (params: IGetWorkflowStepDataParamsType): Promise<{ step_key: string; data: IWorkflowStepDataType }> => {
  const { workflowId = "", stepKey = "" } = params;
  const url = `${GlobalManager.g_API_CONFIG.apiAiServerUrl}${WorkflowApi.workflowsStep}`
    .replace(":workflowId", workflowId)
    .replace(":stepKey", stepKey);
  const headers = {
    ...(await genGinkgooHeaders()),
  };

  if (IS_MOCK_LIST.includes("getWorkflowStepData")) {
    return new Promise((resolve) => {
      resolve(mockGetWorkflowStepData);
    });
  }

  const res = await FetchManager.fetchAPI({
    method: "GET",
    url,
    headers,
  });

  return res;
};

const createWorkflow = async (params: ICreateWorkflowParamsType) => {
  // const { user_id, case_id, workflow_definition_id } = params;
  const url = `${GlobalManager.g_API_CONFIG.apiAiServerUrl}${WorkflowApi.workflows}`;
  const headers = {
    ...(await genGinkgooHeaders()),
  };

  // if (IS_MOCK) {
  //   return new Promise((resolve) => {
  //     resolve(mockPostWorkflowsProcessForm);
  //   });
  // }

  const res = await FetchManager.fetchAPI({
    method: "POST",
    url,
    headers,
    body: params,
  });

  return res;
};

const postWorkflowsProcessForm = async (params: IWorkflowsProcessFormParamsType) => {
  const { workflowId = "", ...body } = params;
  const url = `${GlobalManager.g_API_CONFIG.apiAiServerUrl}${WorkflowApi.workflowsProcessForm}`.replace(":workflowId", workflowId);
  const headers = {
    ...(await genGinkgooHeaders()),
  };

  if (IS_MOCK_LIST.includes("postWorkflowsProcessForm")) {
    return new Promise((resolve) => {
      resolve(mockPostWorkflowsProcessForm);
    });
  }

  const res = await FetchManager.fetchAPI({
    method: "POST",
    url,
    headers,
    body: {
      ...body,
      trace_id: workflowId,
    },
  });

  return res;
};

const postWorkflowsUploadProgressFile = async (params: IWorkflowsUploadProgressFileParamsType) => {
  const { workflowId = "", fileId = "" } = params;
  const url = `${GlobalManager.g_API_CONFIG.apiAiServerUrl}${WorkflowApi.workflowsUploadProgressFile}`.replace(":workflowId", workflowId);
  const headers = {
    ...(await genGinkgooHeaders()),
  };

  // if (IS_MOCK) {
  //   return new Promise((resolve) => {
  //     resolve(mockPostWorkflowsProcessForm);
  //   });
  // }

  const res = await FetchManager.fetchAPI({
    method: "POST",
    url,
    headers,
    body: {
      file_id: fileId,
    },
  });

  return res;
};

const postFilesThirdPart = async (params: IFilesThirdPartParamsType): Promise<ICloudFileType> => {
  // const { thirdPartUrl, cookie } = params;
  const url = `${GlobalManager.g_API_CONFIG.apiServerUrl}${StorageApi.filesThirdPart}`;
  const headers = {
    ...(await genGinkgooHeaders()),
  };

  if (IS_MOCK_LIST.includes("postFilesThirdPart")) {
    return new Promise((resolve) => {
      resolve(mockPostFilesThirdPart);
    });
  }

  const res = await FetchManager.fetchAPI({
    method: "POST",
    url,
    headers,
    body: params,
    // credentials: "include",
  });

  return res;
};

const postFilesPDFHighlight = async (params: IFilesPDFHighlightParamsType): Promise<BlobPart> => {
  // const { fileId, highlightData } = params;
  const url = `${GlobalManager.g_API_CONFIG.apiServerUrl}${StorageApi.filesPDFHighlight}`;
  const headers = {
    ...(await genGinkgooHeaders({
      headers: {
        Accept: "application/octet-stream",
      },
    })),
  };

  const res = await FetchManager.fetchAPI({
    method: "POST",
    url,
    headers,
    body: params,
    responseType: "blob",
    // credentials: "include",
  });

  return res;
};

export default {
  authToken,
  queryUserInfo,
  queryCaseList,
  queryCaseDetail,
  getWorkflowDefinitions,
  getWorkflowList,
  getWorkflowDetail,
  getWorkflowStepData,
  createWorkflow,
  postWorkflowsProcessForm,
  postWorkflowsUploadProgressFile,
  postFilesThirdPart,
  postFilesPDFHighlight,
};
