import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { API_DOMAIN, ONE_SECOND_IN_MILLISECONDS } from "@/constants";
import useCreateAuditInstallationToken from "@/services/audit/mutations/useCreateAuditInstallationToken";
import useGetAuditProcessFile from "@/services/audit/queries/useGetAuditProcessFile";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { STATUS_MAP } from "@/components/FeatureCollection/FeatureCollection.constants";
import { ApiHttpError } from "@/types";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import ListenerInstallDialogContent from "./ListenerInstallDialogContent";
import useGetListener from "@/services/audit/queries/useGetListener";
import AuditChartProblems from "./AuditChartProblems";
import AuditChartProviders from "./AuditChartProviders";
import { trackListenerInstallDialogOpened } from "@/analytics";
import { AuditTableData, FilterState, columns } from "./Audit.interfaces";
import useGetListenerAuditData from "@/services/audit/queries/useGetListenerAuditData";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSearchParams } from "react-router-dom";
import FilterDialogForm from "./FilterDialogForm";

export default function Audit() {
  const [processCommand, setProcessCommand] = useState("");
  const [applyCommand, setApplyCommand] = useState("");
  const [isListenerInstallDialogOpen, setIsListenerInstallDialogOpen] =
    useState(false);
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  // TODO remove mock https://github.com/external-secrets-inc/web-ui/issues/115
  const {
    data: listenerData,
    isError: listenerIsError,
    error: listenerError,
  } = useGetListener(true, {
    refetchInterval: 20 * ONE_SECOND_IN_MILLISECONDS,
    refetchIntervalInBackground: true,
  });

  const listener = useMemo(() => {
    if (!listenerData)
      return {
        id: "",
        status: "PENDING_REGISTRATION",
      };

    return {
      id: listenerData.id,
      status: listenerData.current_status,
    };
  }, [listenerData]);

  useEffect(() => {
    if (!listenerError) return;

    handleDefaultApiHttpError(listenerError, "Error while fetching listener");
  }, [listenerError, listenerIsError]);

  const {
    data: listenerAuditData,
    refetch: listenerAuditRefetch,
    isError: listenerAuditIsError,
    isRefetchError: listenerAuditIsRefetchError,
    error: listenerAuditError,
  } = useGetListenerAuditData(true, {
    refetchInterval: 20 * ONE_SECOND_IN_MILLISECONDS,
    refetchIntervalInBackground: true,
  });

  const listenerAudit = useMemo(() => {
    if (!listenerAuditData)
      return [
        {
          secret: "",
          lastRotation: "",
          policies: "",
          duplicates: 0,
          lastAccess: "",
          accessors: 0,
        },
      ] as AuditTableData[];

    return listenerAuditData;
  }, [listenerAuditData]);

  useEffect(() => {
    if (!(listenerAuditError || listenerAuditIsRefetchError)) return;

    handleDefaultApiHttpError(
      listenerAuditError,
      "Error while fetching listener Audit data"
    );
  }, [listenerAuditError, listenerAuditIsError]);

  const { mutate: createToken, data: token } = useCreateAuditInstallationToken({
    onError: (error: AxiosError<ApiHttpError>) =>
      handleDefaultApiHttpError(
        error,
        "Error while trying to generate manifest token"
      ),
  });

  const {
    data: processFileData,
    error: processFileError,
    isError: processFileIsError,
  } = useGetAuditProcessFile(true, token ?? "", "latest", {
    enabled: token !== "",
  });

  useEffect(() => {
    if (!processFileError) return;

    handleDefaultApiHttpError(
      processFileError,
      "Error while fetching process file"
    );
  }, [processFileError, processFileIsError]);

  useEffect(() => {
    createToken({ mock: true });
  }, [createToken]);

  // TODO update commands to real endpoints https://github.com/external-secrets-inc/web-ui/issues/118
  useEffect(() => {
    if (!token) return;

    let command = [
      "curl \\",
      `${API_DOMAIN}/public/audit/manifest/latest\\`,
      `?token=${token} \\`,
      "| kubectl apply -f -",
    ].join("\n");
    setApplyCommand(command);

    command = [
      "curl \\",
      `${API_DOMAIN}/public/audit/process/latest\\`,
      `?token=${token} \\`,
      "| sh process.sh",
    ].join("\n");
    setProcessCommand(command);
  }, [token]);

  const handleListenerInstallDialogOpenChange = (isOpen: boolean) => {
    setIsListenerInstallDialogOpen(isOpen);
  };

  const handleFiltersDialogOpenChange = (isOpen: boolean) => {
    setIsFiltersDialogOpen(isOpen);
  };

  const handleFilterChange = (selectedFilters: FilterState) => {
    const filteredFilters = Object.fromEntries(
      Object.entries(selectedFilters).filter(
        ([, value]) =>
          value !== null &&
          value !== undefined &&
          value !== "" &&
          (!Array.isArray(value) || value.length > 0)
      )
    );
    setSearchParams(() => {
      const newSearchParams: Record<string, string | string[]> = {};
      Object.entries(filteredFilters).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          newSearchParams[key] = value;
        } else if (value !== null && value !== undefined && value !== "") {
          newSearchParams[key] = String(value);
        }
      });

      return newSearchParams;
    });
    handleFiltersDialogOpenChange(false);

    listenerAuditRefetch();
  };

  useEffect(() => {
    if (isListenerInstallDialogOpen) {
      trackListenerInstallDialogOpened(listener.id);
    }
  }, [isListenerInstallDialogOpen, listener.id]);

  const table = useReactTable({
    data: listenerAudit,
    columns,
    getCoreRowModel: getCoreRowModel(), // Implement core row model as per your requirements
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between p-4 border rounded-lg flex-col w-full space-y-4 min-[530px]:flex-row min-[530px]:w-auto min-[530px]:space-y-0">
        <div className="text-lg">
          <span className="flex flex-col items-center text-center gap-2 min-[530px]:flex-row min-[530px]:text-left">
            Listener Status:
            <div className="flex flex-row gap-2 items-center">
              {STATUS_MAP[listener.status].icon}
              {STATUS_MAP[listener.status].text}
            </div>
          </span>
        </div>
        <Dialog
          open={isListenerInstallDialogOpen}
          onOpenChange={handleListenerInstallDialogOpenChange}
        >
          <DialogTrigger asChild>
            <Button size="default" className="self-center min-[530px]:self-end">
              Install listener
            </Button>
          </DialogTrigger>
          <ListenerInstallDialogContent
            id={listener.id}
            processFile={processFileData ? processFileData.process : ""}
            processCommand={processCommand}
            applyCommand={applyCommand}
          />
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <AuditChartProviders />
        <AuditChartProblems />
      </div>

      <div className="p-6 border rounded-lg shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-col space-y-4 min-[260px]:flex-row min-[260px]:space-y-0">
          <h3 className="text-lg font-semibold">Table title</h3>
          <Dialog
            open={isFiltersDialogOpen}
            onOpenChange={handleFiltersDialogOpenChange}
          >
            <DialogTrigger asChild>
              <Button className="self-center min-[260px]:self-end">
                Filters
              </Button>
            </DialogTrigger>
            {/* <FilterComponent searchParams={searchParams} onFiltersChange={handleFilterChange} /> */}
            <FilterDialogForm
              initialValues={{
                provider: searchParams.getAll("provider"),
                policy: searchParams.get("policy") || undefined,
                secretName: searchParams.get("secretName") || undefined,
                policyStatus:
                  searchParams.get("policyStatus") === "true"
                    ? "true"
                    : searchParams.get("policyStatus") === "false"
                    ? "false"
                    : undefined,
                duplicates:
                  searchParams.get("duplicates") === "true"
                    ? "true"
                    : searchParams.get("duplicates") === "false"
                    ? "false"
                    : undefined,
                lastAccess: searchParams.get("lastAccess") || undefined,
                lastRotation: searchParams.get("lastRotation") || undefined,
                accessors:
                  searchParams.get("accessors") === "true"
                    ? "true"
                    : searchParams.get("accessors") === "false"
                    ? "false"
                    : undefined,
              }}
              onSubmit={(data) => {
                handleFilterChange(data);
                handleFiltersDialogOpenChange(false);
              }}
              secretsNames={["secret-1", "secret-2"]}
              policiesNames={["policy-1", "policy-2"]}
              toFilterProvidersList={[
                { value: "gcp", label: "GCP" },
                { value: "aws", label: "AWS" },
                { value: "azure", label: "Azure" },
              ]}
            />
          </Dialog>
        </div>

        <div className="flex w-full">
          <table className="w-full border-collapse table-auto text-left">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
