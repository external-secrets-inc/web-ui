import { createContext, useContext, ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useSubscription } from "@/context/SubscriptionContext";
import useAuditSetup from "@/services/audit/hooks/useAuditSetup";
import {
  TenantListener,
  AuditListener,
} from "@/components/Audit/Audit.interfaces";

/**
 * Defines the shape of the Audit Context.
 * This context provides core audit feature status and listener information.
 */
interface AuditContextType {
  tenantListener?: TenantListener;
  auditListener?: AuditListener;
  isAuditFeatureLoading: boolean;
  hasAuditFeatureAccess?: boolean;
  auditSubscriptionError?: Error | null;
  isAuditSetupComplete: boolean;
  auditSetupError?: Error | null;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

interface AuditProviderProps {
  children?: ReactNode;
}

/**
 * Provides audit-related data and settings to its children.
 * This includes audit setup status derived from `useAuditSetup`
 * and subscription status from `useSubscription`.
 * It does NOT render UI for loading/error states; that is handled by `AuditGuard`.
 */
export function AuditProvider({ children }: AuditProviderProps) {
  const {
    hasFeature,
    isLoading: isLoadingSubscriptions,
    error: subscriptionError,
  } = useSubscription();

  const {
    isReady: isAuditSetupComplete,
    isLoading: isLoadingSetup,
    error: setupError,
    tenantListener,
    auditListener,
  } = useAuditSetup();

  const contextValue: AuditContextType = {
    tenantListener,
    auditListener,
    isAuditFeatureLoading: isLoadingSubscriptions || isLoadingSetup,
    hasAuditFeatureAccess: hasFeature("Listener Component"),
    auditSubscriptionError: subscriptionError,
    isAuditSetupComplete,
    auditSetupError: setupError,
  };

  return (
    <AuditContext.Provider value={contextValue}>
      {children || <Outlet />}
    </AuditContext.Provider>
  );
}

/**
 * Custom hook to access the general audit context.
 * Provides access to listener data, feature status, loading/error states.
 * @returns The audit context.
 * @throws Error if used outside of an AuditProvider.
 */
export const useAuditContext = () => {
  const context = useContext(AuditContext);
  if (context === undefined) {
    throw new Error("useAuditContext must be used within an AuditProvider");
  }
  return context;
};
