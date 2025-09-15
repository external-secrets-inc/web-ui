import { useMemo } from "react";
import {
  DataProvider,
  defineColumns,
} from "@/components/ui/DataProvider";
import { Consumer, ConsumersTableData, TargetReference } from "./Consumers.interfaces";
import { SetURLSearchParams, useSearchParams } from "react-router-dom";
import { ConsumerStatusBadge } from "./ConsumerStatusBadge";
import { FindingLocation } from "../Findings";
import { Button } from "@/components/ui/button";
import { FilterFn } from "@tanstack/react-table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ConsumerDataTable } from "./ConsumersDataTable";

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

interface ConsumerDataListProps {
  consumers: Consumer[];
  title?: string,
}

export function ConsumerDataList({ consumers, title } : ConsumerDataListProps) {
  const [ , setSearchParams] = useSearchParams();

  const columns = useMemo(
    () =>
      defineColumns<ConsumersTableData>((columnHelper) => [
        columnHelper.accessor("displayName", {
          header: "Name",
          cell: (info) => <strong>{info.getValue()}</strong>,
        }),
        columnHelper.accessor("targetRef", {
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
                <TooltipContent>
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
        <ConsumerDataTable title={title}/>
      </DataProvider>
    </div>
  );
}
