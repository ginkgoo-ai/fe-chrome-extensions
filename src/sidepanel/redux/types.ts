import { IAppInfoStateType } from "./reducers/appInfo";
import { IUserInfoStateType } from "./reducers/userInfo";

export interface IRootStateType {
  appInfo: IAppInfoStateType;
  userInfo: IUserInfoStateType;
}
