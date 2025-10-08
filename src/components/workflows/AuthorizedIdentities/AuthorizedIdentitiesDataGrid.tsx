import { BadgeGroup } from "@/components/ui/BadgeGroup";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DataGrid, useData } from "@/components/ui/DataProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useOrgLink from "@/hooks/useOrgLink";
import { LucideIdCard, LucideKey, LucideNetwork, LucideShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import type { AuthorizedIdentity } from "./AuthorizedIdentities.interfaces";
import {
  getCredentialsCount,
  getFederationName,
  getFederationType,
  getUniqueSourceKinds,
} from "./AuthorizedIdentities.utils";

export function AuthorizedIdentitiesDataGrid() {
  const { table, isLoading, emptyMessage } = useData<AuthorizedIdentity>();
  const getOrgLink = useOrgLink();

  return (
    <DataGrid
      renderItem={(item: unknown) => {
        const identity = item as AuthorizedIdentity;
        const credentialsCount = getCredentialsCount(identity);
        const federationType = getFederationType(identity);
        const federationName = getFederationName(identity);
        const sourceKinds = getUniqueSourceKinds(identity);

        return (
          <Link
            key={identity.name}
            to={getOrgLink(
              `/federation/authorized-identities/${identity.name}`
            )}
            className="grid min-w-0"
          >
            <Card className="group flex flex-col min-w-0 relative hover:border-muted-foreground/50 hover:bg-muted/15 transition-all cursor-pointer overflow-clip">
              <LucideShieldCheck className="size-44 ml-auto text-base-200 dark:text-base-800 absolute -bottom-5 -right-5 stroke-scaling opacity-30" />
              <CardHeader className="text-left relative">
                <CardTitle className="flex items-center gap-2">
                  <LucideIdCard className="size-6 text-muted-foreground" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="mr-auto flex flex-wrap min-w-0 max-h-[1em]">
                        <span className="truncate flex-initial min-w-0">
                          {identity.name}
                        </span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex flex-col gap-1.5">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <LucideIdCard className="size-4 text-muted-foreground" />
                          <span className="font-medium">
                            Identity:{" "}
                            <span className="font-medium text-foreground">
                              {identity.name}
                            </span>
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <LucideNetwork className="size-4 text-muted-foreground" />
                          <span className="font-medium">
                            Federation:{" "}
                            <span className="font-medium text-foreground">
                              {federationType} / {federationName}
                            </span>
                          </span>
                        </span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>

              <CardFooter className="mt-auto gap-2 flex-col items-start relative">
                <span className="text-base text-muted-foreground pl-0.5">
                  <span className="font-bold text-primary-muted text-4xl mr-0.5 font-mono">
                    {credentialsCount}
                  </span>{" "}
                  {credentialsCount === 0 
                    ? "credentials issued" 
                    : credentialsCount === 1 
                      ? "credential issued" 
                      : "credentials issued"
                  }{" "}
                  {credentialsCount > 0 && sourceKinds.length === 1 ? "from" : credentialsCount > 0 ? "across" : ""}
                </span>
                <BadgeGroup
                  maxCount="auto"
                  badges={sourceKinds.map((kind: string) => ({
                    id: kind,
                    label: kind,
                    icon: <LucideKey className="size-3.5" />,
                  }))}
                  extraBadge={{
                    id: "extra",
                    icon: <LucideKey className="size-3.5" />,
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
