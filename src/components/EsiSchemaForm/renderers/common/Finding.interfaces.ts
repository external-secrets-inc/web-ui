/**
 * Metadata for finding renderer items used in select fields.
 * Contains display information and counts for findings.
 */
export interface FindingRendererItem {
  /** K8s name of the finding */
  name?: string;
  /** K8s namespace of the finding */
  namespace?: string;
  /** Display name for the finding */
  displayName?: string;
  /** Property name associated with the finding */
  property?: string;
  /** Unique identifier for the finding */
  id?: string;
  /** Number of locations where this finding appears */
  locationsCount?: number;
  /** Number of stores where this finding appears */
  storesCount?: number;
}
