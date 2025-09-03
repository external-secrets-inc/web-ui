import type { UISchemaField } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";
import * as React from "react";
import type { Renderer, RendererContext, RendererLoader, RendererName } from "./renderers.interfaces.ts";

type FieldTypeKey = UISchemaField["type"];

/**
 * In-memory cache of loaded renderers keyed by `fieldType::rendererName`.
 * Prevents re-importing the same module across fields.
 */
const rendererCache = new Map<string, Renderer>();

/**
 * Dynamic loader map per field type. Add new renderers here as they are implemented.
 */
// type-first dispatch: loaders[field.type][rendererName]
const loaders: Partial<
  Record<FieldTypeKey, Partial<Record<RendererName, RendererLoader>>>
> = {
  select: {
    location: () => import("./select/SelectLocationRenderer").then((m) => m.default),
    finding: () => import("./select/SelectFindingRenderer.tsx").then((m) => m.default),
  },
  "multi-select": {
    location: () => import("./multiSelect/MultiSelectLocationRenderer").then((m) => m.default),
  },
};

function getCacheKey(fieldType: FieldTypeKey, name: string) {
  return `${fieldType}::${name}`;
}

/**
 * Resolves and lazy-loads a renderer based on `field.UIMetadata.renderer.name`.
 * Returns `null` to signal the caller to use the default rendering.
 *
 * Errors are intentionally handled at the registry level with `console.warn`
 * (as requested) to avoid breaking UX.
 */
export function useFieldRendererElement(ctx: {
  field: UISchemaField;
  controller: RendererContext["controller"];
  data: RendererContext["data"];
  utils: RendererContext["utils"];
}): React.ReactElement | null {
  const { field } = ctx;
  const rendererName = field.uiMetadata?.renderer?.name;
  const fieldType = field.type as FieldTypeKey;

  const [resolved, setResolved] = React.useState<Renderer | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setResolved(null);

    // If no renderer is specified for this field, silently fall back to default
    if (!rendererName) return;

    const map: Partial<Record<RendererName, RendererLoader>> | undefined = loaders[fieldType];
    if (!map) {
      console.warn(
        `[RendererRegistry] No loader map for field type "${fieldType}" (renderer "${rendererName}"). Using default.`
      );
      return;
    }
    const loader = rendererName ? map[rendererName] : undefined;
    if (!loader) {
      console.warn(
        `[RendererRegistry] Renderer "${rendererName}" not found for type "${fieldType}". Available: ${Object.keys(map).join(", ") || "<none>"}. Using default.`
      );
      return;
    }

    const cacheKey = getCacheKey(fieldType, rendererName);
    const cached = rendererCache.get(cacheKey);
    if (cached) {
      setResolved(() => cached);
      return;
    }

    loader()
      .then((fn) => {
        if (cancelled) return;
        if (!fn) {
          console.warn(
            `[RendererRegistry] Loader for renderer "${rendererName}" of type "${fieldType}" returned no default export. Falling back to default.`
          );
          setResolved(null);
          return;
        }
        rendererCache.set(cacheKey, fn);
        setResolved(() => fn);
      })
      .catch((err) => {
        // Registry-level error handling: warn and fall back to default
        console.warn(
          `[RendererRegistry] Failed loading renderer "${rendererName}" for field type "${fieldType}":`,
          err
        );
        setResolved(null);
      });

    return () => {
      cancelled = true;
    };
  }, [rendererName, fieldType, field.id]);

  if (!resolved) return null;
  try {
    return React.createElement(resolved, { ...ctx });
  } catch (err) {
    console.warn(
      `[RendererRegistry] Renderer "${rendererName}" threw during render for field type "${fieldType}":`,
      err
    );
    return null;
  }
}


