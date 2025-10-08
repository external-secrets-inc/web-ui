import { Badge } from "@/components/ui/badge";
import { BadgeGroup, BadgeItem } from "@/components/ui/BadgeGroup";
import { DataProvider, defineColumns } from "@/components/ui/DataProvider";
import { FilterFn } from "@tanstack/react-table";
import {
  LucideAsteriskSquare,
  LucideCrosshair
} from "lucide-react";
import { useMemo } from "react";
import { FindingLocation } from "../Findings";
import {
  Consumer,
  ConsumersTableData,
  targetColumnName,
  TargetReference,
} from "./Consumers.interfaces";
import { ConsumerDataTable } from "./ConsumersDataTable";
import { ConsumerStatusBadge } from "./ConsumerStatusBadge";
import { Trimmer } from "@/components/ui/Trimmer";

const targetRefMatch: FilterFn<ConsumersTableData> = (
  row,
  columnId,
  filterValue
) => {
  const ref = row.getValue(columnId) as TargetReference | undefined;
  if (!ref) return false;

  // filterValue can be any shape you choose; we'll pass an object
  const fv = (filterValue ?? {}) as Partial<TargetReference>;
  const wantName = fv.name?.trim();
  const wantNs = fv.namespace?.trim();

  if (!wantName && !wantNs) return true; // nothing to filter by
  if (wantName && ref.name !== wantName) return false;
  if (wantNs && ref.namespace !== wantNs) return false;

  return true;
};


interface ConsumerDataListProps {
  consumers: Consumer[];
  title?: string;
}

export function ConsumerDataList({ consumers, title }: ConsumerDataListProps) {
  const columns = useMemo(
    () =>
      defineColumns<ConsumersTableData>((columnHelper) => [
        columnHelper.accessor("displayName", {
          header: "Name",
          cell: (info) => <strong>{info.getValue()}</strong>,
        }),
        columnHelper.accessor(targetColumnName, {
          header: "Target",
          filterFn: targetRefMatch,
          cell: (info) => {
            const ref = info.getValue() as TargetReference;
            return (
              <Badge variant="secondary" className="inline-flex gap-1.5 text-sm px-2">
                <LucideCrosshair className="text-muted-foreground" />
                <Trimmer>{ref.name}</Trimmer>
              </Badge>
            );
          },
        }),
        columnHelper.accessor("locations", {
          header: "Used secrets",
          cell: (info) => {
            const locations = info.getValue();

            const locationNames: BadgeItem[] = locations.map(
              (loc: FindingLocation) => ({
                id: `key-${loc.remoteRef.key}.${loc.remoteRef.property}`,
                label: `${loc.remoteRef.key}.${loc.remoteRef.property}`,
                icon: (
                  <LucideAsteriskSquare className="text-muted-foreground" />
                ),
                className: "text-sm",
              })
            );

            return (
              <BadgeGroup
                maxCount="auto"
                badges={locationNames}
                extraBadge={{
                  id: "extra",
                  className: "text-sm",
                  icon: (
                    <LucideAsteriskSquare className="text-muted-foreground" />
                  ),
                }}
              />
            );
          },
        }),
        columnHelper.accessor("status", {
          header: "Status",
          cell: (info) => {
            const statusData = info.row.original.status;
            return <ConsumerStatusBadge statusData={statusData} />;
          },
        }),
      ]),
    []
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
        <ConsumerDataTable title={title} />
      </DataProvider>
    </div>
  );
}
