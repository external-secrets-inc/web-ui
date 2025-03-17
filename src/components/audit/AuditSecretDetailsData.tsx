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
  LucideDownload,
} from "lucide-react";
import { AuditSecretData } from "./Audit.interfaces";
import { formatDate } from "@/utils/dateUtils";
import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader } from "@/components/ui/Loader";
import useGetSecretPolicyLogs from "@/services/audit/queries/useGetSecretPolicyLogs";
import useGetSecretAccessorLogs from "@/services/audit/queries/useGetSecretAccessorLogs";
import { Trimmer } from "@/components/ui/Trimmer";
import useGetAuditSecretExport from "@/services/audit/queries/useGetAuditSecretExport";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { Button } from "../ui/button";
import saveAs from "file-saver";
import { AUDIT_QUERY_STALE_TIME } from "@/components/audit/Audit.constants";

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

const HistoryAccordion = <T extends object, H extends { timestamp: string }>({
  item,
  secretId,
  renderTrigger,
  renderHistoryItem,
  useHistoryQuery,
  getItemId,
}: {
  item: T;
  secretId: string;
  renderTrigger: (item: T) => React.ReactNode;
  renderHistoryItem: (historyItem: H) => React.ReactNode;
  useHistoryQuery: (
    mock: boolean,
    secretId: string,
    itemId: string,
    options?: { enabled?: boolean, staleTime?: number },
    loadingType?: 'page' | 'dialog' | 'none'
  ) => { data: H[] | undefined; isLoading: boolean };
  getItemId: (item: T) => string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const itemId = getItemId(item);

  // Only fetch data when accordion is open to prevent unnecessary requests on panel load
  const { data: historyData, isLoading: isLoadingHistory } = useHistoryQuery(
    false,
    secretId,
    itemId,
    {
      staleTime: AUDIT_QUERY_STALE_TIME,
      enabled: isOpen,
    },
    'dialog'
  );

  // Prevent default accordion behavior to handle async data loading first time
  // This prevents buggy Radix UI height calculation issues during content transitions
  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOpen) {
      setIsOpen(false);
    } else if (historyData) {
      // Open immediately if data is cached
      setIsOpen(true);
    } else {
      // Start loading but defer opening until data arrives
      setIsOpen(true);
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      // Only set accordion value when data exists to ensure correct height calculation
      value={historyData && isOpen ? itemId : undefined}
      // Manual state handling for the async control
      onValueChange={() => {}}
    >
      <AccordionItem value={itemId} className="border rounded-lg overflow-clip">
        <AccordionTrigger
          className="hover:no-underline bg-muted/40 hover:bg-muted/75 py-3 px-4 relative flex items-center justify-between w-full"
          onClick={handleTriggerClick}
        >
          <div className="flex items-center justify-between gap-2 w-full min-w-0 mr-4">
            {renderTrigger(item)}
          </div>
          {isLoadingHistory && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-muted rounded-full">
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
      </AccordionItem>
    </Accordion>
  );
};

const HistorySection = <T extends object, H extends { timestamp: string }>({
  title,
  icon,
  items,
  secretId,
  useHistoryQuery,
  renderTrigger,
  renderHistoryItem,
  emptyMessage = "No history available",
  getItemId,
}: {
  title: string;
  icon: React.ReactNode;
  items: T[];
  secretId: string;
  useHistoryQuery: (
    mock: boolean,
    secretId: string,
    itemId: string,
    options?: { enabled?: boolean }
  ) => { data: H[] | undefined; isLoading: boolean };
  renderTrigger: (item: T) => React.ReactNode;
  renderHistoryItem: (historyItem: H) => React.ReactNode;
  emptyMessage?: string;
  getItemId: (item: T) => string;
}) => {
  return (
    <section aria-label={title} className="space-y-2 p-6">
      <SectionHeader
        icon={icon}
        title={title}
        count={items.length}
      />
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map(item => (
            <HistoryAccordion
              key={getItemId(item)}
              item={item}
              secretId={secretId}
              useHistoryQuery={useHistoryQuery}
              renderTrigger={renderTrigger}
              renderHistoryItem={renderHistoryItem}
              getItemId={getItemId}
            />
          ))}
        </div>
      ) : (
        <Alert>
          <AlertDescription className="text-muted-foreground">
            {emptyMessage}
          </AlertDescription>
        </Alert>
      )}
    </section>
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
  <HistorySection
    title="Policies"
    icon={<LucideShieldCheck />}
    items={policies}
    secretId={secretId}
    useHistoryQuery={useGetSecretPolicyLogs}
    emptyMessage="No policies associated with this secret"
    renderTrigger={(policy) => (
      <>
        <div className="flex items-center gap-2 flex-1 min-w-14">
          {policy.status === "compliant" ? (
            <LucideCheck className="text-emerald-500" />
          ) : (
            <LucideAlertCircle className={cn(POLICY_STATUS_COLORS[policy.status])} />
          )}
          <Trimmer className="font-medium">{policy.name}</Trimmer>
        </div>
        {policy.status !== "compliant" && (
          <Badge variant={POLICY_STATUS_BADGE_VARIANTS[policy.status]} className="min-w-14">
            <Trimmer>{policy.status}</Trimmer>
          </Badge>
        )}
      </>
    )}
    renderHistoryItem={(log) => (
      <>
        <Badge variant={POLICY_STATUS_BADGE_VARIANTS[log.status]}>
          <Trimmer>{log.status}</Trimmer>
        </Badge>
        <Badge className="font-mono" variant="outline">
          <Trimmer>{formatDate(log.timestamp, { format: 'readableDate' })}</Trimmer>
        </Badge>
      </>
    )}
    getItemId={(policy) => policy.id}
  />
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
              <div className="flex items-center gap-2 flex-1 min-w-14">
                <LucideAlertCircle className="text-orange-500" />
                <Trimmer className="font-medium mr-auto">{duplicate.name || duplicate.id || "Unknown Duplicate"}</Trimmer>
              </div>
              <Badge variant="outline" className="min-w-14">
                <Trimmer>{duplicate.providerName || duplicate.providerID || "Unknown Provider"}</Trimmer>
              </Badge>
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
  <HistorySection
    title="Last Access Records"
    icon={<LucideUsers />}
    items={accessors}
    secretId={secretId}
    useHistoryQuery={useGetSecretAccessorLogs}
    emptyMessage="No recent access history available"
    renderTrigger={(accessor) => (
      <>
        <div className="flex items-center gap-2 flex-1 min-w-14">
          <LucideUser />
          <Trimmer>{accessor.name || accessor.id || "Unknown Accessor"}</Trimmer>
        </div>
        <Badge variant="outline" className="font-mono min-w-14">
          <Trimmer>{formatDate(accessor.accessTime, { format: 'readableDate' })}</Trimmer>
        </Badge>
      </>
    )}
    renderHistoryItem={(log) => (
      <Badge className="font-mono ml-auto" variant="outline">
        <Trimmer>{formatDate(log.timestamp, { format: 'readableDate' })}</Trimmer>
      </Badge>
    )}
    getItemId={(accessor) => accessor.name}
  />
);

const AuditSecretDetailsData = ({ className, secretData, setSecretId }: {
  className?: string;
  secretData: AuditSecretData;
  setSecretId: (id: string) => void;
}) => {
  const [shouldFetch, setShouldFetch] = useState(false);

  const {
    data: exportSecretData,
    isLoading: isLoadingExportSecretData,
    isFetching: isFetchingExportSecretData,
    error: exportSecretDataError,
  } = useGetAuditSecretExport(false, secretData.id || '', {
    staleTime: AUDIT_QUERY_STALE_TIME,
    enabled: shouldFetch,
  }, 'dialog');

  useEffect(() => {
    if (exportSecretDataError) {
      handleDefaultApiHttpError(
        exportSecretDataError,
        `Error while fetching to export secret data`
      );
    }
  }, [exportSecretDataError]);

  const createAndSaveFile = (data: [string, string, string]) => {
    const [content, fileName, fileType] = data;
    const file = new File([content], fileName, { type: fileType });
    saveAs(file);
  };

  useEffect(() => {
    if (exportSecretData && shouldFetch) {
      createAndSaveFile(exportSecretData);
      setShouldFetch(false);
    }
  }, [exportSecretData, shouldFetch]);

  const handleExportSecret = () => {
    setShouldFetch(true);
  };

  return (
    <section aria-label="Details" className={cn("min-h-0 grid grid-rows-[auto_1fr] bg-background relative flex-1", className)}>
      <div className="px-6 py-4 border-b">
        <div className="flex items-center flex-wrap gap-2 font-bold">
          <LucideSquareAsterisk className="size-6 text-primary" />
          {secretData.name || "Unnamed Secret"}
          <Badge variant="outline">{secretData.providerName}</Badge>
          <Button
            size="icon"
            variant="outline"
            className="self-center"
            aria-label="Download"
            title="Download"
            onClick={handleExportSecret}
            disabled={isLoadingExportSecretData || isFetchingExportSecretData}
          >
            {(isLoadingExportSecretData || isFetchingExportSecretData) ? <Loader /> : <LucideDownload />}
          </Button>
        </div>
      </div>

      <div className="pb-20 overflow-auto divide-y">
        <SectionSecretMetadata
          lastRotation={secretData.lastRotation}
          lastAccess={secretData.lastAccess}
        />
        <SectionSecretDuplicates
          duplicates={secretData.duplicates}
          setSecretId={setSecretId}
        />
        <SectionSecretPolicies
          policies={secretData.policies}
          secretId={secretData.id}
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
