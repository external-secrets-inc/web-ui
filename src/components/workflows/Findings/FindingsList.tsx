import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { LucideLayoutGrid, LucideTableProperties } from "lucide-react";

export function FindingsList() {
  const [view, setView] = useState<"grid" | "table">("grid");

  const columns = useMemo(
    () =>
      defineColumns<FindingsTableData>((columnHelper) => [
        columnHelper.accessor("name", {
          header: "Name",
          cell: (info) => <strong>{info.getValue()}</strong>,
        }),
        columnHelper.accessor("locations", {
          header: "duplicates",
          cell: (info) => (
            <Badge variant="secondary">{info.getValue()?.length || 0}</Badge>
          ),
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
            onValueChange={(value) => value && setView(value as "grid" | "table")}
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
          <FindingsDataGrid />
        ) : (
          <FindingsDataTable />
        )}
      </div>
    </DataProvider>
  );
}
