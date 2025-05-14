import { UPDATE_PILOT_STATUS } from "@/sidepanel/redux/constants/pilotInfo";

const pilotInfoActions = (dispatch: any) => {
  const actions = {
    // 更新 Pilot 状态
    updatePilotStatus: (payload: any) => {
      dispatch({
        type: UPDATE_PILOT_STATUS,
        payload,
      });
    },
  };
  return actions;
};

export default pilotInfoActions;
