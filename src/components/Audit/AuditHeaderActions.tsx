import { AuditRefreshButton } from "./AuditRefreshButton";
import AuditMockToggle from "./AuditMockToggle";
import { useFeatureFlag } from "@/context/FeatureFlagContext";

interface AuditHeaderActionsProps {
  includeMockToggle?: boolean;
}

export function AuditHeaderActions({
  includeMockToggle = true,
}: AuditHeaderActionsProps) {
  const showMockToggle = useFeatureFlag("auditMockToggle") && includeMockToggle;

  return (
    <div className="flex items-center gap-4">
      {showMockToggle && <AuditMockToggle />}
      <AuditRefreshButton queryKey={["audit"]} />
    </div>
  );
}
