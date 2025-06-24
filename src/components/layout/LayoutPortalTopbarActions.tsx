import React, { createContext, useContext } from "react";
import ReactDOM from "react-dom";

const LayoutTopbarActionsPortalContext = createContext<HTMLDivElement | null>(null);

export const LayoutTopbarActionsPortalProvider = LayoutTopbarActionsPortalContext.Provider;

export function useLayoutPortalTopbarActions() {
  const context = useContext(LayoutTopbarActionsPortalContext);
  return context;
}

interface LayoutPortalTopbarActionsProps {
  children: React.ReactNode;
}

export function LayoutPortalTopbarActions({ children }: LayoutPortalTopbarActionsProps): React.ReactPortal | null {
  const portalTargetElement = useLayoutPortalTopbarActions();

  if (!portalTargetElement) {
    console.warn("LayoutPortalTopbarActions: Portal target element not found. This can happen if the component is rendered before the target is mounted or if it is not within a LayoutProvider tree.");
    return null;
  }

  return ReactDOM.createPortal(children, portalTargetElement);
}