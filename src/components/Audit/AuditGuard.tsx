import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LucideGem, LucideAlertCircle } from "lucide-react";
import { Loader } from "@/components/ui/Loader";
import { AuditRefreshButton } from "@/components/Audit/AuditRefreshButton";
import { useAuditContext } from "./AuditContext";

interface AuditGuardProps {
  children?: ReactNode;
}

/**
 * AuditGuard is responsible for handling the UI representation of various states
 * of the audit feature, such as loading, errors, and access restrictions.
 * It consumes `AuditContext` to get the necessary status information.
 * If all checks pass, it renders its children or an Outlet for nested routes.
 */
export function AuditGuard({ children }: AuditGuardProps) {
  const {
    isAuditFeatureLoading,
    hasAuditFeatureAccess,
    auditSubscriptionError,
    isAuditSetupComplete,
    auditSetupError,
  } = useAuditContext();

  if (isAuditFeatureLoading) {
    return (
      <div className="absolute inset-0 grid place-items-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (auditSubscriptionError) {
    return (
      <Alert
        className="flex gap-2 items-center justify-between flex-wrap m-4 w-[stretch]"
        variant="destructive"
      >
        <div>
          <AlertTitle className="flex gap-3 items-center">
            <LucideAlertCircle className="text-destructive" /> Failed to verify
            subscription status
          </AlertTitle>
          <AlertDescription>
            Unable to verify your access to this feature. Please try again or
            contact support if the issue persists.
          </AlertDescription>
        </div>
        <AuditRefreshButton queryKey={["useGetSubscriptions"]} />
      </Alert>
    );
  }

  if (!hasAuditFeatureAccess) {
    return (
      <Alert className="border-emerald-500 m-4 w-[stretch]">
        <AlertTitle className="flex items-center gap-2">
          <LucideGem className="text-amber-500" />
          Premium Feature
        </AlertTitle>
        <AlertDescription>
          <p>
            <strong>Audit</strong> is only available as a premium custom
            subscription.
          </p>
          <p>Contact support to learn more about it and get a quote!</p>
        </AlertDescription>
      </Alert>
    );
  }

  if (auditSetupError) {
    return (
      <Alert
        className="flex gap-2 items-center justify-between flex-wrap m-4 w-[stretch]"
        variant="destructive"
      >
        <div>
          <AlertTitle className="flex gap-3 items-center">
            <LucideAlertCircle className="text-destructive" /> Failed to setup
            audit listener
          </AlertTitle>
          <AlertDescription>
            Please retry or contact support if the issue persists
          </AlertDescription>
        </div>
        <AuditRefreshButton queryKey={["audit"]}>
          Retry Setup
        </AuditRefreshButton>
      </Alert>
    );
  }

  if (!isAuditSetupComplete) {
    // This state implies loading is done, no subscription error, access is granted,
    // no setup error, but the setup (e.g., listener registration) is not yet 'isReady'.
    return (
      <div className="absolute inset-0 grid place-items-center">
        <Loader size="lg" />
      </div>
    );
  }

  return <>{children || <Outlet />}</>;
}
