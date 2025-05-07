import { v4 as uuidV4 } from "uuid";
import FetchManager from "@/common/kits/FetchManager";
import UtilsManager from "@/common/kits/UtilsManager";

const getAssistent = async (config = {}) => {
  const { headers = {}, query = {}, body = {}, ...otherConfig } = config || {};
  const url = "http://192.168.31.205:8080/assistant";

  const res = await FetchManager.fetchAPI({
    method: "POST",
    url,
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "request-id": uuidV4(),
      ...headers,
    },
    body,
    ...otherConfig,
  });
  return res;
};

export default {
  getAssistent,
};
