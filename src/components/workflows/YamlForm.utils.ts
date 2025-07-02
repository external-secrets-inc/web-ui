import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import YAML from "yaml";
import type { KubernetesResourceType } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";
import {
  extractErrorMessage,
  getSuccessMessage,
  getKindFromResourceType
} from "@/components/EsiSchemaForm/EsiSchemaForm.utils";

/**
 * Form data structure for YAML forms
 */
export interface YamlFormData {
  yamlContent: string;
}

/**
 * Return type for the useYamlForm hook
 */
export interface UseYamlFormReturn {
  form: ReturnType<typeof useForm<YamlFormData>>;
  isPending: boolean;
  onSubmit: (data: YamlFormData) => void;
}

/**
 * Hook that provides common YAML form functionality
 */
export function useYamlForm<TResourceType extends KubernetesResourceType>(
  /** The type of Kubernetes resource being created */
  resourceType: TResourceType,
  /** Function that returns the default YAML template */
  createDefaultTemplate: () => string,
  /** Navigation path after successful submission */
  navigationPath: string = "..",
  /** The mutation hook for creating the resource */
  mutation: {
    mutate: (data: { manifest: string }, options?: {
      onSuccess?: () => void;
      onError?: (error: unknown) => void;
    }) => void;
    isPending: boolean;
  }
): UseYamlFormReturn {
  const navigate = useNavigate();

  const form = useForm<YamlFormData>({
    defaultValues: {
      yamlContent: "",
    },
    mode: "onSubmit",
  });

  // Initialize with default template if empty
  React.useEffect(() => {
    if (!form.getValues("yamlContent")) {
      const initialTemplate = createDefaultTemplate();
      form.setValue("yamlContent", initialTemplate);
    }
  }, [form, createDefaultTemplate]);

  const onSubmit = (data: YamlFormData) => {
    mutation.mutate(
      { manifest: data.yamlContent },
      {
        onSuccess: () => {
          const message = getSuccessMessage(resourceType);
          toast.success(message);
          navigate(navigationPath);
        },
        onError: (error: unknown) => {
          const errorMessage = extractErrorMessage(error);

          form.setError("yamlContent", {
            type: "server",
            message: errorMessage,
          });
        },
      }
    );
  };

  return {
    form,
    isPending: mutation.isPending,
    onSubmit,
  };
}

/**
 * Creates validation rules for YAML fields with automatic Kubernetes manifest validation
 */
export function createYamlValidationRules<TResourceType extends KubernetesResourceType>(
  /** The type of Kubernetes resource for automatic validation */
  resourceType: TResourceType,
  /** Optional custom validation function for special cases */
  customValidation?: (parsedYaml?: unknown) => string | null
) {
  return {
    validate: (value: string) => {
      if (!value) return true;

      try {
        const parsedYaml = YAML.parse(value);

        // Use custom validation if provided, otherwise use default
        if (customValidation) {
          return customValidation(parsedYaml);
        }

        return validateKubernetesManifest(resourceType, parsedYaml);
      } catch {
        // YAML parsing errors are handled by FieldYaml itself
        return true;
      }
    },
  };
}

/**
 * Base validation function for Kubernetes manifests
 */
export function validateKubernetesManifest(
  /** The resource type for validation */
  resourceType: KubernetesResourceType,
  /** The parsed YAML object */
  parsedYaml?: unknown
): string | null {
  if (!parsedYaml) {
    return null;
  }

  const manifest = parsedYaml as Record<string, unknown>;
  const expectedKind = getKindFromResourceType(resourceType);

  if (manifest.kind !== expectedKind) {
    return `Invalid resource kind: Expected "${expectedKind}", got "${
      manifest.kind || "unknown"
    }".`;
  }

  const metadata = manifest.metadata as Record<string, unknown> | undefined;
  if (!metadata?.name) {
    return "Manifest is missing required field: metadata.name";
  }

  return null;
}