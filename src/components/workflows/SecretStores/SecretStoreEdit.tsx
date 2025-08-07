import { useEffect, useMemo, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { SecretStoreEditWithYaml } from "./SecretStoreEditWithYaml";
import { SecretStoreEditWithEsiSchemaForm } from "./SecretStoreEditWithEsiSchemaForm";
import { Loader, LucideSquareCode, LucideTextCursorInput } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useParams } from "react-router-dom";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { SecretStoreData } from "./SecretStores.interfaces";
import useGetSecretStore from "@/services/workflows/queries/useGetSecretStore";
import YAML from "yaml";

type FormMode = "yaml" | "form";

export function SecretStoreEdit() {
  const [formMode, setFormMode] = useState<FormMode>("form");
  const { secretstoreNamespace, secretstoreName } = useParams();

  const {
    data: secretStoreData,
    isLoading: isLoadingSecretStore,
    error: secretStoreError,
  } = useGetSecretStore(
    { namespace: secretstoreNamespace ?? "", name: secretstoreName ?? "" },
    {
      enabled: !!secretstoreNamespace && !!secretstoreName,
    }
  );

  useEffect(() => {
    if (secretStoreError) {
      handleDefaultApiHttpError(
        secretStoreError,
        `Error while fetching workflow run data`
      );
    }
  }, [secretStoreError]);

  const secretStore = useMemo(() => {
    if (!secretStoreData)
      return {
        name: secretstoreName,
        namespace: secretstoreNamespace,
        manifest: "{}",
        provider: "",
      } as SecretStoreData;

    return secretStoreData;
  }, [secretStoreData, secretstoreName, secretstoreNamespace]);

  const processedManifest = useMemo(() => {
    const yamlManifest = YAML.parse(secretStore.manifest);

    if (yamlManifest.metadata) {
      delete yamlManifest.metadata.creationTimestamp
      delete yamlManifest.metadata.generation
      delete yamlManifest.metadata.resourceVersion
      delete yamlManifest.metadata.uid
    }

    if (yamlManifest.status) {
      delete yamlManifest.status;
    }

    return YAML.stringify(yamlManifest)
  }, [secretStore])

  return (
    <>
      {isLoadingSecretStore ? (
        <div className="flex justify-center items-center flex-1 w-full h-full">
          <Loader />
        </div>
      ) : (
        <>
          <LayoutPortalTopbarActions>
            <ToggleGroup
              type="single"
              size="sm"
              variant="outline"
              value={formMode}
              onValueChange={(value) => value && setFormMode(value as FormMode)}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <ToggleGroupItem value="form">
                      <LucideTextCursorInput />
                    </ToggleGroupItem>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Form Builder</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <ToggleGroupItem value="yaml">
                      <LucideSquareCode />
                    </ToggleGroupItem>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Raw YAML Manifest</TooltipContent>
              </Tooltip>
            </ToggleGroup>
          </LayoutPortalTopbarActions>
          {formMode === "yaml" ? (
            <SecretStoreEditWithYaml manifest={processedManifest}/>
          ) : (
            <SecretStoreEditWithEsiSchemaForm manifest={processedManifest} />
          )}
        </>
      )}
    </>
  );
}
