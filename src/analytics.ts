/// <reference types="@types/segment-analytics" />

export const load = () => {
  window.analytics.load("EWdtj00ekTpja9IfTGKse9JNKjV6h6oB");
};

export const page = () => {
  window.analytics.page();
};

export const track = (name: string, properties: any) => {
  window.analytics.track(name, properties);
};