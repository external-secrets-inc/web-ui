import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LucideAlertCircle,
  LucideCheck,
  LucideClock,
  LucideHistory,
  LucideRotateCcw,
  LucideShieldCheck,
  LucideSquareStack,
  LucideUser,
  LucideUsers,
  LucideSquareAsterisk,
} from "lucide-react";
import { AuditSecretData, PolicyDetails, AccessorDetails } from "./Audit.interfaces";
import { formatDate } from "@/utils/dateUtils";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader } from "@/components/ui/Loader";
import useGetSecretAccessorLogs from "@/services/audit/queries/useGetSecretAccessorLogs";
import useGetSecretPolicyLogs from "@/services/audit/queries/useGetSecretPolicyLogs";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { useEffect } from "react";

const SectionHeader = ({ icon, title, count }: { icon: React.ReactNode; title: string; count: number }) => (
  <h3 className="font-semibold mb-3 flex items-center gap-2">
    {icon}
    {title}
    <Badge variant="secondary">{count || "0"}</Badge>
  </h3>
);

const HistoryAccordion = <T, H extends { timestamp: string }>({
  items,
  historyData,
  isLoading,
  onItemClick,
  getValue,
  renderTrigger,
  renderHistoryItem
}: {
  items: T[];
  historyData?: H[];
  isLoading?: boolean;
  onItemClick: (item: T) => void;
  getValue: (item: T) => string;
  renderTrigger: (item: T) => React.ReactNode;
  renderHistoryItem: (item: H) => React.ReactNode;
}) => (
  <Accordion type="multiple" className="w-full space-y-2">
    {items.map(item => (
      <AccordionItem
        value={getValue(item)}
        key={getValue(item)}
        className="border-none"
        onClick={() => onItemClick(item)}
      >
        <Alert className="p-0 overflow-clip">
          <AccordionTrigger className="hover:no-underline bg-muted/40 hover:bg-muted/75 py-3 px-4">
            <AlertDescription className="flex items-center justify-between w-full mr-4">
              {renderTrigger(item)}
            </AlertDescription>
          </AccordionTrigger>
          <AccordionContent className="border-t p-4 ">
            {isLoading ? (
              <div className="flex justify-center items-center w-full">
                <Loader />
              </div>
            ) : historyData && historyData.length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <LucideHistory className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">History</span>
                  <Badge variant="secondary">{historyData.length || "0"}</Badge>
                </div>
                <div className="flex flex-col gap-2 pr-8">
                  {historyData.map((historyItem, index) => (
                    <div key={index} className="flex items-center justify-between">
                      {renderHistoryItem(historyItem)}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <span className="text-sm text-muted-foreground m-auto">
                No history available
              </span>
            )}
          </AccordionContent>
        </Alert>
      </AccordionItem>
    ))}
  </Accordion>
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
  policyLogsData,
  isLoadingPolicyLogs,
  setPolicyId
}: {
  policies: AuditSecretData['policies'];
  policyLogsData: PolicyDetails[] | undefined;
  isLoadingPolicyLogs: boolean;
  setPolicyId: (id: string) => void;
}) => (
  <section aria-label="Policies" className="space-y-2 p-6">
    <SectionHeader
      icon={<LucideShieldCheck />}
      title="Policies"
      count={policies.length}
    />
    {policies.length > 0 ? (
      <HistoryAccordion
        items={policies}
        historyData={policyLogsData}
        isLoading={isLoadingPolicyLogs}
        onItemClick={(policy) => setPolicyId(policy.id)}
        getValue={(policy) => policy.id}
        renderTrigger={(policy) => (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {policy.status === "compliant" ? (
                <LucideCheck className="text-green-500" />
              ) : (
                <LucideAlertCircle className="text-destructive" />
              )}
              <span className="font-medium">{policy.name}</span>
            </div>
            {policy.status !== "compliant" && (
              <Badge variant="outline" className="text-destructive border-destructive">
                {policy.status}
              </Badge>
            )}
          </div>
        )}
        renderHistoryItem={(log) => (
          <>
            <Badge
              variant="outline"
              className={cn(
                "font-medium",
                log.status === "compliant" && "text-green-500 border-green-500",
                log.status === "non_compliant" && "text-destructive border-destructive",
                log.status === "error" && "text-orange-500 border-orange-500"
              )}
            >
              {log.status}
            </Badge>
            <Badge className="font-mono" variant="outline">
              {formatDate(log.timestamp, { format: 'readableDate' })}
            </Badge>
          </>
        )}
      />
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
          <Alert variant="warning" key={duplicate.id} onClick={() => setSecretId(duplicate.id)} className="cursor-pointer">
            <AlertDescription className="flex items-center gap-2">
              <LucideAlertCircle className="text-orange-500" />
              <span className="font-medium">{duplicate.name || duplicate.id || "Unknown Duplicate"}</span>
              <Badge variant="outline" className="ml-auto">{duplicate.providerName || duplicate.providerID || "Unknown Provider"}</Badge>
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
  accessorLogsData,
  isLoadingAccessorLogs,
  setAccessorName
}: {
  accessors: AuditSecretData['accessors'];
  accessorLogsData: AccessorDetails[] | undefined;
  isLoadingAccessorLogs: boolean;
  setAccessorName: (name: string) => void;
}) => (
  <section aria-label="Last access records" className="space-y-2 p-6">
    <SectionHeader
      icon={<LucideUsers />}
      title="Last Access Records"
      count={accessors.length}
    />
    {accessors.length > 0 ? (
      <HistoryAccordion
        items={accessors}
        historyData={accessorLogsData}
        isLoading={isLoadingAccessorLogs}
        onItemClick={(access) => setAccessorName(access.name)}
        getValue={(access) => access.id}
        renderTrigger={(access) => (
          <div className="flex items-center justify-between w-full">
            <span className="font-medium">
              <LucideUser className="inline-flex mr-1" />
              {access.name || access.id || "Unknown Accessor"}
            </span>
            <Badge variant="outline" className="font-mono">
              {formatDate(access.accessTime, { format: 'readableDate' })}
            </Badge>
          </div>
        )}
        renderHistoryItem={(log) => (
          <Badge className="font-mono ml-auto" variant="outline">
            {formatDate(log.timestamp, { format: 'readableDate' })}
          </Badge>
        )}
      />
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
  const [policyId, setPolicyId] = useState<string>('');
  const [accessorName, setAccessorName] = useState<string>('');

  const {
    data: policyLogsData,
    refetch: policyLogsRefetch,
    isLoading: isLoadingPolicyLogs,
    error: policyLogsError,
  } = useGetSecretPolicyLogs(false, secretData.id || '', policyId || '', {
    enabled: !!secretData.id && !!policyId
  });

  const {
    data: accessorLogsData,
    refetch: accessorLogsRefetch,
    isLoading: isLoadingAccessorLogs,
    error: accessorLogsError,
  } = useGetSecretAccessorLogs(false, secretData.id || '', accessorName || '', {
    enabled: !!secretData.id && !!accessorName
  });

  useEffect(() => {
    if (policyLogsError) {
      handleDefaultApiHttpError(
        policyLogsError,
        `Error while fetching policy data`
      );
    }
  }, [policyLogsError]);

  useEffect(() => {
    if (accessorLogsError) {
      handleDefaultApiHttpError(
        accessorLogsError,
        `Error while fetching accessors data`
      );
    }
  }, [accessorLogsError]);

  useEffect(() => {
    if (policyId) {
      policyLogsRefetch();
    }
  }, [policyId, policyLogsRefetch]);

  useEffect(() => {
    if (accessorName) {
      accessorLogsRefetch();
    }
  }, [accessorName, accessorLogsRefetch]);

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
          policyLogsData={policyLogsData}
          isLoadingPolicyLogs={isLoadingPolicyLogs}
          setPolicyId={setPolicyId}
        />
        <SectionSecretDuplicates
          duplicates={secretData.duplicates}
          setSecretId={setSecretId}
        />
        <SectionSecretAccessors
          accessors={secretData.accessors}
          accessorLogsData={accessorLogsData}
          isLoadingAccessorLogs={isLoadingAccessorLogs}
          setAccessorName={setAccessorName}
        />
      </div>
    </section>
  );
};

export default AuditSecretDetailsData;