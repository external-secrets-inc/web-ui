import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  LucideAlertCircle,
  LucideCheck,
  LucideClock,
  LucideNetwork,
  LucideRotateCcw,
  LucideShieldCheck,
  LucideSquareAsterisk,
  LucideSquareStack,
  LucideUsers,
} from "lucide-react";
import { AuditSecretData } from "./Audit.interfaces";
import { formatDate } from "@/utils/dateUtils";
import useGetAuditSecretData from "@/services/audit/queries/useGetAuditSecretData";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { useEffect, useMemo } from "react";
import { Loader } from "@/components/ui/Loader"
import { ONE_SECOND_IN_MILLISECONDS } from "@/constants";
import useGetLineagePath from "@/services/lineage/queries/useGetLineagePath";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import AuditSecretLineage from "@/components/audit/AuditSecretLineage";

import '@xyflow/react/dist/style.css';

interface AuditSecretDetailsDialogProps {
  secretId: string | null;
  setSecretId: (secret: string) => void;
  onOpenChange: (open: boolean) => void;
}

export default function AuditSecretDetailsDialog({ secretId, setSecretId, onOpenChange }: AuditSecretDetailsDialogProps) {
  const {
    data: secretData,
    refetch: secretRefetch,
    isLoading: isLoadingSecretData,
    isFetching: isFetchingSecretData,
    isError: isErrorSecretData,
    error: secretDataError,
  } = useGetAuditSecretData(false, secretId || '', {
    refetchInterval: 20 * ONE_SECOND_IN_MILLISECONDS,
    refetchIntervalInBackground: true,
    enabled: !!secretId
  });
  const { data: lineageData } = useGetLineagePath(false, secretId ? secretId : '', {
    enabled: !!secretId
  });

  useEffect(() => {
    if (!(secretDataError)) return;

    handleDefaultApiHttpError(
      secretDataError,
      `Error while fetching secret data`
    );
    onOpenChange(false);
  }, [secretDataError, isErrorSecretData, onOpenChange]);

  const listenerSecretData = useMemo(() => {
    if (!secretData)
      return {
        id: "secret-id",
        name: "Unknown Secret",
        providerID: "provider-id",
        providerName: "Unknown Provider",
        duplicates: [],
        accessors: [],
        policies: [],
        lastAccess: null,
        lastRotation: null,
      } as AuditSecretData

    return secretData;
  }, [secretData]);

  useEffect(() => {
    if (secretId) {
      secretRefetch();
    }
  }, [secretId, secretRefetch]);

  if (!secretId) return null;

  return (
    <Sheet open={!!secretId} onOpenChange={onOpenChange}>
      <SheetContent className="min-w-[90vw] flex flex-col h-full p-6 gap-4">
        <SheetHeader>
          <SheetTitle className="flex items-center flex-wrap gap-2">
            <LucideSquareAsterisk className="size-6" />
            {listenerSecretData.name || "Unnamed Secret"}
            <Badge variant="outline">{listenerSecretData.providerName}</Badge>
          </SheetTitle>
          <SheetDescription />
        </SheetHeader>
        {
          isLoadingSecretData || isFetchingSecretData ?
            <div className="flex justify-center items-center flex-1">
              <Loader />
            </div> :
            <ScrollArea className="flex-1">
              <div className="space-y-6">
                <section aria-label="Secret Metadata" className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <LucideRotateCcw className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Rotation</p>
                      <p className={cn("font-medium", !listenerSecretData.lastRotation && "text-muted-foreground italic")}>
                        {listenerSecretData.lastRotation ? formatDate(listenerSecretData.lastRotation, { format: 'readableDate' }) : "Never rotated"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <LucideClock className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Access</p>
                      <p className={cn("font-medium", !listenerSecretData.lastAccess && "text-muted-foreground italic")}>
                        {listenerSecretData.lastAccess ? formatDate(listenerSecretData.lastAccess, { format: 'readableDate' }) : "Never accessed"}
                      </p>
                    </div>
                  </div>
                </section>

                <Separator />

                <section aria-label="Policies" className="space-y-2">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <LucideShieldCheck />
                    Policies
                    <Badge variant="secondary">{listenerSecretData.policies.length || "0"}</Badge>
                  </h3>
                  {listenerSecretData.policies.length > 0 ? (
                    <div className="space-y-2">
                      {listenerSecretData.policies.map(policy => (
                        <Alert
                          key={policy.id}
                          variant={policy.status === "compliant" ? "default" : "destructive"}
                        >
                          <AlertDescription className="flex items-center gap-2">
                            {policy.status === "compliant" ? (
                              <LucideCheck className="text-green-500" />
                            ) : (
                              <LucideAlertCircle className="text-destructive" />
                            )}
                            <span className="font-medium">{policy.name}</span>
                            {policy.status !== "compliant" && (
                              <Badge variant="outline" className="text-destructive border-destructive ml-auto">
                                {policy.status}
                              </Badge>
                            )}
                          </AlertDescription>
                        </Alert>
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

                <Separator />

                <section aria-label="Duplicates" className="space-y-2">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <LucideSquareStack />
                    Duplicates
                    <Badge variant="secondary">{listenerSecretData.duplicates.length || "0"}</Badge>
                  </h3>
                  {listenerSecretData.duplicates.length > 0 ? (
                    <div className="space-y-2">
                      {listenerSecretData.duplicates.map(duplicate => (
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

                <Separator />

                <section aria-label="Lineage" className="space-y-2">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <LucideNetwork />
                    Lineage
                  </h3>
                  <div style={{ width: '100%', height: '50vh' }}>
                    <AuditSecretLineage lineageData={lineageData} currentSecretId={secretId} />
                  </div>
                </section>

                <Separator />

                <section aria-label="Last access records" className="space-y-2">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <LucideUsers />
                    Last Access Records
                    <Badge variant="secondary">{listenerSecretData.accessors.length || "0"}</Badge>
                  </h3>
                  {listenerSecretData.accessors.length > 0 ? (
                    <div className="space-y-2">
                      {listenerSecretData.accessors.map(access => (
                        <Alert key={access.id}>
                          <AlertDescription className="flex items-center gap-2">
                            <Badge variant="secondary">{access.name || access.id || "Unknown Accessor"}</Badge>
                            <Badge variant="outline" className="ml-auto">
                              {formatDate(access.accessTime, { format: 'readableDate' })}
                            </Badge>
                          </AlertDescription>
                        </Alert>
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
              </div>
            </ScrollArea>
        }
      </SheetContent>
    </Sheet>
  );
}