import FeatureList from "@/components/FeatureList";
import FeatureDetailsCardDialog from "@/components/FeatureList/FeatureDetailsCardDialog";
import NewFeatureCard from "@/components/FeatureList/NewFeatureCard";
import { NewAgentForm } from "@/components/agents/NewAgentForm";
import { API_DOMAIN, ONE_SECOND_IN_MILLISECONDS } from "@/constants";
import useCreateAgent from "@/services/agents/mutations/useCreateAgent";
import useCreateAgentManifestToken from "@/services/agents/mutations/useCreateAgentManifestToken";
import useDeleteAgent from "@/services/agents/mutations/useDeleteAgent";
import useGetAgentManifest from "@/services/agents/queries/useGetAgentManifest";
import useGetAgents from "@/services/agents/queries/useGetAgents";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { ApiHttpError, Agent } from "@/types";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";



export default function ListAgents() {
  const featureName: string = "Agent"

  const [featureId, setFeatureId] = useState("")
  const [applyCommand, setApplyCommand] = useState("")

  const { data: agentsData, refetch: agentsRefetch, isError: agentsIsError, error: agentError, isRefetchError: agentIsRefetchError } = useGetAgents({
    refetchInterval: 20 * ONE_SECOND_IN_MILLISECONDS,
    refetchIntervalInBackground: true,
  });
  const { data: manifestData, error: manifestError, isError: manifestIsError } = useGetAgentManifest(featureId, "latest", {
    enabled: featureId !== "",
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
    if (featureId === "") return

    createToken({ id: featureId })
  }, [featureId, createToken])

  useEffect(() => {
    if (featureId === "") return
    if (!token) return

    const command = [
      "curl \\",
      `${API_DOMAIN}/public/agents/${featureId}/manifest/latest\\`,
      `?token=${token} \\`,
      "| kubectl apply -f -",
    ].join('\n');
    setApplyCommand(command);
  }, [token, featureId])

  useEffect(() => {
    if (!(agentError || agentIsRefetchError)) return;

    handleDefaultApiHttpError(agentError, "Error while fetching agents")
  }, [agentError, agentsIsError, agentIsRefetchError])

  useEffect(() => {
    if (!manifestIsError) return;

    handleDefaultApiHttpError(manifestError, "Error while fetching agents manifest")
  }, [manifestError, manifestIsError])

  return (
    <FeatureList>
      <NewFeatureCard
        featureName={featureName}
        performCreate={performCreate}
        Form={NewAgentForm}
      />
      {agentsData && agentsData.map((agent: Agent) => (
        <FeatureDetailsCardDialog
          key={agent.id}
          featureID={agent.id}
          featureName={agent.name}
          featureStatus={agent.current_status}
          featureType={featureName}
          featureDescription="Agent used for an External Secrets Operator installation in your Kubernetes cluster"
          setFeatureId={setFeatureId}
          applyCommand={applyCommand}
          manifest={manifestData ? manifestData.manifest : ""}
          onDeleteFeature={performDelete}
        />
      )
      )}
    </FeatureList>
  )
}
