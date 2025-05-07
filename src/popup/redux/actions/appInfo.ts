import { SET_THEME_VALUE, SET_VERSION_INFO, UPDATE_OUTLET_POSITION } from "@/popup/redux/constants/appInfo";

const appInfoActions = (dispatch: any) => {
  const actions = {
    // 设置主题值
    setThemeValue: (payload: any) => {
      dispatch({
        type: SET_THEME_VALUE,
        payload,
      });
    },
    // 设置版本配置文件信息
    setVersionInfo: (payload: any) => {
      dispatch({
        type: SET_VERSION_INFO,
        payload,
      });
    },
    // 更新Outlet位置信息
    updateOutletPosition: (payload: any) => {
      dispatch({
        type: UPDATE_OUTLET_POSITION,
        payload,
      });
    },
  };
  return actions;
};

export default appInfoActions;
