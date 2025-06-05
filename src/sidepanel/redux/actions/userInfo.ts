import { UPDATE_USER_INFO } from "@/sidepanel/redux/constants/userInfo";

const userInfoActions = (dispatch: any) => {
  const actions = {
    // 更新 User 状态
    updateUserInfo: (payload: any) => {
      dispatch({
        type: UPDATE_USER_INFO,
        payload,
      });
    },
  };
  return actions;
};

export default userInfoActions;
