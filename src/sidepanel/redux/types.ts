import { IAppInfoStateType } from "./reducers/appInfo";
import { IPilotInfoStateType } from "./reducers/pilotInfo";

export interface IRootStateType {
  appInfo: IAppInfoStateType;
  pilotInfo: IPilotInfoStateType;
}
