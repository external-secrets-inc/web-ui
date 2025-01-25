import { Loader } from "@/components/ui/Loader";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ONE_SECOND_IN_MILLISECONDS } from "@/constants";
import useGetAuditSecretData from "@/services/audit/queries/useGetAuditSecretData";
import useGetLineagePath from "@/services/lineage/queries/useGetLineagePath";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { useEffect, useMemo } from "react";
import { AuditSecretData } from "./Audit.interfaces";
import AuditSecretDetailsData from "./AuditSecretDetailsData";
import AuditSecretDetailsLineage from "./AuditSecretDetailsLineage";
import { LucideNetwork, LucideSquareAsterisk } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AuditSecretDetailsProps {
  secretId: string | null;
  setSecretId: (secret: string) => void;
  onOpenChange: (open: boolean) => void;
}

export default function AuditSecretDetails({ secretId, setSecretId, onOpenChange }: AuditSecretDetailsProps) {
  const {
    data: secretData,
    refetch: secretRefetch,
    isLoading: isLoadingSecretData,
    isError: isErrorSecretData,
    error: secretDataError,
  } = useGetAuditSecretData(false, secretId || '', {
    refetchInterval: 2 * ONE_SECOND_IN_MILLISECONDS,
    refetchIntervalInBackground: true,
    enabled: !!secretId
  });
  const { data: lineageData } = useGetLineagePath(false, secretId || '', {
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
      <SheetContent className="min-w-[100vw] xl:min-w-[90vw] flex flex-col h-full p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>
            {listenerSecretData.name || "Unnamed Secret"}
          </SheetTitle>
          <SheetDescription>
            View and manage secret details
          </SheetDescription>
        </SheetHeader>

        {isLoadingSecretData ? (
          <div className="flex justify-center items-center flex-1">
            <Loader />
          </div>
        ) : (
          <div className="flex-1 flex border-t min-h-0">
            <section aria-label="Lineage" className="min-h-0 relative overflow-clip flex-1">
              <h3 className="font-semibold mb-3 flex items-center gap-2 p-3 rounded-md bg-background border absolute top-3 left-3 z-10 w-max">
                <LucideNetwork />
                Duplicates Lineage
              </h3>
              <AuditSecretDetailsLineage
                lineageData={lineageData}
                currentSecretId={secretId}
                setSecretId={setSecretId}
              />
            </section>
            <section aria-label="Details" className="min-h-0 grid grid-rows-[auto_1fr] bg-background relative flex-1 max-w-[640px] min-w-[480px] border-l">
              <div className="p-6 border-b">
                <div className="flex items-center flex-wrap gap-2">
                  <LucideSquareAsterisk className="size-6 text-primary" />
                  {listenerSecretData.name || "Unnamed Secret"}
                  <Badge variant="outline">{listenerSecretData.providerName}</Badge>
                </div>
              </div>
              <AuditSecretDetailsData
                secretData={listenerSecretData}
                setSecretId={setSecretId}
              />
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}