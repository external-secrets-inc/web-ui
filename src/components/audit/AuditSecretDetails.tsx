import { Loader } from "@/components/ui/Loader";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ONE_SECOND_IN_MILLISECONDS } from "@/constants";
import useGetAuditSecretData from "@/services/audit/queries/useGetAuditSecretData";
import useGetLineagePath from "@/services/lineage/queries/useGetLineagePath";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { useEffect, useMemo, useState, useRef } from "react";
import { AuditSecretData } from "./Audit.interfaces";
import AuditSecretDetailsData from "./AuditSecretDetailsData";
import AuditSecretDetailsLineage from "./AuditSecretDetailsLineage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LucideNetwork, LucideSquareAsterisk } from "lucide-react";
import { useFeatureFlag } from "@/context/FeatureFlagContext";
import { cn } from "@/lib/utils";

export default function AuditSecretDetails({
  secretId,
  setSecretId,
  onOpenChange
}: {
  secretId: string | null;
  setSecretId: (secret: string) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const featureFlagShowLineage = useFeatureFlag('lineage');

  // Track tab state to properly handle ReactFlow's fitView timing
  // Using controlled state instead of defaultValue ensures we can
  // detect actual tab changes and pass this info to child components
  const [activeTab, setActiveTab] = useState("details");
  const previousSecretIdRef = useRef<string | null>(null);

  const {
    data: secretData,
    refetch: secretRefetch,
    isLoading: isLoadingSecretData,
    error: secretDataError,
  } = useGetAuditSecretData(false, secretId || '', {
    refetchInterval: 20 * ONE_SECOND_IN_MILLISECONDS,
    refetchIntervalInBackground: true,
    enabled: !!secretId
  });

  const { data: lineageData } = useGetLineagePath(false, secretId || '', {
    enabled: !!secretId && featureFlagShowLineage
  });

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
      } as AuditSecretData;

    return secretData;
  }, [secretData]);

  // Only show lineage view when feature flag is enabled AND secret has duplicates
  // This prevents loading ReactFlow and related components when they're not needed
  const shouldShowLineage = featureFlagShowLineage && listenerSecretData.duplicates.length > 0;

  // Reset to details tab when viewing a different secret
  // This ensures users always start with details view when switching secrets,
  // preventing confusion if they were previously on lineage tab of another secret
  useEffect(() => {
    if (secretId !== previousSecretIdRef.current) {
      setActiveTab("details");
      previousSecretIdRef.current = secretId;
    }
  }, [secretId]);

  useEffect(() => {
    if (secretDataError) {
      handleDefaultApiHttpError(
        secretDataError,
        `Error while fetching secret data`
      );
      onOpenChange(false);
    }
  }, [secretDataError, onOpenChange]);

  useEffect(() => {
    if (secretId) {
      secretRefetch();
    }
  }, [secretId, secretRefetch]);

  if (!secretId) return null;

  return (
    <Sheet
      open={!!secretId}
      onOpenChange={onOpenChange}
    >
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
          <div className="flex justify-center items-center flex-1 lg:max-w-[560px] lg:min-w-[560px] h-full">
            <Loader />
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col">
            <Tabs
              value={activeTab}
              className="flex-1 min-h-0 flex flex-col"
              onValueChange={setActiveTab}
            >
              {/* Mobile-only tab list but hidden on desktop with sr-only/hidden classes */}
              {shouldShowLineage && (
                <div className="lg:hidden py-2 px-12 flex justify-center bg-muted/35 border-b">
                  <TabsList className="grid w-full grid-cols-2 max-w-80">
                    <TabsTrigger
                      value="details"
                      className="gap-2"
                    >
                      <LucideSquareAsterisk className="flex-none" />
                      Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="lineage"
                      className="gap-2"
                    >
                      <LucideNetwork className="flex-none" />
                      Lineage
                    </TabsTrigger>
                  </TabsList>
                </div>
              )}

              <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:border-t divide-x">
                {/* forceMount is necessary to maintain both tabs "open" at the same time on desktop.
                    With that, then we need manage visibility with sr-only/hidden classes manually */}
                {shouldShowLineage && (
                  <TabsContent
                    value="lineage"
                    className="flex-1 !w-screen lg:!max-w-[calc(100vw-560px)] lg:!w-[calc(50vw+(1280px/2-560px))] data-[state=inactive]:sr-only lg:data-[state=inactive]:not-sr-only order-1 lg:order-1 lg:flex-[2] mt-0"
                    forceMount
                  >
                    <AuditSecretDetailsLineage
                      // `key` to force a fresh instance of ReactFlow when secret changes
                      // This ensures a clean slate for the graph, preventing any stale state
                      // from affecting the new secret's layout and fit view calculations
                      key={`lineage-${secretId}`}
                      className="h-full shadow-[inset_-24px_0px_32px_-32px_rgba(0,0,0,0.2)] dark:shadow-none"
                      lineageData={lineageData}
                      currentSecretId={secretId}
                      setSecretId={setSecretId}
                      isActive={activeTab === "lineage"}
                    />
                  </TabsContent>
                )}
                <TabsContent
                  value="details"
                  className={cn(
                    "lg:max-w-[560px] lg:min-w-[560px] flex-1 min-h-0 data-[state=inactive]:hidden lg:data-[state=inactive]:block order-2 lg:order-2 mt-0",
                    !shouldShowLineage && "lg:w-[560px]"
                  )}
                  forceMount
                >
                  <AuditSecretDetailsData
                    className="lg:max-w-[560px] lg:min-w-[560px] h-full overflow-y-auto"
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