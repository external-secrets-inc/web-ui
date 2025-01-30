import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LucideClock,
  LucideRotateCcw,
  LucideShieldCheck,
  LucideSquareStack,
  LucideUsers,
  LucideSquareAsterisk,
  LucideExternalLink,
  LucideAlertCircle,
  LucideCheck,
  LucideHistory,
  LucideUser,
} from "lucide-react";
import { AuditSecretData, PolicyDetails, AccessorDetails } from "./Audit.interfaces";
import { formatDate } from "@/utils/dateUtils";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader } from "@/components/ui/Loader";
import useGetSecretPolicyLogs from "@/services/audit/queries/useGetSecretPolicyLogs";
import useGetSecretAccessorLogs from "@/services/audit/queries/useGetSecretAccessorLogs";

const POLICY_STATUS_COLORS = {
  compliant: "text-success",
  non_compliant: "text-warning",
  error: "text-destructive",
};

const POLICY_STATUS_BADGE_VARIANTS = {
  compliant: "success",
  non_compliant: "warning",
  error: "destructive",
} as const;

const SingleItemHistoryAccordion = <T extends { id: string }, H extends { timestamp: string }>({
  item,
  secretId,
  renderTrigger,
  renderHistoryItem,
  useHistoryQuery,
}: {
  item: T;
  secretId: string;
  renderTrigger: (item: T) => React.ReactNode;
  renderHistoryItem: (historyItem: H) => React.ReactNode;
  useHistoryQuery: (
    mock: boolean,
    secretId: string,
    itemId: string,
    options?: { enabled?: boolean }
  ) => { data: H[] | undefined; isLoading: boolean };
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: historyData, isLoading } = useHistoryQuery(
    false,
    secretId,
    item.id,
    { enabled: isOpen }
  );

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOpen) {
      setIsOpen(false);
    } else if (historyData) {
      setIsOpen(true);
    } else {
      // Start fetching and wait for data
      setIsOpen(true);
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={historyData && isOpen ? item.id : undefined}
      onValueChange={() => {}} // We handle state manually
    >
      <AccordionItem value={item.id} className="border-none">
        <Alert className="p-0 overflow-clip">
          <AccordionTrigger
            className="hover:no-underline bg-muted/40 hover:bg-muted/75 py-3 px-4 relative"
            onClick={handleTriggerClick}
          >
            <AlertDescription className="flex items-center justify-between w-full mr-4">
              {renderTrigger(item)}
            </AlertDescription>
            {(isLoading) && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-background">
                <Loader />
              </div>
            )}
          </AccordionTrigger>
          <AccordionContent className="border-t p-4">
            {historyData && historyData.length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <LucideHistory className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">History</span>
                  <Badge variant="secondary">{historyData.length}</Badge>
                </div>
                <div className="flex flex-col gap-2 pr-8">
                  {historyData.map((historyItem, index) => (
                    <div key={index} className="flex items-center justify-between">
                      {renderHistoryItem(historyItem)}
                    </div>
                  ))}
                </div>
              </>
            ) : historyData ? (
              <div className="text-sm text-muted-foreground text-center">
                No history available
              </div>
            ) : null}
          </AccordionContent>
        </Alert>
      </AccordionItem>
    </Accordion>
  );
};

const PolicyHistoryAccordion = ({
  policy,
  secretId
}: {
  policy: AuditSecretData['policies'][0],
  secretId: string
}) => {
  return (
    <SingleItemHistoryAccordion<typeof policy, PolicyDetails>
      item={policy}
      secretId={secretId}
      useHistoryQuery={useGetSecretPolicyLogs}
      renderTrigger={(policy) => (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {policy.status === "compliant" ? (
              <LucideCheck className="text-emerald-500" />
            ) : (
              <LucideAlertCircle className={POLICY_STATUS_COLORS[policy.status]} />
            )}
            <span className="font-medium">{policy.name}</span>
          </div>
          {policy.status !== "compliant" && (
            <Badge variant={POLICY_STATUS_BADGE_VARIANTS[policy.status]}>
              {policy.status}
            </Badge>
          )}
        </div>
      )}
      renderHistoryItem={(log) => (
        <>
          <Badge variant={POLICY_STATUS_BADGE_VARIANTS[log.status]}>
            {log.status}
          </Badge>
          <Badge className="font-mono" variant="outline">
            {formatDate(log.timestamp, { format: 'readableDate' })}
          </Badge>
        </>
      )}
    />
  );
};

const AccessorHistoryAccordion = ({
  accessor,
  secretId
}: {
  accessor: AuditSecretData['accessors'][0],
  secretId: string
}) => {
  return (
    <SingleItemHistoryAccordion<typeof accessor, AccessorDetails>
      item={accessor}
      secretId={secretId}
      useHistoryQuery={useGetSecretAccessorLogs}
      renderTrigger={(accessor) => (
        <div className="flex items-center justify-between w-full">
          <span className="font-medium">
            <LucideUser className="inline-flex mr-1" />
            {accessor.name || accessor.id || "Unknown Accessor"}
          </span>
          <Badge variant="outline" className="font-mono">
            {formatDate(accessor.accessTime, { format: 'readableDate' })}
          </Badge>
        </div>
      )}
      renderHistoryItem={(log) => (
        <Badge className="font-mono ml-auto" variant="outline">
          {formatDate(log.timestamp, { format: 'readableDate' })}
        </Badge>
      )}
    />
  );
};

const SectionHeader = ({ icon, title, count }: { icon: React.ReactNode; title: string; count: number }) => (
  <h3 className="font-semibold mb-3 flex items-center gap-2">
    {icon}
    {title}
    <Badge variant="secondary">{count || "0"}</Badge>
  </h3>
);

const SectionSecretMetadata = ({ lastRotation, lastAccess }: { lastRotation: string | null; lastAccess: string | null }) => (
  <section aria-label="Secret Metadata" className="space-y-2 p-6">
    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center gap-2">
        <LucideRotateCcw className="text-muted-foreground" />
        <div>
          <p className="text-sm text-muted-foreground">Last Rotation</p>
          <p className={cn("font-medium", !lastRotation && "text-muted-foreground italic")}>
            {lastRotation ? formatDate(lastRotation, { format: 'readableDate' }) : "Never rotated"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <LucideClock className="text-muted-foreground" />
        <div>
          <p className="text-sm text-muted-foreground">Last Access</p>
          <p className={cn("font-medium", !lastAccess && "text-muted-foreground italic")}>
            {lastAccess ? formatDate(lastAccess, { format: 'readableDate' }) : "Never accessed"}
          </p>
        </div>
      </div>
    </div>
  </section>
);

const SectionSecretPolicies = ({
  policies,
  secretId,
}: {
  policies: AuditSecretData['policies'];
  secretId: string;
}) => (
  <section aria-label="Policies" className="space-y-2 p-6">
    <SectionHeader
      icon={<LucideShieldCheck />}
      title="Policies"
      count={policies.length}
    />
    {policies.length > 0 ? (
      <div className="space-y-2">
        {policies.map(policy => (
          <PolicyHistoryAccordion
            key={policy.id}
            policy={policy}
            secretId={secretId}
          />
        ))}
      </div>
    ) : (
      <Alert>
        <AlertDescription className="text-muted-foreground">
          No policies associated with this secret
        </AlertDescription>
      </Alert>
    )}
  </section>
);

const SectionSecretDuplicates = ({ duplicates, setSecretId }: { duplicates: AuditSecretData['duplicates']; setSecretId: (id: string) => void }) => (
  <section aria-label="Duplicates" className="space-y-2 p-6">
    <SectionHeader
      icon={<LucideSquareStack />}
      title="Duplicates"
      count={duplicates.length}
    />
    {duplicates.length > 0 ? (
      <div className="space-y-2">
        {duplicates.map(duplicate => (
          <Alert key={duplicate.id} onClick={() => setSecretId(duplicate.id)} className="cursor-pointer bg-muted/40 hover:bg-muted/75">
            <AlertDescription className="flex items-center gap-2">
              <LucideAlertCircle className="text-orange-500" />
              <span className="font-medium">{duplicate.name || duplicate.id || "Unknown Duplicate"}</span>
              <Badge variant="outline" className="ml-auto">{duplicate.providerName || duplicate.providerID || "Unknown Provider"}</Badge>
              <LucideExternalLink className="ml-2 text-muted-foreground" />
            </AlertDescription>
          </Alert>
        ))}
      </div>
    ) : (
      <Alert>
        <AlertDescription className="text-muted-foreground">
          No duplicates found for this secret
        </AlertDescription>
      </Alert>
    )}
  </section>
);

const SectionSecretAccessors = ({
  accessors,
  secretId,
}: {
  accessors: AuditSecretData['accessors'];
  secretId: string;
}) => (
  <section aria-label="Last access records" className="space-y-2 p-6">
    <SectionHeader
      icon={<LucideUsers />}
      title="Last Access Records"
      count={accessors.length}
    />
    {accessors.length > 0 ? (
      <div className="space-y-2">
        {accessors.map(accessor => (
          <AccessorHistoryAccordion
            key={accessor.id}
            accessor={accessor}
            secretId={secretId}
          />
        ))}
      </div>
    ) : (
      <Alert>
        <AlertDescription className="text-muted-foreground">
          No recent access history available
        </AlertDescription>
      </Alert>
    )}
  </section>
);

const AuditSecretDetailsData = ({ className, secretData, setSecretId }: {
  className?: string;
  secretData: AuditSecretData;
  setSecretId: (id: string) => void;
}) => {
  return (
    <section aria-label="Details" className={cn("min-h-0 grid grid-rows-[auto_1fr] bg-background relative flex-1 border-l", className)}>
      <div className="px-6 py-4 border-b">
        <div className="flex items-center flex-wrap gap-2">
          <LucideSquareAsterisk className="size-6 text-primary" />
          {secretData.name || "Unnamed Secret"}
          <Badge variant="outline">{secretData.providerName}</Badge>
        </div>
      </div>

      <div className="pb-20 overflow-auto divide-y">
        <SectionSecretMetadata
          lastRotation={secretData.lastRotation}
          lastAccess={secretData.lastAccess}
        />
        <SectionSecretPolicies
          policies={secretData.policies}
          secretId={secretData.id}
        />
        <SectionSecretDuplicates
          duplicates={secretData.duplicates}
          setSecretId={setSecretId}
        />
        <SectionSecretAccessors
          accessors={secretData.accessors}
          secretId={secretData.id}
        />
      </div>
    </section>
  );
};

export default AuditSecretDetailsData;