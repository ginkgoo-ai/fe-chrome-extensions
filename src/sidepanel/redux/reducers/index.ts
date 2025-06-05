import { combineReducers } from "redux";
import appInfo from "./appInfo";
import userInfo from "./userInfo";

export default combineReducers({
  appInfo,
  userInfo,
});
