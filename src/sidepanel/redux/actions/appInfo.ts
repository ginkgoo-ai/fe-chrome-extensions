import { SET_THEME_VALUE, SET_VERSION_INFO, UPDATE_TAB_ACTIVATED } from "@/sidepanel/redux/constants/appInfo";

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
    // 更新当前激活的tab信息
    updateTabActivated: (payload: any) => {
      dispatch({
        type: UPDATE_TAB_ACTIVATED,
        payload,
      });
    },
  };
  return actions;
};

export default appInfoActions;
