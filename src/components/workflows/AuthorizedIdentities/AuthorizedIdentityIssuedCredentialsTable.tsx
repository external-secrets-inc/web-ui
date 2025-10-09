import {
  DataProvider,
  DataTable,
  defineColumns,
} from "@/components/ui/DataProvider";
import { Trimmer } from "@/components/ui/Trimmer";
import type { IssuedCredential } from "./AuthorizedIdentities.interfaces";
import { useMemo } from "react";
import { LucideAtom, LucideServer, LucideKey } from "lucide-react";

interface AuthorizedIdentityIssuedCredentialsTableProps {
  credentials: IssuedCredential[];
}

export function AuthorizedIdentityIssuedCredentialsTable({
  credentials,
}: AuthorizedIdentityIssuedCredentialsTableProps) {
  const hasRemoteRefs = useMemo(
    () => credentials.some((cred) => cred.remoteRef),
    [credentials]
  );

  const columns = useMemo(
    () =>
      defineColumns<IssuedCredential>((columnHelper) => [
        columnHelper.display({
          id: "source",
          header: "Source",
          cell: (info) => {
            const credential = info.row.original;
            const sourceRef = credential.sourceRef;

            return (
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-1">
                  <LucideAtom className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {sourceRef?.kind ?? "N/A"}
                  </span>
                </div>
                <Trimmer lineClamp={3} className="text-sm text-foreground">
                  {sourceRef?.namespace}/{sourceRef?.name}
                </Trimmer>
              </div>
            );
          },
        }),
        columnHelper.display({
          id: "workload",
          header: "Workload Binding",
          cell: (info) => {
            const credential = info.row.original;
            const binding = credential.workloadBinding;

            return (
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-1">
                  <LucideServer className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {binding?.kind ?? "N/A"}
                  </span>
                </div>
                <Trimmer lineClamp={3} className="text-sm text-foreground">
                  {binding?.namespace}/{binding?.name}
                </Trimmer>
              </div>
            );
          },
        }),
        ...(hasRemoteRefs
          ? [
              columnHelper.display({
                id: "remoteRef",
                header: "Remote Ref",
                cell: (info) => {
                  const credential = info.row.original;
                  const remoteRef = credential.remoteRef;

                  if (!remoteRef)
                    return (
                      <span className="text-sm text-muted-foreground">—</span>
                    );

                  return (
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <LucideKey className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Key
                        </span>
                      </div>
                      <Trimmer lineClamp={3} className="text-sm text-foreground">
                        {remoteRef.remoteKey}
                        {remoteRef.property && (
                          <span className="text-muted-foreground">
                            .{remoteRef.property}
                          </span>
                        )}
                      </Trimmer>
                    </div>
                  );
                },
              }),
            ]
          : []),
        columnHelper.display({
          id: "state",
          header: "Generator State",
          cell: (info) => {
            const credential = info.row.original;
            const stateRef = credential.stateRef;

            if (!stateRef) return <span className="text-sm text-muted-foreground">—</span>;

            return (
              <Trimmer lineClamp={3} className="text-sm text-foreground">
                {stateRef?.namespace}/{stateRef?.name}
              </Trimmer>
            );
          },
        }),
        columnHelper.accessor("lastIssuedAt", {
          header: "Last Issued",
          cell: (info) => {
            const date = new Date(info.getValue());
            return (
              <div className="flex flex-col min-w-0">
                <span className="text-sm text-foreground font-mono">
                  {date.toLocaleDateString()}
                </span>
                <span className="text-sm text-foreground font-mono">
                  {date.toLocaleTimeString()}
                </span>
              </div>
            );
          },
        }),
      ]),
    [hasRemoteRefs]
  );

  return (
    <DataProvider
      data={credentials}
      columns={columns}
      initialSort={{ id: "lastIssuedAt", desc: true }}
      getRowId={(row, index) => `${row.workloadBinding?.uid ?? index}`}
      emptyMessage="No issued credentials"
    >
      <DataTable />
    </DataProvider>
  );
}
