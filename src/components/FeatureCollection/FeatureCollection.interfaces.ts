import { SortingState } from "@tanstack/react-table"

export interface FeatureCollectionProps {
  data: FeatureData[];
  featureType: string;
  featureDescription: string;
  onDeleteFeature: (featureID: string) => void;
  setFeatureID: (value: string) => void;
  applyCommand?: string;
  manifestData?: string;
  performCreate: ({featureName} : {featureName: string}) => void;
}

export interface FeatureNewItemProps {
  featureType: string;
  performCreate: ({featureName} : {featureName: string}) => void;
  variant?: 'card' | 'row';
  colSpan?: number;
}

export interface TransformedFeatureData {
  id: string;
  name: string;
  status: string;
  index: number;
}

export interface FeatureData {
  id: string;
  name: string;
  current_status: string;
  manifest?: string;
}

export type Sorting = SortingState;
