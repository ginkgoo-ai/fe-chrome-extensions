import { produce } from "immer";
import { SET_THEME_VALUE, SET_VERSION_INFO, UPDATE_TAB_ACTIVATED } from "@/sidepanel/redux/constants/appInfo";

interface VersionInfo {
  isDebug: boolean;
  version: string;
}

interface ITabInfoType {
  active: boolean;
  audible: boolean;
  autoDiscardable: boolean;
  discarded: boolean;
  favIconUrl: string;
  frozen: boolean;
  groupId: number;
  height: number;
  highlighted: boolean;
  id: number;
  incognito: boolean;
  index: number;
  lastAccessed: number;
  mutedInfo: {
    muted: boolean;
  };
  pinned: boolean;
  selected: boolean;
  status: string;
  title: string;
  url: string;
  width: number;
  windowId: number;
}

export interface IAppInfoStateType {
  x_themeValue: string;
  x_versionInfo: VersionInfo;
  x_tabActivated: chrome.tabs.Tab;
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
    tabList: [
      {
        key: "/home",
        label: "home",
      },
    ],
  },
  x_tabActivated: {},
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
