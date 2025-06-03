import { useLayoutPageHeaderPortalTarget } from "@/components/layout";
import ReactDOM from "react-dom";

interface LayoutPortalHeaderActionsProps {
  children: React.ReactNode;
}

/**
 * LayoutPortalHeaderActions renders its children into the designated header actions
 * area within the LayoutPage component, using a React Portal.
 *
 * It should be used as a descendant of a LayoutPage component.
 * If the portal target is not available (e.g., not within LayoutPage),
 * it renders nothing.
 */
export function LayoutPortalHeaderActions({
  children,
}: LayoutPortalHeaderActionsProps): React.ReactPortal | null {
  const portalTargetElement = useLayoutPageHeaderPortalTarget();

  if (!portalTargetElement) {
    console.warn(
      "PageHeaderActionsPortal: Portal target element not found. Ensure this component is used within a PageLayout."
    );
    return null; // Or render children directly if preferred as a fallback, though typically not for portals
  }

  return ReactDOM.createPortal(children, portalTargetElement);
}
