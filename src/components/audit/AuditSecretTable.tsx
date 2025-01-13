import { useState, useMemo, useEffect } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { LucideAlertCircle, LucideCircle, LucideDownload, LucideFilter, LucideSearch } from "lucide-react";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { DataProvider, DataTable } from "@/components/ui/DataProvider";
import { ONE_SECOND_IN_MILLISECONDS } from "@/constants";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import useGetDashboarSecretTable from "@/services/audit/queries/useGetDashboarSecretTable";
import { AuditTableData, SecretDetails } from "./Audit.interfaces";
import FilterDialogForm from "./FilterDialogForm";
import AuditSecretDetailsDialog from "./AuditSecretDetailsDialog";
import { useAuditFilter } from "./AuditFilterProvider";
import { useSearchParams } from "react-router-dom";
import { Input } from "../ui/input";
import saveAs from "file-saver";

interface AuditSecretTableProps {
  listenerID: string;
}

export const AuditSecretTable = ({ listenerID }: AuditSecretTableProps) => {
  const [selectedSecret, setSelectedSecret] = useState<SecretDetails | null>(null);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [searchParams] = useSearchParams();
  const {
    isFiltersDialogOpen,
    setIsFiltersDialogOpen,
    handleFilterChange,
    handleFilterNameChange,
    currentFilters,
    hasAppliedFilters
  } = useAuditFilter();

  const {
    data: secretTableData,
    isLoading: isLoadingSecretTableData,
    isError: isErrorSecretTableData,
    isRefetchError: isRefetchErrorSecretTableData,
    error: secretTableDataError,
  } = useGetDashboarSecretTable(false, listenerID || '', searchParams, {
    refetchInterval: 20 * ONE_SECOND_IN_MILLISECONDS,
    refetchIntervalInBackground: true,
    enabled: !!listenerID
  });

  const listenerSecretTableData = useMemo(() => {
    if (!secretTableData)
      return {
        secretsData: [],
        secretsNames: [],
        policiesNames: [],
        providersNames: [],
      };

    return secretTableData;
  }, [secretTableData]);

  useEffect(() => {
    if (!(secretTableDataError || isRefetchErrorSecretTableData)) return;

    handleDefaultApiHttpError(
      secretTableDataError,
      "Error while fetching audit listener data"
    );
  }, [secretTableDataError, isErrorSecretTableData, isRefetchErrorSecretTableData]);

  const columnHelper = createColumnHelper<AuditTableData>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Secret",
        cell: (info) => <strong>{info.getValue() || "Unknown Secret Name"}</strong>,
      }),
      columnHelper.accessor("providerName", {
        header: "Provider",
        cell: (info) => info.getValue() || "Unknown Provider Name",
      }),
      columnHelper.accessor("lastRotation", {
        header: "Last Rotation",
        cell: (info) => (
          <span className="font-mono">
            {info.getValue() ? new Date(info.getValue()!).toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
              timeZone: "UTC",
            }) : "Never rotated"}
          </span>
        ),
        // TODO: Understand why this sortingFn is necessary for proper sorting instead of the default behavior
        sortingFn: (rowA, rowB) => {
          const dateA = rowA.original.lastRotation ? new Date(rowA.original.lastRotation) : new Date(0);
          const dateB = rowB.original.lastRotation ? new Date(rowB.original.lastRotation) : new Date(0);
          return dateA.getTime() - dateB.getTime();
        },
      }),
      columnHelper.accessor("lastAccess", {
        header: "Last Access",
        cell: (info) => (
          <span className="font-mono">
            {info.getValue() ? new Date(info.getValue()!).toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
              timeZone: "UTC",
            }) : "Never accessed"}
          </span>
        ),
        // TODO: Understand why this sortingFn is necessary for proper sorting instead of the default behavior
        sortingFn: (rowA, rowB) => {
          const dateA = rowA.original.lastAccess ? new Date(rowA.original.lastAccess) : new Date(0);
          const dateB = rowB.original.lastAccess ? new Date(rowB.original.lastAccess) : new Date(0);
          return dateA.getTime() - dateB.getTime();
        },
      }),
      columnHelper.accessor("duplicatesAmount", {
        header: "Duplicates",
        cell: (info) => info.getValue() !== null ? info.getValue() : "Unknown duplicates amount",
      }),
      columnHelper.accessor("accessorsAmount", {
        header: "Accessors",
        cell: (info) => info.getValue() !== null ? info.getValue() : "Unknown accessors amount",
      }),
      columnHelper.accessor("policiesAmount", {
        header: "Policy compliance",
        cell: (info) => {
          const nonCompliantPolicies = info.row.original.policies.filter(policy => policy.status !== "compliant").length;
          return (
            <div className="flex gap-2 w-full items-center">
              {info.getValue() !== null ? info.getValue() : "Unknown"}{" "}
              {!info.row.original.fullCompliant && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <LucideAlertCircle className="text-orange-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Needs attention for {nonCompliantPolicies} {nonCompliantPolicies === 1 ? "policy" : "policies"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          );
        },
      }),
    ],
    [columnHelper]
  );

  useEffect(() => {
    if (currentFilters.search) {
      setSearchInputValue(currentFilters.search);
    }
  }, [currentFilters.search]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputValue(e.target.value);
    handleFilterNameChange(e.target.value);
  };

  const auditTableDataJsonToCsvFlat = (json: AuditTableData[]): string => {
    if (!json.length) return '';

    const isPrimitive = (value: AuditTableData[keyof AuditTableData]): boolean => {
        return value === null || ['string', 'number', 'boolean'].includes(typeof value);
    };

    const headers = Object.keys(json[0])
        .filter((key) => isPrimitive(json[0][key as keyof AuditTableData]))
        .join(',');

    const rows = json.map((row) => {
        return Object.keys(row)
            .filter((key) => isPrimitive(row[key as keyof AuditTableData]))
            .map((key) => `"${row[key as keyof AuditTableData] ?? ''}"`)
            .join(',');
    });

    return [headers, ...rows].join('\n');
  };

  const handleExportSecretsTable = (jsonData: AuditTableData[]) => {
    const csv = auditTableDataJsonToCsvFlat(jsonData);
    const file = new File([csv], 'data.csv', { type: 'text/csv' });
    saveAs(file);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between pt-4">
        <h2 className="font-bold w-auto mb-2">All Secrets</h2>

        <div className="flex gap-2">
          <div className="relative flex gap-2 items-center">
            {/* <div className="relative"> */}
              <Input
                placeholder="Search..."
                value={searchInputValue}
                onChange={(e) => handleSearchInputChange(e)}
                className="max-w-48 pr-8"
              />
              <LucideSearch className="absolute inset-y-0 right-3 self-center text-muted-foreground" />
            {/* </div> */}
          </div>

          <Button
            size="icon"
            variant="outline"
            className="self-center"
            aria-label="Download"
            title="Download"
            onClick={() => {handleExportSecretsTable(listenerSecretTableData?.secretsData?? [])}}
          >
            <LucideDownload/>
          </Button>

          <Dialog
            open={isFiltersDialogOpen}
            onOpenChange={setIsFiltersDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="self-center min-[260px]:self-end relative"
                aria-label="Filters"
                title="Filters"
              >
                <LucideFilter />
                {hasAppliedFilters() && <LucideCircle className="absolute -top-1 -right-1 !size-2.5 stroke-0 fill-orange-500" />}
              </Button>
            </DialogTrigger>
            <FilterDialogForm
              initialValues={currentFilters}
              onSubmit={handleFilterChange}
              listenerID={listenerID}
            />
          </Dialog>
        </div>
      </div>

      <DataProvider
        data={listenerSecretTableData.secretsData}
        columns={columns}
        initialSort={{ id: "lastRotation", desc: true }}
        isLoading={isLoadingSecretTableData}
      >
        <DataTable onRowClick={(row) => setSelectedSecret(row)} />
      </DataProvider>

      <AuditSecretDetailsDialog
        secret={selectedSecret}
        onOpenChange={(open) => !open && setSelectedSecret(null)}
      />
    </>
  );
};
