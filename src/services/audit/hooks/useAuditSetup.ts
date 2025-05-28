import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import useGetTenantListeners from "@/services/audit/queries/useGetTenantListeners";
import useGetAuditListener from "@/services/audit/queries/useGetAuditListener";
import useCreateTenantListener from "@/services/audit/mutations/useCreateTenantListener";
import useCreateAuditListener from "@/services/audit/mutations/useCreateAuditListener";
import { AUDIT_PAGE_QUERY_REFETCH_INTERVAL, AUDIT_QUERY_STALE_TIME } from "@/components/Audit/Audit.constants";
import { useEffect, useCallback } from "react";
import { IUserData } from "@/types";
import { TenantListener, AuditListener } from "@/components/Audit/Audit.interfaces";
import { AxiosError } from "axios";

interface SetupState {
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
  tenantListener: TenantListener | undefined;
  auditListener: AuditListener | undefined;
}

/**
 * Hook responsible for setting up and managing the audit system's lifecycle.
 * It ensures both tenant and audit listeners exist and are properly configured.
 * The setup process is automatic and will create missing listeners as needed.
 */
const useAuditSetup = () => {
  const authUser = useAuthUser<IUserData>();

  // Tenant Listener Setup - Continuously monitored to ensure existence
  const {
    data: tenantListeners,
    isLoading: isLoadingTenantListeners,
    error: tenantError,
    refetch: refetchTenantListeners
  } = useGetTenantListeners(false, {
    staleTime: AUDIT_QUERY_STALE_TIME,
    refetchInterval: AUDIT_PAGE_QUERY_REFETCH_INTERVAL,
  });

  const {
    mutate: createTenantListener,
    isPending: isCreatingTenant
  } = useCreateTenantListener(false);

  // We only support one tenant listener per tenant currently
  const tenantListenerId = tenantListeners?.[0]?.id;

  const {
    mutate: createAuditListener,
    isPending: isCreatingAudit
  } = useCreateAuditListener(false);

  // Audit Listener Setup - Only enabled when tenant exists
  const {
    data: auditListener,
    isLoading: isLoadingAuditListener,
    error: auditError,
    refetch: refetchAuditListener
  } = useGetAuditListener(false, tenantListenerId || '', {
    staleTime: AUDIT_QUERY_STALE_TIME,
    enabled: !!tenantListenerId, // Prevent unnecessary calls when tenant doesn't exist
    retry: (failureCount, error: AxiosError) => {
      // Only retry if it's not a 404 error and we're not currently creating a listener
      // This prevents multiple creation attempts while the first one is still in progress
      // Retry other errors up to 3 times
      if (error?.response?.status === 404) return false;
      return failureCount < 3 && !isCreatingAudit;
    },
    refetchInterval: isCreatingAudit ? undefined : AUDIT_PAGE_QUERY_REFETCH_INTERVAL, // Pause refetching while creating
    retryOnMount: false, // Prevent retrying on component mount
  });

  const handleTenantCreation = useCallback(() => {
    createTenantListener(
      { name: "default-listener" },
      { onSuccess: () => refetchTenantListeners() }
    );
  }, [createTenantListener, refetchTenantListeners]);

  const handleAuditCreation = useCallback(() => {
    if (!tenantListenerId || !authUser?.tenantId) return;

    createAuditListener(
      {
        listenerID: tenantListenerId,
        tenantID: authUser.tenantId
      },
      { onSuccess: () => refetchAuditListener() }
    );
  }, [tenantListenerId, authUser?.tenantId, createAuditListener, refetchAuditListener]);

  // Main setup orchestration - Handles the creation flow of both listeners
  const setupListeners = useCallback(() => {
    if (isLoadingTenantListeners || isLoadingAuditListener || isCreatingAudit) return;

    // First ensure tenant listener exists
    if (!tenantListeners?.length) {
      handleTenantCreation();
      return;
    }

    // Only attempt to create audit listener if we got a 404 and we're not already creating one
    // This prevents multiple creation attempts while the first one is still in progress
    const needsAuditListener = tenantListenerId && auditError?.response?.status === 404;

    if (needsAuditListener) {
      handleAuditCreation();
    }
  }, [
    isLoadingTenantListeners,
    isLoadingAuditListener,
    isCreatingAudit,
    tenantListeners,
    tenantListenerId,
    auditError?.response?.status,
    handleTenantCreation,
    handleAuditCreation
  ]);

  // Run setup whenever dependencies change
  useEffect(() => {
    setupListeners();
  }, [setupListeners]);

  // Aggregate all states into a single consistent object
  const state: SetupState = {
    isReady: Boolean(tenantListenerId && auditListener?.listenerID),
    isLoading:
      isLoadingTenantListeners ||
      isLoadingAuditListener ||
      isCreatingTenant ||
      isCreatingAudit,
    // Only expose non-404 errors since 404s are expected and handled
    error: tenantError || (auditError?.response?.status !== 404 ? auditError : null) || null,
    tenantListener: tenantListeners?.[0],
    auditListener
  };

  return state;
};

export default useAuditSetup;