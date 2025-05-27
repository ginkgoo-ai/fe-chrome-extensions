import { produce } from "immer";
import { SET_THEME_VALUE, SET_VERSION_INFO, UPDATE_TAB_ACTIVATED } from "@/sidepanel/redux/constants/appInfo";

interface VersionInfo {
  isDebug: boolean;
  version: string;
}

export interface IAppInfoStateType {
  x_themeValue: string;
  x_versionInfo: VersionInfo;
  x_tabActivated: chrome.tabs.Tab | null;
}

interface Action {
  type: string;
  payload: any;
}

const INITIAL_STATE: IAppInfoStateType = {
  x_themeValue: "DEFAULT",
  x_versionInfo: {
    isDebug: false,
    version: "",
  },
  x_tabActivated: null,
};

const appInfoReducer = produce((draft: IAppInfoStateType, action: Action) => {
  switch (action.type) {
    case SET_THEME_VALUE:
      draft.x_themeValue = action.payload;
      break;
    case SET_VERSION_INFO:
      draft.x_versionInfo = action.payload;
      break;
    case UPDATE_TAB_ACTIVATED:
      draft.x_tabActivated = action.payload;
      break;
    default:
      break;
  }
}, INITIAL_STATE);

export default appInfoReducer;
