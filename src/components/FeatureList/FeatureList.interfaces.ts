import React from "react";

export interface NewFeatureFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  performCreate: ({featureName} : {featureName: string}) => void;
}

export interface NewFeatureCardProps<T extends NewFeatureFormProps> {
  featureName: string;
  performCreate: ({featureName} : {featureName: string}) => void;
  Form: React.ComponentType<T>;
  formProps?: Partial<T>;
}
