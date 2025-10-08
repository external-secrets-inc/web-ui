import { Badge } from "@/components/ui/badge";
import { BadgeGroup } from "@/components/ui/BadgeGroup";
import {
  DataProvider,
  DataSearch,
  DataSort,
  defineColumns,
} from "@/components/ui/DataProvider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Trimmer } from "@/components/ui/Trimmer";
import type { AuthorizedIdentity } from "@/components/workflows/AuthorizedIdentities/AuthorizedIdentities.interfaces";
import useGetAuthorizedIdentities from "@/services/authorizedidentities/queries/useGetAuthorizedIdentities";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import type { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import {
  LucideIdCard,
  LucideKey,
  LucideLayoutGrid,
  LucideNetwork,
  LucideTableProperties,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  getCredentialsCount,
  getFederationType,
  getSubjectDisplay,
  getUniqueSourceKinds,
} from "./AuthorizedIdentities.utils";
import { AuthorizedIdentitiesDataGrid } from "./AuthorizedIdentitiesDataGrid";
import { AuthorizedIdentitiesDataTable } from "./AuthorizedIdentitiesDataTable";

export function AuthorizedIdentitiesList() {
  const [view, setView] = useState<"grid" | "table">("grid");

  const columns = useMemo(
    () =>
      defineColumns<AuthorizedIdentity>((columnHelper) => [
        columnHelper.accessor("name", {
          header: "Name",
          cell: (info) => {
            const identity = info.row.original as AuthorizedIdentity;

            return (
              <div className="flex items-center gap-2 min-w-0">
                <LucideIdCard className="text-muted-foreground" />
                <Trimmer className="font-bold">{identity.name}</Trimmer>
              </div>
            );
          },
        }),
        columnHelper.accessor((row) => getFederationType(row), {
          id: "federationType",
          header: "Federation",
          sortingFn: "alphanumeric",
          cell: (info) => {
            const identity = info.row.original;
            const federationType = getFederationType(identity);

            return (
              <Badge variant="secondary" className="gap-1.5">
                <LucideNetwork className="size-3.5" />
                {federationType}
              </Badge>
            );
          },
        }),
        columnHelper.accessor((row) => getSubjectDisplay(row), {
          id: "subject",
          header: "Subject",
          sortingFn: "alphanumeric",
          cell: (info) => {
            const identity = info.row.original;
            const subjectDisplay = getSubjectDisplay(identity);

            return (
              <Badge variant="secondary" className="font-mono max-w-full">
                <Trimmer>{subjectDisplay}</Trimmer>
              </Badge>
            );
          },
        }),
        columnHelper.accessor((row) => getUniqueSourceKinds(row).join(", "), {
          id: "sourceKinds",
          header: "Credential Types",
          sortingFn: "alphanumeric",
          cell: (info) => {
            const identity = info.row.original;
            const sourceKinds = getUniqueSourceKinds(identity);

            if (sourceKinds.length === 0) return null;

            return (
              <BadgeGroup
                maxCount="auto"
                badges={sourceKinds.map((kind) => ({
                  id: kind,
                  label: kind,
                  icon: <LucideKey className="size-3.5" />,
                }))}
                extraBadge={{
                  id: "extra",
                  icon: <LucideKey className="size-3.5" />,
                }}
              />
            );
          },
        }),
        columnHelper.accessor((row) => getCredentialsCount(row), {
          id: "credentialsCount",
          header: "Count",
          maxSize: 64,
          sortingFn: "basic",
          cell: (info) => {
            const identity = info.row.original as AuthorizedIdentity;
            const count = getCredentialsCount(identity);
            return (
              <Badge variant="outline" className="font-mono">
                {count}
              </Badge>
            );
          },
        }),
      ]),
    []
  );

  const {
    data: identitiesData,
    isLoading: isLoadingIdentities,
    isError: isErrorIdentities,
    isRefetchError: isRefetchErrorIdentities,
    error: identitiesError,
  } = useGetAuthorizedIdentities();

  const identities = useMemo(() => {
    if (!identitiesData) return [] as AuthorizedIdentity[];
    return identitiesData;
  }, [identitiesData]);

  if (isErrorIdentities || isRefetchErrorIdentities) {
    if (identitiesError instanceof AxiosError) {
      handleDefaultApiHttpError(
        identitiesError as AxiosError<ApiHttpError>,
        "Error while fetching Authorized Identities data"
      );
    }
  }

  return (
    <DataProvider
      data={identities}
      columns={columns}
      initialSort={{ id: "name", desc: false }}
      isLoading={isLoadingIdentities}
      getRowId={(row) => row.name}
      emptyMessage="No authorized identities"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-x-4 gap-y-2 flex-wrap">
          <ToggleGroup
            variant="outline"
            type="single"
            value={view}
            onValueChange={(value) =>
              value && setView(value as "grid" | "table")
            }
          >
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LucideLayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table view">
              <LucideTableProperties className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="flex items-center gap-x-4">
            <DataSearch />
            <DataSort />
          </div>
        </div>

        {view === "grid" ? (
          <AuthorizedIdentitiesDataGrid />
        ) : (
          <AuthorizedIdentitiesDataTable />
        )}
      </div>
    </DataProvider>
  );
}

