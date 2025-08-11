import { DataGrid, useData } from "@/components/ui/DataProvider";
import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  LucideServer
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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

function kindIcon(kind: string) {
  switch (kind) {
    case "SecretStore":
      return <LucideBookKey className="text-muted-foreground" />;
    case "VirtualMachine":
      return <LucideServer className="text-muted-foreground" />;
    default:
      return null;
  }
}

export function FindingsDataGrid() {
  const { table, isLoading, emptyMessage } = useData<Finding>();
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();

  return (
    <DataGrid
      renderItem={(item: unknown) => {
        const finding = item as Finding;
        const locations = finding.locations ?? [];

        const dominantKey = getDominantKey(finding) ?? finding.name;
        const titleDisplay = truncateMiddle(dominantKey);

        const storeNames = [...new Set(locations.map((l) => l.name ?? "").filter(Boolean))];
        const kinds = [...new Set(locations.map((l) => l.kind ?? "").filter(Boolean))];
        const propertyCount = locations.reduce((total, l) => {
          const prop = normalizeProperty(l.remoteRef?.property);
          return total + (prop ? 1 : 0);
        }, 0);

        const handleOpen = () => {
          navigate(
            getOrgLink(
              `/findings/reused-secrets/${finding.namespace}/${finding.name}`
            )
          );
        };

        return (
          <Card
            key={`${finding.namespace}/${finding.name}`}
            className="group flex flex-col relative hover:border-muted-foreground/50 hover:bg-muted/15 transition-all cursor-pointer overflow-clip"
            onClick={handleOpen}
          >
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
                duplicates found {storeNames.length === 1 ? "on" : "across"}
              </span>
              <div className="flex flex-wrap gap-1">
                {storeNames.slice(0, 3).map((store: string) => (
                  <Badge
                    key={store}
                    variant="secondary"
                    className="flex items-center gap-1.5 text-sm"
                  >
                    {kinds.length === 1 && kindIcon(kinds[0])}
                    <span>{store}</span>
                  </Badge>
                ))}
                {storeNames.length > 3 && (
                  <Badge
                    variant="outline"
                    className="font-mono inline-flex items-center gap-1.5 text-sm"
                  >
                    <LucideBookKey className="size-4 text-muted-foreground" /> +
                    {storeNames.length - 3}
                  </Badge>
                )}
              </div>
            </CardFooter>
          </Card>
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
