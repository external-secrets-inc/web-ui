/// <reference types="@types/segment-analytics" />

// Base Segment functions
export const load = () => {
  window.analytics.load("EWdtj00ekTpja9IfTGKse9JNKjV6h6oB");
};

export const page = () => {
  window.analytics.page();
};

export const track = (name: string, properties: any) => {
  window.analytics.track(name, properties);
};

// Track events
export const trackFeatureCopyRawYAML = (featureType: string, featureID: string) => {
  track("Copy Feature Raw YAML", { featureType, featureID });
};

export const trackFeatureCopyYAMLWithApplyCommand = (featureType: string, featureID: string) => {
  track("Copy Feature YAML with Apply Command", { featureType, featureID });
};

export const trackFeatureDownloadYAML = (featureType: string, featureID: string) => {
  track("Download Feature YAML", { featureType, featureID });
};

export const trackFeatureDeleteDialogOpened = (featureType: string, featureID: string, triggeredFrom: "details-dialog" | "dropdown") => {
  track("Feature Delete Dialog Opened", { featureType, featureID, triggeredFrom });
};

export const trackFeatureItemDialogOpened = (featureType: string, featureID: string, featureName: string) => {
  track("Feature Item Dialog Opened", { featureType, featureID, featureName });
};

export const trackFeatureDeleted = (featureType: string, featureID: string) => {
  track("Feature Deleted", { featureType, featureID });
};

export const trackAddNewFeatureClicked = (featureType: string) => {
  track("Add New Feature Clicked", { featureType });
};

export const trackFeatureCreated = (featureType: string) => {
  track("Feature Created", { featureType });
};
export const trackLoginStepCompleted = (step: number) => {
  track("Login Step Completed", { step });
};

export const trackLoginStepMovedBack = () => {
  track("Login Step Moved Back", {});
};

export const trackSignupStepCompleted = (step: number, data: any) => {
  track("Signup Step Completed", { step, data });
};

export const trackSignupStepMovedBack = () => {
  track("Signup Step Moved Back", {});
};

export const trackSignedIn = (tenant: string) => {
  track("Signed In", { tenant });
};

export const trackSignedOut = (manually: boolean) => {
  track("Signed Out", { manually });
};

export const trackSettingsTabChanged = (tab: string) => {
  track("Settings Tab Changed", { tab });
};

export const trackSettingsSectionModified = (section: string, values?: any) => {
  track("Settings Section Modified", { section, ...values });
};

export const trackListenerInstallDialogOpened = (id: string) => {
  track("Listener Install Dialog Opened", { id });
}

export const trackListenerInstallCopyProcess = (id: string) => {
  track("Copy Listener Install Process", { id });
};

export const trackListenerInstallCopyKubernetes = (id: string) => {
  track("Copy Listener Install Kubernetes", { id });
};
