import { IAppInfoStateType } from "@/sidepanel/redux/reducers/appInfo";
import { IUserInfoStateType } from "@/sidepanel/redux/reducers/userInfo";

export interface IRootStateType {
  appInfo: IAppInfoStateType;
  userInfo: IUserInfoStateType;
}
