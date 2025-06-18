import { v4 as uuidV4 } from "uuid";
import FetchManager from "@/common/kits/FetchManager";
import GlobalManager from "@/common/kits/GlobalManager";
import UserManager from "@/common/kits/UserManager";
import {
  mockGetWorkflowList,
  mockGetWorkflowStepData,
  mockPostFilesThirdPart,
  mockPostWorkflowsProcessForm,
} from "@/common/kits/mock/Ginkgo";
import {
  IGetWorkflowListType,
  IGetWorkflowStepDataType,
  IWorkflowStepDataType,
  IWorkflowType,
  IWorkflowsProcessFormType,
  IWorkflowsUploadProgressFileType,
} from "@/common/types/casePilot";
import { IRequestConfigType } from "@/common/types/fetch";
import { ICloudFileType, IFilesPDFHighlightType, IFilesThirdPartType } from "@/common/types/file";

const AuthApi = {
  authToken: "/oauth2/token",
  assistant: "/assistant",
  userInfo: "/userinfo",
};

const WorkflowApi = {
  workflows: "/workflows/:workflowId",
  workflowsStep: "/workflows/:workflowId/steps/:stepKey",
  workflowsProcessForm: "/workflows/:workflowId/process-form",
  workflowsUploadProgressFile: "/workflows/:workflowId/upload-progress-file",
};

const StorageApi = {
  filesThirdPart: "/storage/v1/files/third-part",
  filesPDFHighlight: "/storage/v1/files/pdf-highlight",
};

const IS_MOCK = false;
const LOCAL_BASE_URL = "http://192.168.31.205:6011"; // David
// const LOCAL_BASE_URL_FILE = "http://192.168.31.205:8080/api"; // David
const baseUrl = LOCAL_BASE_URL || GlobalManager.g_API_CONFIG.apiServerUrl;
const baseUrlFile = GlobalManager.g_API_CONFIG.apiServerUrl;

const genGinkgoHeaders = async (params?: { headers?: Record<string, string> }) => {
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
  const { headers = {}, query = {}, body = {}, ...otherConfig } = config || {};
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
    ...(await genGinkgoHeaders()),
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

const getWorkflowList = async (params: IGetWorkflowListType): Promise<IWorkflowType> => {
  const { workflowId = "" } = params;
  const url = `${baseUrl}${WorkflowApi.workflows}`.replace(":workflowId", workflowId);
  const headers = {
    ...(await genGinkgoHeaders()),
  };

  if (IS_MOCK) {
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

const getWorkflowStepData = async (params: IGetWorkflowStepDataType): Promise<{ step_key: string; data: IWorkflowStepDataType }> => {
  const { workflowId = "", stepKey = "" } = params;
  const url = `${baseUrl}${WorkflowApi.workflowsStep}`.replace(":workflowId", workflowId).replace(":stepKey", stepKey);
  const headers = {
    ...(await genGinkgoHeaders()),
  };

  if (IS_MOCK) {
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

const postWorkflowsProcessForm = async (params: IWorkflowsProcessFormType) => {
  const { workflowId = "", ...body } = params;
  const url = `${baseUrl}${WorkflowApi.workflowsProcessForm}`.replace(":workflowId", workflowId);
  const headers = {
    ...(await genGinkgoHeaders()),
  };

  if (IS_MOCK) {
    return new Promise((resolve) => {
      resolve(mockPostWorkflowsProcessForm);
    });
  }

  const res = await FetchManager.fetchAPI({
    method: "POST",
    url,
    headers,
    body,
  });

  return res;
};

const postWorkflowsUploadProgressFile = async (params: IWorkflowsUploadProgressFileType) => {
  const { workflowId = "", ...body } = params;
  const url = `${baseUrl}${WorkflowApi.workflowsUploadProgressFile}`.replace(":workflowId", workflowId);
  const headers = {
    ...(await genGinkgoHeaders()),
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
    body,
  });

  return res;
};

const postFilesThirdPart = async (params: IFilesThirdPartType): Promise<ICloudFileType> => {
  // const { thirdPartUrl, cookie } = params;
  const url = `${baseUrlFile}${StorageApi.filesThirdPart}`;
  const headers = {
    ...(await genGinkgoHeaders()),
  };

  if (IS_MOCK) {
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

const postFilesPDFHighlight = async (params: IFilesPDFHighlightType): Promise<BlobPart> => {
  // const { fileId, highlightData } = params;
  const url = `${baseUrlFile}${StorageApi.filesPDFHighlight}`;
  const headers = {
    ...(await genGinkgoHeaders({
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
  getWorkflowList,
  getWorkflowStepData,
  postWorkflowsProcessForm,
  postWorkflowsUploadProgressFile,
  postFilesThirdPart,
  postFilesPDFHighlight,
};
