import { produce } from "immer";
import { SET_THEME_VALUE, SET_VERSION_INFO, UPDATE_OUTLET_POSITION } from "@/popup/redux/constants/appInfo";

interface Tab {
  key: string;
  label: string;
}

interface VersionInfo {
  isDebug: boolean;
  version: string;
  tabList: Tab[];
}

interface Position {
  top: number;
  left: number;
}

interface OutletInfo {
  position: Position;
}

export interface IAppInfoStateType {
  x_themeValue: string;
  x_versionInfo: VersionInfo;
  x_outletInfo: OutletInfo;
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
  x_outletInfo: {
    position: {
      top: 0,
      left: 0,
    },
  },
};

export default function appInfoReducer(state: IAppInfoStateType = INITIAL_STATE, action: Action): IAppInfoStateType {
  const { type, payload } = action;

  return produce(state, (draft) => {
    switch (type) {
      case SET_VERSION_INFO: {
        draft.x_versionInfo = payload;
        return draft;
      }
      case SET_THEME_VALUE: {
        draft.x_themeValue = payload;
        return draft;
      }
      case UPDATE_OUTLET_POSITION: {
        draft.x_outletInfo.position = payload;
        return draft;
      }
      default: {
        return draft;
      }
    }
  });
}
