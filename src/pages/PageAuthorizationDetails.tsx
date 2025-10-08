import { LayoutPage } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LucideRefreshCw } from "lucide-react";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { useParams } from "react-router-dom";
import {
  AuthorizationData,
  AuthorizationDetails,
} from "@/components/workflows/Authorizations";
import { useEffect, useMemo } from "react";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import useGetAuthorization from "@/services/federations/queries/useGetAuthorization";
import YAML from "yaml";
import { Loader } from "@/components/ui/Loader";

// TODO[iurisevero]: Define authorization manifest type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseManifest(manifest?: string): any {
  const raw = manifest || "{}";
  try {
    return JSON.parse(raw);
  } catch {
    try {
      return YAML.parse(raw);
    } catch (e) {
      console.error("Failed to parse manifest as JSON or YAML:", e);
      return {};
    }
  }
}

export function PageAuthorizationDetails() {
  const queryClient = useQueryClient();
  const { authorizationName } = useParams();

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: [
        "authorizations",
        "useGetAuthorizations",
        `useGetAuthorizations/${authorizationName}`,
      ],
    });
  };

  const {
    data: authorizationData,
    isLoading: isLoadingAuthorization,
    error: authorizationError,
  } = useGetAuthorization(
    {
      name: authorizationName ?? "",
    },
    {
      enabled: !!authorizationName,
    }
  );

  useEffect(() => {
    if (authorizationError) {
      handleDefaultApiHttpError(
        authorizationError,
        `Error while fetching authorization data`
      );
    }
  }, [authorizationError]);

  const authorization = useMemo(() => {
    if (!authorizationData)
      return {
        name: authorizationName ?? "",
        manifest: "",
        federationRef: { name: "", kind: ""},
        allowedClusterSecretStores: [],
        allowedGenerators: [],
        allowedGeneratorStates: [],
      } as AuthorizationData;

    return authorizationData;
  }, [authorizationData, authorizationName]);

  const yamlString = useMemo(() => {
    try {
      const parsed = parseManifest(authorization.manifest);
      const yamlStr = YAML.stringify({ spec: parsed.spec || {} });
      return yamlStr;
    } catch (error) {
      console.error("Failed to parse manifest", error);
      return "Invalid manifest format.";
    }
  }, [authorization]);

  return (
    <LayoutPage
      title={`${authorizationName}`}
      description={`Identity Provider: ${authorization.federationRef.name} (${authorization.federationRef.kind})`}
    >
      <LayoutPortalTopbarActions>
        <Button variant="secondary" onClick={handleRefresh}>
          <LucideRefreshCw />
          Refresh Data
        </Button>
      </LayoutPortalTopbarActions>
      {isLoadingAuthorization ? (
        <Loader />
      ) : (
        <AuthorizationDetails authorization={authorization} yamlString={yamlString} />
      )}
    </LayoutPage>
  );
}
