import { Status } from "../Common.interfaces";
import { FindingLocation } from "../Findings";

export interface TargetReference {
  name: string;
  namespace: string;
}

export interface Consumer {
  id: string;
  name: string;
  namespace: string;
  displayName: string;
  targetRef: TargetReference;
	type: string;
  locations: FindingLocation[];
  status: Status;
}

export type ConsumersTableData = Consumer;

export const targetColumnName = "targetRef"
