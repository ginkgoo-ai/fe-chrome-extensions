import { StepProps } from "antd";

export enum PilotStatusEnum {
  INIT = "INIT",
  OPEN = "OPEN",
  QUERY = "QUERY",
  ANALYSIS = "ANALYSIS",
  ACTION = "ACTION",
  WAIT = "WAIT",
  HOLD = "HOLD",
}

export type ActionResultType = "success" | "notFound" | "";

export interface IActionItemType {
  selector: string;
  type: "input" | "click" | "manual";
  value?: string;
  actionresult?: ActionResultType;
  actiontimestamp?: string;
}

export interface IStepActionType {
  actioncurrent?: number;
  actionresult?: "success" | "error";
  actiontimestamp?: string;
  actionlist?: IActionItemType[];
}

export interface IStepItemType extends StepProps {
  descriptionText: string;
  actioncurrent: number;
  actionlist: IActionItemType[];
}
