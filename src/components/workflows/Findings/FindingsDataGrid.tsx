import { Badge } from "@/components/ui/badge";
import { BadgeGroup } from "@/components/ui/BadgeGroup";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DataGrid, useData } from "@/components/ui/DataProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useOrgLink from "@/hooks/useOrgLink";
import {
  LucideAsteriskSquare,
  LucideBookKey,
  LucideBraces,
  LucideRadar,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Finding } from "./Findings.interfaces";

function getDominantKey(finding: Finding): string | undefined {
  const counts = new Map<string, number>();
  for (const loc of finding.locations ?? []) {
    const k = loc?.remoteRef?.key;
    if (!k) continue;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  let bestKey: string | undefined;
  let bestCount = 0;
  counts.forEach((count, key) => {
    if (count > bestCount) {
      bestKey = key;
      bestCount = count;
    }
  });
  return bestKey;
}

function normalizeProperty(raw?: string): string | null {
  if (!raw) return null;
  const v = String(raw).trim();
  if (v === "" || v === "-") return null;
  return v;
}

function truncateMiddle(value: string, max = 48): string {
  if (value.length <= max) return value;
  const head = Math.ceil((max - 1) / 2);
  const tail = Math.floor((max - 1) / 2);
  return value.slice(0, head) + "…" + value.slice(-tail);
}

export function FindingsDataGrid() {
  const { table, isLoading, emptyMessage } = useData<Finding>();
  const getOrgLink = useOrgLink();

  return (
    <DataGrid
      renderItem={(item: unknown) => {
        const finding = item as Finding;
        const locations = finding.locations ?? [];

        const dominantKey = getDominantKey(finding) ?? finding.name;
        const titleDisplay = truncateMiddle(dominantKey);

        const storeNames = [
          ...new Set(locations.map((l) => l.name ?? "").filter(Boolean)),
        ];
        const propertyCount = locations.reduce((total, l) => {
          const prop = normalizeProperty(l.remoteRef?.property);
          return total + (prop ? 1 : 0);
        }, 0);

        return (
          <Link
            key={`${finding.namespace}/${finding.name}`}
            to={getOrgLink(
              `/findings/reused-secrets/${finding.namespace}/${finding.name}`
            )}
            className="grid min-w-0"
          >
            <Card className="group flex flex-col min-w-0 relative hover:border-muted-foreground/50 hover:bg-muted/15 transition-all cursor-pointer overflow-clip">
              <LucideRadar className="size-44 ml-auto text-base-100 dark:text-base-900 absolute -bottom-8 -right-8 stroke-scaling opacity-30 -scale-x-100" />
              <CardHeader className="text-left relative">
                <CardTitle className="flex items-center gap-2">
                  <LucideAsteriskSquare className="size-6 text-muted-foreground" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="truncate mr-auto">{titleDisplay}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Main secret key: {dominantKey}
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex items-center gap-1.5">
                    {propertyCount > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="outline"
                            className="inline-flex items-center gap-1.5 font-mono text-sm"
                          >
                            <LucideBraces className="size-4 text-muted-foreground" />
                            {propertyCount}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          {propertyCount}{" "}
                          {propertyCount === 1 ? "duplicate" : "duplicates"}{" "}
                          with a property selector
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>

              <CardFooter className="mt-auto gap-2 flex-col items-start relative">
                <span className="text-base text-muted-foreground pl-0.5">
                  <span className="font-bold text-primary-muted text-4xl mr-0.5 font-mono">
                    {locations.length}
                  </span>{" "}
                  duplicates found {storeNames.length === 1 ? "on" : "across"}{" "}
                  <span className="font-bold text-foreground">
                    {storeNames.length}
                  </span>{" "}
                  {storeNames.length === 1 ? "location" : "locations"}
                </span>
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
              </CardFooter>
            </Card>
          </Link>
        );
      }}
    >
      {!isLoading && table.getRowModel().rows.length === 0 && (
        <div className="col-span-full flex items-center justify-center rounded-lg border p-8 text-muted-foreground">
          {emptyMessage}
        </div>
      )}
    </DataGrid>
  );
}
