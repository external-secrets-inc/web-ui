import { useQueries, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { FederationData, GenericFederation } from "@/components/workflows/Federations/Federations.interfaces";
import { getFederations } from "./useGetFederations";

const KNOWN_KEYS = new Set(["name", "namespace", "manifest"]);

export function toFederationData(
  item: GenericFederation,
  kind: string
): FederationData {
  const { name, namespace, manifest } = item;

  const detailsEntries = Object.entries(item)
    .filter(([k]) => !KNOWN_KEYS.has(k))
    .map<[string, string]>(([k, v]) => [k, v]);

  const details = detailsEntries.length ? Object.fromEntries(detailsEntries) : undefined;

  return { name, namespace, manifest, kind, details };
}

type FederationsResult = {
  data: FederationData[] | undefined;
  isLoading: boolean;
  isError: boolean;
  isRefetchError: boolean;
  errors: Array<AxiosError<ApiHttpError> | null>;
  refetchAll: () => void;
};

export function useGetFederationsFromList(
  federationTypes: string[],
  options?: Omit<
    UseQueryOptions<GenericFederation[], AxiosError<ApiHttpError>>,
    "queryKey" | "queryFn"
  >
): FederationsResult {
  const queries = useQueries({
    queries: federationTypes.map((type) => ({
      queryKey: ["federations", type],
      queryFn: ({ signal }) => getFederations(type, signal),
      enabled: Boolean(type),
      ...options,
    })),
  }) as UseQueryResult<GenericFederation[], AxiosError<ApiHttpError>>[];

  const isLoading = queries.some(q => q.isLoading);
  const isError = queries.some(q => q.isError);
  const isRefetchError = queries.some((q) => q.isRefetchError);
  const errors = queries.map(q => (q.isError ? q.error ?? null : null));

  const data = queries
    .map((q, idx) => {
      const kind = federationTypes[idx];
      return (q.data ?? []).map(item => toFederationData(item, kind));
    })
    .flat();

  const refetchAll = () => {
    queries.forEach(q => q.refetch());
  };

  return { data, isLoading, isError, isRefetchError, errors, refetchAll };
}
