import { LayoutPage } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LucideRefreshCw } from "lucide-react";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { useParams } from "react-router-dom";
import {
  GeneratorData,
  GeneratorDetails,
} from "@/components/workflows/Generators";
import { useEffect, useMemo } from "react";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import useGetGenerator from "@/services/workflows/queries/useGetGenerator";
import YAML from "yaml";
import { Loader } from "@/components/ui/Loader";

// TODO[iurisevero]: Define generator manifest type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseManifest(manifest?: string): any {
  const raw = manifest || '{}';
  try {
    return JSON.parse(raw);
  } catch {
    try {
      return YAML.parse(raw);
    } catch (e) {
      console.error('Failed to parse manifest as JSON or YAML:', e);
      return {};
    }
  }
}

export function PageGeneratorDetails() {
  const queryClient = useQueryClient();
  const { generatorKind, generatorNamespace, generatorName } = useParams();

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: [
        "workflows",
        "useGetGenerators",
        `useGetGenerators/${generatorKind}/${generatorNamespace}/${generatorName}`,
      ],
    });

    queryClient.invalidateQueries({
      queryKey: [
        "workflows",
        "useGetGeneratorStates",
        `useGetGeneratorStates/${generatorKind}/${generatorNamespace}/${generatorName}`,
      ],
    });
  };

  handleRefresh();

  const {
    data: generatorData,
    isLoading: isLoadingGenerator,
    error: generatorError,
  } = useGetGenerator(
    { kind: generatorKind ?? "", namespace: generatorNamespace ?? "", name: generatorName ?? "" },
    {
      enabled: !!generatorKind && !!generatorNamespace && !!generatorName,
    }
  );

  useEffect(() => {
    if (generatorError) {
      handleDefaultApiHttpError(
        generatorError,
        `Error while fetching workflow run data`
      );
    }
  }, [generatorError]);

  const generator = useMemo(() => {
    if (!generatorData)
      return {
        name: generatorName ?? "",
        namespace: generatorNamespace ?? "",
        kind: "",
        manifest: "",
        status: { output: {}},
      } as GeneratorData;

    return generatorData;
  }, [generatorData, generatorName, generatorNamespace]);

  const yamlString = useMemo(() => {
    try {
      const parsed = parseManifest(generator.manifest);
      const yamlStr = YAML.stringify({ spec: parsed.spec || {} });
      return yamlStr;
    } catch (error) {
      console.error("Failed to parse manifest", error);
      return "Invalid manifest format.";
    }
  }, [generator]);

  return (
    <LayoutPage title={`${generatorName}`} description={"Kind: " + generator.kind}>
      <LayoutPortalTopbarActions>
        <Button variant="secondary" onClick={handleRefresh}>
          <LucideRefreshCw />
          Refresh Data
        </Button>
      </LayoutPortalTopbarActions>
      {isLoadingGenerator ? <Loader /> : <GeneratorDetails generator={generator} yamlString={yamlString}/>}
    </LayoutPage>
  );
}
