import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FieldYaml } from "@/components/ui/fields/FieldYaml";
import { Link } from "react-router-dom";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  useYamlForm,
  createYamlValidationRules
} from "./YamlForm.utils";
import type { KubernetesResourceType } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";

/**
 * Props for the YamlFormWrapper component
 */
interface YamlFormWrapperProps<TResourceType extends KubernetesResourceType> {
  /** The type of Kubernetes resource being created (used for automatic validation) */
  resourceType: TResourceType;
  /** Function that returns the default YAML template to populate the form */
  createDefaultTemplate: () => string;
  /** Navigation path after successful submission @default ".." */
  navigationPath?: string;
  /** React Query mutation hook for creating the resource */
  mutation: {
    mutate: (data: { manifest: string }, options?: {
      onSuccess?: () => void;
      onError?: (error: unknown) => void;
    }) => void;
    isPending: boolean;
  };
  /** Label text displayed above the YAML input field */
  formLabel: string;
  /** Description text explaining the purpose and usage of the form */
  formDescription: string;
  /** Text displayed on the submit button */
  submitButtonText: string;
  /** HTML form ID for external form submission @default "yaml-form" */
  formId?: string;
  /** Additional UI elements to render between Cancel and Submit buttons */
  additionalActions?: React.ReactNode;
  /** Custom validation rules for the YAML field (optional, defaults to standard validation) */
  validationRules?: { validate: (value: string) => string | null | true };
}

/**
 * Wrapper component that provides common raw ESI Resources YAML Manifests form
 */
export function YamlFormWrapper<TResourceType extends KubernetesResourceType>({
  resourceType,
  createDefaultTemplate,
  navigationPath = "..",
  mutation,
  formLabel,
  formDescription,
  submitButtonText,
  formId = "yaml-form",
  additionalActions,
  validationRules,
}: YamlFormWrapperProps<TResourceType>) {
  const { form, isPending, onSubmit } = useYamlForm(resourceType, createDefaultTemplate, navigationPath, mutation);
  const defaultValidationRules = createYamlValidationRules(resourceType);

  return (
    <>
      <LayoutPortalTopbarActions>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            asChild
          >
            <Link to="..">Cancel</Link>
          </Button>
          {additionalActions}
          <Button
            type="submit"
            size="sm"
            form={formId}
            disabled={isPending}
            className="grid place-items-center"
          >
            {isPending && <Loader className="[grid-area:1/1]" />}
            <span className={cn(isPending && "invisible", "[grid-area:1/1]")}>
              {submitButtonText}
            </span>
          </Button>
        </div>
      </LayoutPortalTopbarActions>

      <div className="space-y-6">
        <Form {...form}>
          <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldYaml
              name="yamlContent"
              label={formLabel}
              description={formDescription}
              placeholder="Enter YAML manifest"
              className="min-h-[400px]"
              descriptionInline
              required
              rules={validationRules || defaultValidationRules}
            />
          </form>
        </Form>
      </div>
    </>
  );
}