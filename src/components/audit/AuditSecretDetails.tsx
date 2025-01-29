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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LucideNetwork, LucideSquareAsterisk } from "lucide-react";

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
      <SheetContent className="min-w-0 sm:max-w-[unset] w-screen lg:w-auto flex flex-col h-full p-0">
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
          <div className="flex-1 min-h-0 flex flex-col">
            <Tabs defaultValue="details" className="flex-1 min-h-0 flex flex-col">
              <div className="lg:hidden py-2 px-12 flex justify-center bg-muted/35 border-b">
                <TabsList className="grid w-full grid-cols-2 max-w-80">
                  <TabsTrigger value="details" className="gap-2">
                    <LucideSquareAsterisk className="flex-none" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="lineage" className="gap-2">
                    <LucideNetwork className="flex-none" />
                    Lineage
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:border-t">
                <TabsContent
                  value="lineage"
                  className="flex-1 !w-screen lg:max-w-[calc(50vw+(1280px/2-480px))] data-[state=inactive]:sr-only lg:data-[state=inactive]:not-sr-only order-1 lg:order-1 lg:flex-[2] mt-0"
                  forceMount
                >
                  <AuditSecretDetailsLineage
                    className="h-full"
                    lineageData={lineageData}
                    currentSecretId={secretId}
                    setSecretId={setSecretId}
                  />
                </TabsContent>
                <TabsContent
                  value="details"
                  className="flex-1 min-h-0 data-[state=inactive]:hidden lg:data-[state=inactive]:block order-2 lg:order-2 mt-0"
                  forceMount
                >
                  <AuditSecretDetailsData
                    className="lg:max-w-[640px] lg:min-w-[480px] h-full overflow-y-auto"
                    secretData={listenerSecretData}
                    setSecretId={setSecretId}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}