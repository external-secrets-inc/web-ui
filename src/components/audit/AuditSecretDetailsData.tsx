import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { AuditSecretData } from "./Audit.interfaces";
import { formatDate } from "@/utils/dateUtils";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader } from "@/components/ui/Loader";
import useGetSecretAccessorLogs from "@/services/audit/queries/useGetSecretAccessorLogs";
import useGetSecretPolicyLogs from "@/services/audit/queries/useGetSecretPolicyLogs";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { useEffect } from "react";

interface AuditSecretDetailsDataProps {
  className?: string;
  secretData: AuditSecretData;
  setSecretId: (id: string) => void;
}

export default function AuditSecretDetailsData({ className, secretData, setSecretId }: AuditSecretDetailsDataProps) {
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
      <div className="p-6 border-b">
        <div className="flex items-center flex-wrap gap-2">
          <LucideSquareAsterisk className="size-6 text-primary" />
          {secretData.name || "Unnamed Secret"}
          <Badge variant="outline">{secretData.providerName}</Badge>
        </div>
      </div>
      <div className="space-y-6 p-6 pb-20 overflow-auto">
        <section aria-label="Secret Metadata" className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <LucideRotateCcw className="text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Last Rotation</p>
                <p className={cn("font-medium", !secretData.lastRotation && "text-muted-foreground italic")}>
                  {secretData.lastRotation ? formatDate(secretData.lastRotation, { format: 'readableDate' }) : "Never rotated"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LucideClock className="text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Last Access</p>
                <p className={cn("font-medium", !secretData.lastAccess && "text-muted-foreground italic")}>
                  {secretData.lastAccess ? formatDate(secretData.lastAccess, { format: 'readableDate' }) : "Never accessed"}
                </p>
              </div>
            </div>
          </div>
        </section>
        <Separator className="-mx-6 w-[stretch]" />
        <section aria-label="Policies" className="space-y-2">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <LucideShieldCheck />
            Policies
            <Badge variant="secondary">{secretData.policies.length || "0"}</Badge>
          </h3>
          {secretData.policies.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {secretData.policies.map(policy => (
                <AccordionItem value={policy.id} key={policy.id} className="border-none" onClick={() => setPolicyId(policy.id)}>
                  <Alert className="p-0 overflow-clip" variant={policy.status === "compliant" ? "success" : "destructive"}>
                    <AccordionTrigger className="hover:no-underline hover:bg-muted/20 py-3 px-4">
                      <AlertDescription className="flex items-center justify-between w-full mr-4">
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
                      </AlertDescription>
                    </AccordionTrigger>
                    <AccordionContent className="border-t mx-4 py-4">
                      {isLoadingPolicyLogs ? (
                        <div className="flex justify-center items-center w-full">
                          <Loader />
                        </div>
                      ) : policyLogsData && policyLogsData.length > 0 ? (
                        <div className="space-y-3 relative before:absolute before:left-[17px] before:top-[26px] before:bottom-[6px] before:w-[2px] before:bg-muted">
                          <div className="flex items-center gap-2">
                            <LucideHistory className="text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">History</span>
                            <Badge variant="secondary">{policyLogsData.length || "0"}</Badge>
                          </div>
                          <div className="flex flex-col gap-3 pl-2">
                            {policyLogsData.map(log => (
                              <Alert
                                key={`${log.policyID}-${log.timestamp}`}
                                variant={log.status === "compliant" ? "success" : "destructive"}
                                className="relative"
                              >
                                <div className="absolute -left-[22px] top-1/2 -translate-y-1/2 size-3 rounded-full bg-background border-2 border-primary" />
                                <AlertDescription className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {log.status === "compliant" ? (
                                      <LucideCheck className="text-green-500" />
                                    ) : (
                                      <LucideAlertCircle className="text-destructive" />
                                    )}
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        log.status !== "compliant" && "text-destructive border-destructive"
                                      )}
                                    >
                                      {log.status}
                                    </Badge>
                                  </div>
                                  <span className="text-sm text-muted-foreground font-mono">
                                    {formatDate(log.timestamp, { format: 'readableDate' })}
                                  </span>
                                </AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No history available
                        </span>
                      )}
                    </AccordionContent>
                  </Alert>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <Alert>
              <AlertDescription className="text-muted-foreground">
                No policies associated with this secret
              </AlertDescription>
            </Alert>
          )}
        </section>
        <Separator className="-mx-6 w-[stretch]" />
        <section aria-label="Duplicates" className="space-y-2">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <LucideSquareStack />
            Duplicates
            <Badge variant="secondary">{secretData.duplicates.length || "0"}</Badge>
          </h3>
          {secretData.duplicates.length > 0 ? (
            <div className="space-y-2">
              {secretData.duplicates.map(duplicate => (
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
        <Separator className="-mx-6 w-[stretch]" />
        <section aria-label="Last access records" className="space-y-2">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <LucideUsers />
            Last Access Records
            <Badge variant="secondary">{secretData.accessors.length || "0"}</Badge>
          </h3>
          {secretData.accessors.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {secretData.accessors.map(access => (
                <AccordionItem value={access.id} key={access.id} className="border-none" onClick={() => setAccessorName(access.name)}>
                  <Alert className="p-0 overflow-clip">
                    <AccordionTrigger className="hover:no-underline hover:bg-muted/20 py-3 px-4">
                      <AlertDescription className="flex items-center justify-between w-full mr-4">
                        <span className="font-medium">
                          <LucideUser className="inline-flex mr-1" />
                          {access.name || access.id || "Unknown Accessor"}
                        </span>
                        <Badge variant="outline" className="font-mono">
                          {formatDate(access.accessTime, { format: 'readableDate' })}
                        </Badge>
                      </AlertDescription>
                    </AccordionTrigger>
                    <AccordionContent className="grid grid-cols-[auto_1fr] justify-items-end items-start border-t mx-4 py-4">
                      {isLoadingAccessorLogs ? (
                        <div className="col-span-2 flex justify-center items-center w-full">
                          <Loader />
                        </div>
                      ) : accessorLogsData && accessorLogsData.length > 0 ? (
                        <>
                          <div className="flex items-center gap-2">
                            <LucideHistory className="text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">History</span>
                            <Badge variant="secondary">{accessorLogsData.length || "0"}</Badge>
                          </div>
                          <div className="flex flex-col gap-2">
                            {accessorLogsData.map(log => (
                              <Badge
                                key={`${log.accessorID}-${log.timestamp}`}
                                className="mr-8 font-mono"
                                variant="outline"
                              >
                                {formatDate(log.timestamp, { format: 'readableDate' })}
                              </Badge>
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
          ) : (
            <Alert>
              <AlertDescription className="text-muted-foreground">
                No recent access history available
              </AlertDescription>
            </Alert>
          )}
        </section>
      </div>
    </section>
  );
}