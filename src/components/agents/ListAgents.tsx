import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";

import FeatureCollection from "@/components/FeatureCollection";
import { NewAgentForm } from "@/components/agents/NewAgentForm";
import { API_DOMAIN, ONE_SECOND_IN_MILLISECONDS } from "@/constants";
import useCreateAgent from "@/services/agents/mutations/useCreateAgent";
import useCreateAgentManifestToken from "@/services/agents/mutations/useCreateAgentManifestToken";
import useDeleteAgent from "@/services/agents/mutations/useDeleteAgent";
import useGetAgentManifest from "@/services/agents/queries/useGetAgentManifest";
import useGetAgents from "@/services/agents/queries/useGetAgents";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { ApiHttpError } from "@/types";

export default function ListAgents() {
  const featureType: string = "Agent"

  const [featureID, setFeatureID] = useState("")
  const [applyCommand, setApplyCommand] = useState("")
  const [isManifestReady, setIsManifestReady] = useState(false);

  const { data: agentsData, refetch: agentsRefetch, isError: agentsIsError, error: agentError, isRefetchError: agentIsRefetchError } = useGetAgents({
    refetchInterval: 20 * ONE_SECOND_IN_MILLISECONDS,
    refetchIntervalInBackground: true,
  });
  const { data: manifestData, error: manifestError, isError: manifestIsError } = useGetAgentManifest(featureID, "latest", {
    enabled: featureID !== "",
  });

  const { mutate: createToken, data: token } = useCreateAgentManifestToken({
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to generate manifest token")
  });
  const { mutate: createAgent } = useCreateAgent({
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to create agent"),
    onSuccess: () => {
      agentsRefetch();
      toast.success("Agent created successfully")
    }
  });
  const { mutate: deleteAgent } = useDeleteAgent({
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to delete agent"),
    onSuccess: () => {
      agentsRefetch();
      toast.success("Agent deleted successfully")
    },
  })

  const performCreate = ({ featureName }: { featureName: string }) => {
    createAgent({ name: featureName })
  }

  const performDelete = (agentId: string) => {
    deleteAgent({ id: agentId });
  }

  useEffect(() => {
    if (featureID === "") {
      setIsManifestReady(false);
      return;
    }

    createToken({ id: featureID });
  }, [featureID, createToken]);

  useEffect(() => {
    if (!token || !manifestData) return;

    const command = [
      "curl \\",
      `${API_DOMAIN}/public/agents/${featureID}/manifest/latest\\`,
      `?token=${token} \\`,
      "| kubectl apply -f -",
    ].join('\n');
    setApplyCommand(command);
    setIsManifestReady(true);
  }, [token, manifestData, featureID]);

  useEffect(() => {
    if (!(agentError || agentIsRefetchError)) return;

    handleDefaultApiHttpError(agentError, "Error while fetching agents")
  }, [agentError, agentsIsError, agentIsRefetchError])

  useEffect(() => {
    if (!manifestIsError) return;

    handleDefaultApiHttpError(manifestError, "Error while fetching agents manifest")
  }, [manifestError, manifestIsError])

  return (
    <FeatureCollection
      data={agentsData || []}
      featureType={featureType}
      featureDescription="Agent used for an External Secrets Operator installation in your Kubernetes cluster"
      onDeleteFeature={performDelete}
      setFeatureID={setFeatureID}
      applyCommand={isManifestReady ? applyCommand : ''}
      manifestData={isManifestReady ? manifestData?.manifest : ''}
      performCreate={performCreate}
      Form={NewAgentForm}
    />
  );
}
