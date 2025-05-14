import { produce } from "immer";
import { UPDATE_PILOT_STATUS } from "@/sidepanel/redux/constants/pilotInfo";

export interface IPilotInfoStateType {
  x_pilotStatus: string;
}

interface Action {
  type: string;
  payload: any;
}

const INITIAL_STATE: IPilotInfoStateType = {
  x_pilotStatus: "stop",
};

const pilotInfoReducer = produce((draft: IPilotInfoStateType, action: Action) => {
  switch (action.type) {
    case UPDATE_PILOT_STATUS:
      draft.x_pilotStatus = action.payload;
      break;
    default:
      break;
  }
}, INITIAL_STATE);

export default pilotInfoReducer;
