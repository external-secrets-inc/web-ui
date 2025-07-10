import { Badge } from "@/components/ui/badge";
import {
  DataProvider,
  DataSearch,
  DataTable,
  defineColumns,
} from "@/components/ui/DataProvider";
import { type FindingsTableData } from "@/components/workflows/Findings";
import useOrgLink from "@/hooks/useOrgLink";
import useGetFindings from "@/services/findings/queries/useGetFindings";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export function FindingsDataTable() {
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();
  const columns = useMemo(
    () =>
      defineColumns<FindingsTableData>((columnHelper) => [
        columnHelper.accessor("name", {
          header: "Name",
          cell: (info) => <strong>{info.getValue()}</strong>,
        }),
        columnHelper.accessor("locations", {
          header: "Locations",
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
    if (!findingsData) return [];
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
    <div className="flex flex-col gap-4">
      <DataProvider
        data={findings}
        columns={columns}
        initialSort={{ id: "name", desc: false }}
        isLoading={isLoadingFindings}
        getRowId={(row) => `${row.namespace}/${row.name}`}
      >
        <div className="flex justify-end gap-4 items-center">
          <DataSearch />
        </div>
        <DataTable
          onRowClick={(row) => {
            const typedRow = row as FindingsTableData;
            navigate(
              getOrgLink(`/findings/${typedRow.namespace}/${typedRow.name}`)
            );
          }}
        />
      </DataProvider>
    </div>
  );
}
