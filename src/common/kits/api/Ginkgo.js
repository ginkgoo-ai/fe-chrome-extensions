import { v4 as uuidV4 } from "uuid";
import FetchManager from "@/common/kits/FetchManager";
import GlobalManager from "@/common/kits/GlobalManager";
import UserManager from "@/common/kits/UserManager";
import UtilsManager from "@/common/kits/UtilsManager";

export const GinkgoApi = {
  authToken: "/oauth2/token",
  assistant: "/assistant",
  userInfo: "/userinfo",
};

const genGinkgoHeaders = async (params) => {
  const { headers = {} } = params || {};

  const accessToken = await UserManager.getAccessToken();

  return {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json;charset=UTF-8",
    "request-id": uuidV4(),
    ...headers,
  };
};

const authToken = async (config = {}) => {
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
    body: new URLSearchParams(body),
    ...otherConfig,
  });
  return res;
};

const getAssistent = async (config = {}) => {
  const { headers: headersConfig = {}, query = {}, body = {}, ...otherConfig } = config || {};
  const url = `${GlobalManager.g_API_CONFIG.apiServerUrl}${GinkgoApi.assistant}`;
  const headers = {
    ...(await genGinkgoHeaders({ headersConfig })),
  };
  // const url = "https://api-ginkgoo.up.railway.app/assistant";
  // const url = "http://192.168.31.147:6011/assistant"; // Bruce
  // const url = "http://192.168.31.205:6011/assistant"; // David
  // const url = "http://localhost:6011/assistant";

  const res = await FetchManager.fetchAPI({
    // background: true,
    method: "POST",
    url,
    headers,
    body,
    ...otherConfig,
  });
  return res;
};

const queryUserInfo = async (config = {}) => {
  const { headers: headersConfig = {}, query = {}, body = {}, ...otherConfig } = config || {};
  const url = `${GlobalManager.g_API_CONFIG.authServerUrl}${GinkgoApi.userInfo}`;
  const headers = {
    ...(await genGinkgoHeaders({ headersConfig })),
  };
  // console.log("queryUserInfo", headers);

  const res = await FetchManager.fetchAPI({
    // background: true,
    method: "GET",
    url,
    headers,
    ...otherConfig,
  });
  return res;
};

export default {
  authToken,
  getAssistent,
  queryUserInfo,
};
