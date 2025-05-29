import { AuditRefreshButton } from "./AuditRefreshButton";
import AuditMockToggle from "./AuditMockToggle";
import { useFeatureFlag } from "@/context/FeatureFlagContext";
import { cn } from "@/lib/utils";

interface AuditHeaderActionsProps {
  includeMockToggle?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function AuditHeaderActions({
  includeMockToggle = true,
  children,
  className,
}: AuditHeaderActionsProps) {
  const showMockToggle = useFeatureFlag("auditMockToggle") && includeMockToggle;

  if (children) {
    return (
      <div className={cn("flex items-center gap-4 h-0", className)}>
        {showMockToggle && <AuditMockToggle />}
        {children}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-4 h-0", className)}>
      {showMockToggle && <AuditMockToggle />}
      <AuditRefreshButton queryKey={["audit"]} />
    </div>
  );
}
