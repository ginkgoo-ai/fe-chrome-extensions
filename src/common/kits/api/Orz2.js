import { v4 as uuidV4 } from "uuid";
import CacheManager from "@/common/kits/CacheManager";
import FetchManager from "@/common/kits/FetchManager";
import UtilsManager from "@/common/kits/UtilsManager";

const platform = "WEB";
const brand = "test";
const secretKey = "Good Luck!";

const defaultHeaders = {
  platform: platform,
  brand: brand,
  "Content-Type": "application/json;charset=UTF-8",
};

const getOrz2Headers = async (params) => {
  const { url, query: queryReq = {}, body: bodyReq = {} } = params || {};

  const queryReqReal = UtilsManager.traverseObject({
    obj: queryReq,
    modifier: (value) => {
      return String(value);
    },
  });
  const urlAndQuery = UtilsManager.router2url(url, queryReqReal);
  const { c_token: token } = (await CacheManager.getSyncStorageChrome(["c_token"])) || {};
  const requestid = uuidV4();
  const t = String(new Date().getTime());
  const k = t;

  return {
    urlAndQuery,
    token,
    t,
    k,
    requestid,
  };
};

const getActiveState = async (config = {}) => {
  const { headers = {}, query = {}, body = {}, ...otherConfig } = config || {};
  const url = "https://www.orz2.online/api/smart/v1/tool/getActiveState";
  const { urlAndQuery, token, t, k, requestid } = await getOrz2Headers({ url, query, body });

  const res = await FetchManager.fetchAPI({
    method: "GET",
    url: urlAndQuery,
    headers: {
      ...defaultHeaders,
      authorization: token ? `Bearer ${token}` : "",
      requestid,
      t,
      k,
      ...headers,
    },
    ...otherConfig,
  });
  return res;
};

const postLoginMemberInfo = async (config = {}) => {
  return {};
};

const postPorter = async (config = {}) => {
  return {};
};

const postChatMessage = async (config = {}) => {
  return {};
};

export default {
  getActiveState,
  postLoginMemberInfo,
  postPorter,
  postChatMessage,
};
