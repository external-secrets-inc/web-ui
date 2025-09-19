import type { UISchemaField } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";
import type { FindingRendererItem } from "./common/Finding.interfaces";

/**
 * Field type names as used by UISchemaField.type.
 */
export type FieldType = UISchemaField["type"];

/**
 * Supported renderer names. Extend as new renderers are implemented.
 */
export type RendererName = "location" | "finding";

/**
 * Renderer identifier and optional configuration.
 *
 * Future fields:
 * - metadata: arbitrary key-values to tweak visualization
 * - properties: optional flags to alter default renderer behavior
 */
export type UISchemaMetadataRenderer =
  | { name: Extract<RendererName, "location"> }
  | { name: Extract<RendererName, "finding">; metadata?: Record<string, FindingRendererItem> };

/**
 * Pure replacement renderer signature: return a React element to replace the
 * field entirely, or return null to fall back to the default field UI.
 */
/**
 * Props forwarded from the parent FormControl Slot to the renderer's root element.
 * This enables correct wiring of id and ARIA attributes used by labels and a11y tooling.
 */
export type ForwardedFormControlProps = React.AriaAttributes & {
  id?: string;
  style?: React.CSSProperties;
};

export type RendererProps = RendererContext & ForwardedFormControlProps;

export type Renderer = React.FC<RendererProps>;

/**
 * Minimal, generic context passed to renderers. This keeps the API stable and
 * avoids coupling to specific UI components. Renderers can import whatever UI
 * they need (tables, selects, custom inputs) and bind directly to controller.
 */
export interface RendererContext {
  field: UISchemaField;
  controller: {
    value: unknown;
    onChange: (v: unknown) => void;
    disabled: boolean;
    name: string;
  };
  data: {
    /** Raw API options (if any) already fetched for this field. */
    apiOptions: unknown[];
  };
  utils: {
    /**
     * Encodes any value into a string for string-only inputs (e.g., HTML selects).
     * If the input is already a string, it is returned as-is.
     */
    serializeFieldValueToString: (x: unknown) => string;
    /**
     * Decodes a string produced by `encode` back into its original value.
     * Non-encoded strings are returned unchanged.
     */
    deserializeFieldValueFromString: (s: string) => unknown;
  };
}

/**
 * Dynamic renderer module loader type.
 */
export type RendererLoader = () => Promise<Renderer>;


