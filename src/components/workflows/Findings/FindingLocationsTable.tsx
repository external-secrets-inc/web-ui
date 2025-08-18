import { Badge } from "@/components/ui/badge";
import { BadgeGroup } from "@/components/ui/BadgeGroup";
import {
  DataProvider,
  DataTable,
  defineColumns,
} from "@/components/ui/DataProvider";
import { type FindingLocation } from "@/components/workflows/Findings";
import { LucideBookKey, LucideBraces, LucideCopy } from "lucide-react";
import { useMemo } from "react";
import { groupLocationsByStore, type GroupedLocation } from "./Findings.utils";

interface FindingLocationsTableProps {
  locations: FindingLocation[];
}

export function FindingLocationsTable({
  locations,
}: FindingLocationsTableProps) {
    // Group locations by store name using utility function
  const groupedLocations = useMemo(() => groupLocationsByStore(locations), [locations]);

  const columns = useMemo(
    () =>
      defineColumns<GroupedLocation>((columnHelper) => [
        columnHelper.accessor("storeName", {
          header: "Store",
          cell: (info) => (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 text-sm"
            >
              <LucideBookKey className="text-muted-foreground" />
              {info.getValue()}
            </Badge>
          ),
        }),
        columnHelper.accessor("duplicateKeys", {
          header: "Duplicate Keys",
          cell: (info) => {
            const keys = info.getValue();
            const badges = keys.map((key: string, index: number) => ({
              id: `key-${index}`,
              label: key,
              icon: <LucideCopy className="text-muted-foreground" />,
              className: "text-sm",
            }));

            return (
              <BadgeGroup
                badges={badges}
                extraBadge={{
                  id: "extra",
                  className: "text-sm",
                  icon: <LucideCopy className="text-muted-foreground" />,
                }}
              />
            );
          },
        }),
        columnHelper.accessor("properties", {
          header: "Properties",
          cell: (info) => {
            const properties = info.getValue();
            if (properties.length === 0) {
              return <span className="text-muted-foreground">-</span>;
            }

            const badges = properties.map((property: string, index: number) => ({
              id: `property-${index}`,
              label: property,
              icon: <LucideBraces className="text-muted-foreground" />,
              className: "text-sm",
            }));

            return (
              <BadgeGroup
                maxCount="auto"
                badges={badges}
                extraBadge={{
                  id: "extra",
                  className: "text-sm",
                  icon: <LucideBraces className="text-muted-foreground" />,
                }}
              />
            );
          },
        }),
      ]),
    []
  );

  return (
    <DataProvider
      data={groupedLocations}
      columns={columns}
      initialSort={{ id: "storeName", desc: false }}
      getRowId={(row) => row.storeName}
    >
      <DataTable />
    </DataProvider>
  );
}
