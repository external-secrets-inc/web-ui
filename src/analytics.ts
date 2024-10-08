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
export const trackCopyRawYAML = (agentId: string) => {
  track("Copy Agent Raw YAML", { agentId });
};

export const trackCopyYAMLWithApplyCommand = (agentId: string) => {
  track("Copy Agent YAML with Apply Command", { agentId });
};

export const trackDownloadYAML = (agentId: string) => {
  track("Download Agent YAML", { agentId });
};

export const trackDeleteDialogOpened = (agentId: string) => {
  track("Agent Delete Dialog Opened", { agentId });
};

export const trackYamlDialogOpened = (agentId: string, agentName: string) => {
  track("Agent YAML Dialog Opened", { agentId, agentName });
};

export const trackAgentDeleteDialogOpened = (agentId: string, agentName: string) => {
  track("Agent Delete Dialog Opened", { agentId, agentName });
};

export const trackAgentDeleted = (agentId: string) => {
  track("Agent Deleted", { agentId });
};

export const trackAddNewAgentClicked = () => {
  track("Add New Agent Clicked", {});
};

export const trackAgentCreated = (name: string) => {
  track("Agent Created", { name });
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