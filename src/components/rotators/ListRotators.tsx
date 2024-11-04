import FeatureList from "@/components/FeatureList";
import FeatureDetailsCardDialog from "@/components/FeatureList/FeatureDetailsCardDialog";
import NewFeatureCard from "@/components/FeatureList/NewFeatureCard";
import { NewRotatorForm } from "@/components/rotators/NewRotatorForm";
import { API_DOMAIN, TWENTY_SECONDS_IN_MILLISECONDS } from "@/constants";
import useCreateRotator from "@/services/rotators/mutations/useCreateRotator";
import useCreateRotatorManifestToken from "@/services/rotators/mutations/useCreateRotatorManifestToken";
import useDeleteRotator from "@/services/rotators/mutations/useDeleteRotator";
import useGetRotatorManifest from "@/services/rotators/queries/useGetRotatorManifest";
import useGetRotators from "@/services/rotators/queries/useGetRotators";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { ApiHttpError, Rotator } from "@/types";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";



export default function ListRotators() {
  const featureName: string = "Async Rotator"

  const [featureId, setFeatureId] = useState("")
  const [applyCommand, setApplyCommand] = useState("")

  const { data: rotatorsData, refetch: rotatorsRefetch, isError: rotatorsIsError, error: rotatorError, isRefetchError: rotatorIsRefetchError } = useGetRotators({
    refetchInterval: TWENTY_SECONDS_IN_MILLISECONDS,
    refetchIntervalInBackground: true,
  });
  const { data: manifestData, error: manifestError, isError: manifestIsError } = useGetRotatorManifest(featureId, "latest", {
    enabled: featureId !== "",
  });

  const { mutate: createToken, data: token } = useCreateRotatorManifestToken({
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to generate manifest token")
  });
  const { mutate: createRotator } = useCreateRotator({
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to create async rotator"),
    onSuccess: () => {
      rotatorsRefetch();
      toast.success("Async rotator created successfully")
    }
  });
  const { mutate: deleteRotator } = useDeleteRotator({
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to delete async rotator"),
    onSuccess: () => {
      rotatorsRefetch();
      toast.success("Async rotator deleted successfully")
    },
  })

  const performCreate = ({ featureName }: { featureName: string }) => {
    createRotator({ name: featureName })
  }

  const performDelete = (rotatorId: string) => {
    deleteRotator({ id: rotatorId });
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
      `${API_DOMAIN}/public/rotators/${featureId}/manifest/latest\\`,
      `?token=${token} \\`,
      "| kubectl apply -f -",
    ].join('\n');
    setApplyCommand(command);
  }, [token, featureId])

  useEffect(() => {
    if (!(rotatorError || rotatorIsRefetchError)) return;

    handleDefaultApiHttpError(rotatorError, "Error while fetching async rotators")
  }, [rotatorError, rotatorsIsError, rotatorIsRefetchError])

  useEffect(() => {
    if (!manifestIsError) return;

    handleDefaultApiHttpError(manifestError, "Error while fetching async rotators manifest")
  }, [manifestError, manifestIsError])

  return (
    <FeatureList>
      <NewFeatureCard
        featureName={featureName}
        performCreate={performCreate}
        Form={NewRotatorForm}
      />
      {rotatorsData && rotatorsData.map((rotator: Rotator) => (
        <FeatureDetailsCardDialog
          key={rotator.id}
          featureID={rotator.id}
          featureName={rotator.name}
          featureStatus={rotator.current_status}
          featureType={featureName}
          featureDescription="Async Rotator listens to secret rotation notifications and triggers the External Secrets Operator reconciliation"
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
