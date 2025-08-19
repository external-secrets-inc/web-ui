import { useMemo, useState } from "react";
import { BadgeGroup, BadgeItem } from "@/components/ui/BadgeGroup";
import {
  DataProvider,
  DataSearch,
  DataSort,
  defineColumns,
} from "@/components/ui/DataProvider";
import useGetFindings from "@/services/findings/queries/useGetFindings";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import type { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import type {
  FindingsTableData,
  Finding,
} from "@/components/workflows/Findings";
import { FindingsDataGrid } from "./FindingsDataGrid";
import { FindingsDataTable } from "./FindingsDataTable";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  LucideLayoutGrid,
  LucideTableProperties,
  LucideAsteriskSquare,
  LucideBookKey,
  LucideCopy,
} from "lucide-react";
import {
  getDominantKey,
  getStoreNames,
  getDuplicateKeys,
} from "./Findings.utils";
import { Trimmer } from "@/components/ui/Trimmer";

export function FindingsList() {
  const [view, setView] = useState<"grid" | "table">("grid");

  const columns = useMemo(
    () =>
      defineColumns<FindingsTableData>((columnHelper) => [
        columnHelper.accessor("name", {
          header: "Name",
          cell: (info) => {
            const finding = info.row.original;
            const dominantKey = getDominantKey(finding) ?? finding.name;

            return (
              <div className="flex items-center gap-2 min-w-0">
                <LucideAsteriskSquare className="text-muted-foreground" />
                <Trimmer className="font-bold">{dominantKey}</Trimmer>
              </div>
            );
          },
        }),
        columnHelper.display({
          id: "duplicates",
          header: "Duplicates",
          cell: (info) => {
            const finding = info.row.original;
            const locations = finding.locations ?? [];
            const dominantKey = getDominantKey(finding);
            const duplicateKeys = getDuplicateKeys(locations, dominantKey);

            if (duplicateKeys.length === 0) return null;

            const duplicateItems: BadgeItem[] = duplicateKeys.map((key, index) => ({
              id: `key-${index}`,
              label: key,
              icon: <LucideCopy className="text-muted-foreground" />,
              className: "text-sm",
            }));

            return (
              <BadgeGroup
                maxCount="auto"
                badges={duplicateItems}
                extraBadge={{
                  id: "extra",
                  className: "text-sm",
                  icon: <LucideCopy className="text-muted-foreground" />,
                }}
              />
            );
          },
        }),
        columnHelper.display({
          id: "stores",
          header: "Stores",
          cell: (info) => {
            const finding = info.row.original;
            const locations = finding.locations ?? [];
            const storeNames = getStoreNames(locations);

            return (
              <BadgeGroup
                maxCount="auto"
                badges={storeNames.map((store: string) => ({
                  id: store,
                  label: store,
                  icon: <LucideBookKey className="text-muted-foreground" />,
                  className: "text-sm",
                }))}
                extraBadge={{
                  id: "extra",
                  className: "text-sm",
                  icon: <LucideBookKey className="text-muted-foreground" />,
                }}
              />
            );
          },
        }),
      ]),
    []
  );

  const {
    data: findingsData,
    isLoading: isLoadingFindings,
    isError: isErrorFindings,
    isRefetchError: isRefetchErrorFindings,
    error: findingsError,
  } = useGetFindings();

  const findings = useMemo(() => {
    if (!findingsData) return [] as Finding[];
    return findingsData;
  }, [findingsData]);

  if (isErrorFindings || isRefetchErrorFindings) {
    if (findingsError instanceof AxiosError) {
      handleDefaultApiHttpError(
        findingsError as AxiosError<ApiHttpError>,
        "Error while fetching Findings data"
      );
    }
  }

  return (
    <DataProvider
      data={findings}
      columns={columns}
      initialSort={{ id: "name", desc: false }}
      isLoading={isLoadingFindings}
      getRowId={(row) => `${row.namespace}/${row.name}`}
      emptyMessage="No findings "
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

        {view === "grid" ? <FindingsDataGrid /> : <FindingsDataTable />}
      </div>
    </DataProvider>
  );
}
