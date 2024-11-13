import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";

import FeatureCollection from "@/components/FeatureCollection";
import { NewRotatorForm } from "@/components/rotators/NewRotatorForm";
import { API_DOMAIN, ONE_SECOND_IN_MILLISECONDS } from "@/constants";
import useCreateRotator from "@/services/rotators/mutations/useCreateRotator";
import useCreateRotatorManifestToken from "@/services/rotators/mutations/useCreateRotatorManifestToken";
import useDeleteRotator from "@/services/rotators/mutations/useDeleteRotator";
import useGetRotatorManifest from "@/services/rotators/queries/useGetRotatorManifest";
import useGetRotators from "@/services/rotators/queries/useGetRotators";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { ApiHttpError } from "@/types";

export default function ListRotators() {
  const featureType: string = "Async Rotator"

  const [featureID, setFeatureID] = useState("")
  const [applyCommand, setApplyCommand] = useState("")
  const [isManifestReady, setIsManifestReady] = useState(false);

  const { data: rotatorsData, refetch: rotatorsRefetch, isError: rotatorsIsError, error: rotatorError, isRefetchError: rotatorIsRefetchError } = useGetRotators({
    refetchInterval: 20 * ONE_SECOND_IN_MILLISECONDS,
    refetchIntervalInBackground: true,
  });
  const { data: manifestData, error: manifestError, isError: manifestIsError } = useGetRotatorManifest(featureID, "latest", {
    enabled: featureID !== "",
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
      `${API_DOMAIN}/public/rotators/${featureID}/manifest/latest\\`,
      `?token=${token} \\`,
      "| kubectl apply -f -",
    ].join('\n');
    setApplyCommand(command);
    setIsManifestReady(true);
  }, [token, manifestData, featureID]);

  useEffect(() => {
    if (!(rotatorError || rotatorIsRefetchError)) return;

    handleDefaultApiHttpError(rotatorError, "Error while fetching async rotators")
  }, [rotatorError, rotatorsIsError, rotatorIsRefetchError])

  useEffect(() => {
    if (!manifestIsError) return;

    handleDefaultApiHttpError(manifestError, "Error while fetching async rotators manifest")
  }, [manifestError, manifestIsError])

  return (
    <FeatureCollection
      data={rotatorsData || []}
      featureType={featureType}
      featureDescription="Async Rotator listens to secret rotation notifications and triggers the External Secrets Operator reconciliation"
      onDeleteFeature={performDelete}
      setFeatureID={setFeatureID}
      applyCommand={isManifestReady ? applyCommand : ''}
      manifestData={isManifestReady ? manifestData?.manifest : ''}
      performCreate={performCreate}
      Form={NewRotatorForm}
    />
  );
}
