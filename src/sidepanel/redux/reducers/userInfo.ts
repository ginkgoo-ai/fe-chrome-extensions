import { produce } from "immer";
import { UPDATE_USER_INFO } from "@/sidepanel/redux/constants/userInfo";

export interface IUserInfoStateType {
  x_userInfo: Record<string, unknown> | null;
}

interface Action {
  type: string;
  payload: any;
}

const INITIAL_STATE: IUserInfoStateType = {
  x_userInfo: null,
};

const pilotInfoReducer = produce((draft: IUserInfoStateType, action: Action) => {
  switch (action.type) {
    case UPDATE_USER_INFO:
      draft.x_userInfo = action.payload;
      break;
    default:
      break;
  }
}, INITIAL_STATE);

export default pilotInfoReducer;
