import { v4 as uuidV4 } from "uuid";
import FetchManager from "@/common/kits/FetchManager";
import GlobalManager from "@/common/kits/GlobalManager";
import UserManager from "@/common/kits/UserManager";
import { mockGetWorkflowList, mockGetWorkflowStepData, mockPostWorkflowsProcessForm } from "@/common/kits/mock/Ginkgo";
import {
  IGetWorkflowListType,
  IGetWorkflowStepDataType,
  IWorkflowStepDataType,
  IWorkflowType,
  IWorkflowsProcessFormType,
} from "@/common/types/casePilot";
import { IRequestConfigType } from "@/common/types/fetch";

export const GinkgoApi = {
  authToken: "/oauth2/token",
  assistant: "/assistant",
  userInfo: "/userinfo",
  workflows: "/workflows/:workflowId",
  workflowsStep: "/workflows/:workflowId/steps/:stepKey",
  workflowsProcessForm: "/workflows/:workflowId/process-form",
};

const IS_MOCK = true;
const LOCAL_BASE_URL = "http://192.168.31.205:6011/"; // David
const baseUrl = LOCAL_BASE_URL || GlobalManager.g_API_CONFIG.apiServerUrl;

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
  const url = `${GlobalManager.g_API_CONFIG.authServerUrl}${GinkgoApi.authToken}`;

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
  const url = `${GlobalManager.g_API_CONFIG.authServerUrl}${GinkgoApi.userInfo}`;
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
  const url = `${baseUrl}${GinkgoApi.workflowsProcessForm}`.replace(":workflowId", workflowId);
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

const getWorkflowStepData = async (params: IGetWorkflowStepDataType): Promise<IWorkflowStepDataType> => {
  const { workflowId = "", stepKey = "" } = params;
  const url = `${baseUrl}${GinkgoApi.workflowsStep}`.replace(":workflowId", workflowId).replace(":stepKey", stepKey);
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
  const url = `${baseUrl}${GinkgoApi.workflowsProcessForm}`.replace(":workflowId", workflowId);
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

export default {
  authToken,
  queryUserInfo,
  getWorkflowList,
  getWorkflowStepData,
  postWorkflowsProcessForm,
};
