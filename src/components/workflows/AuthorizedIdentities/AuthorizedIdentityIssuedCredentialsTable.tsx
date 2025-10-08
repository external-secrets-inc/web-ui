import {
  DataProvider,
  DataTable,
  defineColumns,
} from "@/components/ui/DataProvider";
import { Trimmer } from "@/components/ui/Trimmer";
import type { IssuedCredential } from "./AuthorizedIdentities.interfaces";
import { useMemo } from "react";
import { LucideAtom, LucideDatabase, LucideServer } from "lucide-react";

interface AuthorizedIdentityIssuedCredentialsTableProps {
  credentials: IssuedCredential[];
}

export function AuthorizedIdentityIssuedCredentialsTable({
  credentials,
}: AuthorizedIdentityIssuedCredentialsTableProps) {
  const columns = useMemo(
    () =>
      defineColumns<IssuedCredential>((columnHelper) => [
        columnHelper.accessor(
          (row) =>
            `${row.sourceRef?.kind ?? "N/A"}|${row.sourceRef?.namespace ?? ""}/${row.sourceRef?.name ?? ""}`,
          {
          id: "source",
          header: "Source",
          sortingFn: "alphanumeric",
          cell: (info) => {
            const credential = info.row.original;
            const sourceRef = credential.sourceRef;

            return (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <LucideAtom className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Trimmer className="text-sm font-medium">
                    {sourceRef?.kind ?? "N/A"}
                  </Trimmer>
                </div>
                <Trimmer className="text-xs text-muted-foreground">
                  {sourceRef?.namespace}/{sourceRef?.name}
                </Trimmer>
              </div>
            );
          },
        }),
        columnHelper.accessor(
          (row) =>
            `${row.stateRef?.kind ?? "N/A"}|${row.stateRef?.namespace ?? ""}/${row.stateRef?.name ?? ""}`,
          {
          id: "state",
          header: "State",
          sortingFn: "alphanumeric",
          cell: (info) => {
            const credential = info.row.original;
            const stateRef = credential.stateRef;

            return (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <LucideDatabase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Trimmer className="text-sm font-medium">
                    {stateRef?.kind ?? "N/A"}
                  </Trimmer>
                </div>
                <Trimmer className="text-xs text-muted-foreground">
                  {stateRef?.namespace}/{stateRef?.name}
                </Trimmer>
              </div>
            );
          },
        }),
        columnHelper.accessor(
          (row) =>
            `${row.workloadBinding?.kind ?? "N/A"}|${row.workloadBinding?.namespace ?? ""}/${row.workloadBinding?.name ?? ""}`,
          {
          id: "workload",
          header: "Workload Binding",
          sortingFn: "alphanumeric",
          cell: (info) => {
            const credential = info.row.original;
            const binding = credential.workloadBinding;

            return (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <LucideServer className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Trimmer className="text-sm font-medium">
                    {binding?.kind ?? "N/A"}
                  </Trimmer>
                </div>
                <Trimmer className="text-xs text-muted-foreground">
                  {binding?.namespace}/{binding?.name}
                </Trimmer>
              </div>
            );
          },
        }),
        columnHelper.accessor("lastIssuedAt", {
          header: "Last Issued",
          sortingFn: "datetime",
          cell: (info) => {
            const date = new Date(info.getValue());
            return (
              <span className="text-sm font-mono">{date.toLocaleString()}</span>
            );
          },
        }),
      ]),
    []
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
