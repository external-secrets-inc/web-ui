import { SortingState } from "@tanstack/react-table"

export interface NewFeatureFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  performCreate: ({featureName} : {featureName: string}) => void;
}

export interface FeatureNewItemProps<T extends NewFeatureFormProps> {
  featureType: string;
  performCreate: ({featureName} : {featureName: string}) => void;
  Form: React.ComponentType<T>;
  formProps?: Partial<T>;
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
