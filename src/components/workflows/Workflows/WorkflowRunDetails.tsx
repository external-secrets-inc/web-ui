import { Loader } from "@/components/ui/Loader";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import useGetAuditWorkflowData from "@/services/audit/queries/useGetAuditWorkflowData";
import useGetLineagePath from "@/services/audit/queries/useGetLineagePath";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { useEffect, useMemo, useState, useRef } from "react";
import { AuditWorkflowData } from "./Audit.interfaces";
import AuditWorkflowDetailsData from "./AuditWorkflowDetailsData";
import AuditWorkflowDetailsLineage from "./AuditWorkflowDetailsLineage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LucideNetwork, LucideSquareAsterisk, LucideAlertCircle } from "lucide-react";
import { useFeatureFlag } from "@/context/FeatureFlagContext";
import { cn } from "@/lib/utils";
import { AUDIT_QUERY_STALE_TIME } from "@/components/Audit/Audit.constants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WorkflowRunGraph } from "./WorkflowRunGraph";
import useGetWorkflowRun from "@/services/workflows/queries/useGetWorkflowRun";

export default function AuditWorkflowDetails({
  name,
  namespace,
}: {
  name: string;
  namespace: string;
}) {
  const {
    data: workflowRunData,
    refetch: workflowRunRefetch,
    isLoading: isLoadingWorkflowRun,
    isError: isErrorWorkflowRun,
    isRefetchError: isRefetchErrorWorkflowRun,
    error: workflowRunError,
  } = useGetWorkflowRun({name: name, namespace: namespace}, {
    staleTime: 30000,
  });

  useEffect(() => {
    if (workflowRunError) {
      handleDefaultApiHttpError(
        workflowRunError,
        `Error while fetching workflow data`
      );
    }
  }, [workflowRunError]);

  if (!name || !namespace) return null;

  return (
    workflowRunData &&
    <WorkflowRunGraph workflow={workflowRunData}/>
  );
}
