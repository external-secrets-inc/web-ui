import { useEffect, useMemo } from "react";
import {
  DataProvider,
  DataSearch,
  DataTable,
  defineColumns,
  useData,
} from "@/components/ui/DataProvider";
import { Consumer, ConsumersTableData, TargetReference } from "./Consumers.interfaces";
import { SetURLSearchParams, useSearchParams } from "react-router-dom";
import { ConsumerStatusBadge } from "./ConsumerStatusBadge";
import { FindingLocation } from "../Findings";
import { Button } from "@/components/ui/button";
import { FilterFn } from "@tanstack/react-table";
import { TargetFilterChip } from "./TargetFilterChip";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const targetRefMatch: FilterFn<ConsumersTableData> = (row, columnId, filterValue) =>{
  const ref = row.getValue(columnId) as TargetReference | undefined;
  if (!ref) return false;

  // filterValue can be any shape you choose; we'll pass an object
  const fv = (filterValue ?? {}) as Partial<TargetReference>;
  const wantName = fv.name?.trim();
  const wantNs = fv.namespace?.trim();

  if (!wantName && !wantNs) return true;           // nothing to filter by
  if (wantName && ref.name !== wantName) return false;
  if (wantNs && ref.namespace !== wantNs) return false;

  return true;
};

function ApplyTargetFilterFromURL() {
  const [params] = useSearchParams();
  const { table } = useData<ConsumersTableData>();

  useEffect(() => {
    const name = params.get("targetName") || undefined;
    const namespace = params.get("targetNamespace") || undefined;

    const hasFilter = Boolean(name || namespace);
    const col = table.getColumn("targetReference");
    if (!col) return;

    col.setFilterValue(hasFilter ? { name, namespace } : undefined);
  }, [params, table]);

  return null;
}

const applyTargetFilter = (setSearchParams: SetURLSearchParams, ref: TargetReference) => {
  // 2) sync URL (no navigation)
  setSearchParams(
    (prev) => {
      prev.set("targetName", ref.name);
      prev.set("targetNamespace", ref.namespace);
      return prev;
    },
    { replace: true }
  );
};

interface ConsumerDataTableProps {
  consumers: Consumer[];
  title?: string,
}

export function ConsumerDataTable({ consumers, title } : ConsumerDataTableProps) {
  const [ , setSearchParams] = useSearchParams();

  const columns = useMemo(
    () =>
      defineColumns<ConsumersTableData>((columnHelper) => [
        columnHelper.accessor("displayName", {
          header: "Name",
          cell: (info) => <strong>{info.getValue()}</strong>,
        }),
        columnHelper.accessor("targetReference", {
          header: "Target",
          filterFn: targetRefMatch,
          cell: (info) => {
            const ref = info.getValue() as TargetReference;
            return (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <Button
                      onClick={() => { applyTargetFilter(setSearchParams, ref) }}
                      variant='link'
                    >
                      {ref.name}
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="p-4">
                  <span className="whitespace-pre-line">{`Filter by target ${ref.namespace}/${ref.name}`}</span>
                </TooltipContent>
              </Tooltip >
            );
          },
        }),
        columnHelper.accessor("locations", {
          header: "Used secrets",
          cell: (info) => {
            const locations = info.getValue();
            const locationNames = locations.map(
              (loc: FindingLocation) => {
                if(loc.remoteRef.property) {
                  return `${loc.remoteRef.key}.${loc.remoteRef.property}`
                }
                return loc.remoteRef.key
              }
            ).join(", ");
            return locationNames
          },
        }),
        columnHelper.accessor("status", {
          header: "Status",
          cell: (info) => {
            const statusData = info.row.original.status;
            return <ConsumerStatusBadge statusData={statusData} />
          },
        }),
      ]),
    [setSearchParams]
  );

  return (
    <div className="flex flex-col gap-4">
      <DataProvider
        data={consumers}
        columns={columns}
        initialSort={{ id: "displayName", desc: false }}
        getRowId={(row) => `${row.namespace}/${row.name}`}
        emptyMessage={"No consumers found"}
      >
        <ApplyTargetFilterFromURL />
        <div className="flex items-center justify-between">
          <div>
            {title && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
          </div>
          <div className="flex justify-end gap-4 items-center">
            <TargetFilterChip />
            <DataSearch />
          </div>
        </div>
        <DataTable />
      </DataProvider>
    </div>
  );
}
