import { useLocation } from "react-router-dom";
import UtilsManager from "@/common/kits/UtilsManager";

/**
 * 获取页面路由参数的 hook
 * @returns {Object} 包含 pathRouter 和 paramsRouter 的对象
 */
export const usePageParams = () => {
  const location = useLocation();
  const { path, params } = UtilsManager.router2Params(location.pathname + location.search);

  return {
    location,
    pathRouter: path,
    paramsRouter: params,
  };
};
