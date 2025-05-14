import { combineReducers } from "redux";
import appInfo from "./appInfo";
import pilotInfo from "./pilotInfo";

export default combineReducers({
  appInfo,
  pilotInfo,
});
