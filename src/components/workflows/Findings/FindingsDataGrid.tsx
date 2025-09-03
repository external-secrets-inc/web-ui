import { BadgeGroup } from "@/components/ui/BadgeGroup";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DataGrid, useData } from "@/components/ui/DataProvider";
import { FindingFingerprintBadge } from "@/components/workflows/Findings/FindingFingerprintBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useOrgLink from "@/hooks/useOrgLink";
import {
  LucideAsteriskSquare,
  LucideAtSign,
  LucideBraces,
  LucideLocateFixed,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Finding } from "./Findings.interfaces";
import {
  getDominantKey,
  getPropertyForDominantKey,
  getStoreNames,
} from "./Findings.utils";

export function FindingsDataGrid() {
  const { table, isLoading, emptyMessage } = useData<Finding>();
  const getOrgLink = useOrgLink();

  return (
    <DataGrid
      renderItem={(item: unknown) => {
        const finding = item as Finding;
        const locations = finding.locations ?? [];

        const dominantKey = getDominantKey(finding) ?? finding.name;

        const storeNames = getStoreNames(locations);
        const dominantProperty = getPropertyForDominantKey(
          finding,
          dominantKey
        );

        return (
          <Link
            key={`${finding.namespace}/${finding.name}`}
            to={getOrgLink(
              `/findings/reused-secrets/${finding.namespace}/${finding.name}`
            )}
            state={{ dominantKey }}
            className="grid min-w-0"
          >
            <Card className="group flex flex-col min-w-0 relative hover:border-muted-foreground/50 hover:bg-muted/15 transition-all cursor-pointer overflow-clip">
              <LucideLocateFixed className="size-44 ml-auto text-base-200 dark:text-base-800 absolute -bottom-5 -right-5 stroke-scaling opacity-30" />
              <CardHeader className="text-left relative">
                <CardTitle className="flex items-center gap-2">
                  <LucideAsteriskSquare className="size-6 text-muted-foreground" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="mr-auto flex flex-wrap min-w-0 max-h-[1em]">
                        <span className="truncate flex-initial min-w-0">{dominantKey}</span>
                        {dominantProperty && (
                          <span className="leading-none font-bold text-muted-foreground truncate flex-initial min-w-0">
                            .{dominantProperty}
                          </span>
                        )}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex flex-col gap-1.5">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <LucideAsteriskSquare className="size-4 text-muted-foreground" />
                          <span className="font-medium">
                            Main secret key:{" "}
                            <span className="font-medium text-foreground">
                              {dominantKey}
                            </span>
                          </span>
                        </span>
                        {dominantProperty && (
                          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                            <LucideBraces className="size-4 text-muted-foreground" />
                            <span className="font-medium">
                              Property:{" "}
                              <span className="font-medium text-foreground">
                                {dominantProperty}
                              </span>
                            </span>
                          </span>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <div className="ml-auto inline-flex items-center">
                    <FindingFingerprintBadge seed={finding.id} />
                  </div>
                </CardTitle>
              </CardHeader>

              <CardFooter className="mt-auto gap-2 flex-col items-start relative">
                <span className="text-base text-muted-foreground pl-0.5">
                  <span className="font-bold text-primary-muted text-4xl mr-0.5 font-mono">
                    {locations.length}
                  </span>{" "}
                  duplicates found {storeNames.length === 1 ? "on" : "across"}{" "}
                </span>
                <BadgeGroup
                  maxCount="auto"
                  badges={storeNames.map((store: string) => ({
                    id: store,
                    label: store,
                    icon: <LucideAtSign className="text-muted-foreground" />,
                    className: "text-sm",
                  }))}
                  extraBadge={{
                    id: "extra",
                    className: "text-sm",
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
