import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import qs from "qs";

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
import { trackListenerInstallDialogOpened } from "@/analytics";
import FilterComponent from "./FilterComponent";
import { FilterState } from "./Audit.interfaces";

// const data: TableData[] = [
//   {
//     secret: 'API_KEY',
//     lastRotation: '2024-11-17',
//     policies: 'Read-only',
//     duplicates: 2,
//     lastAccess: '2024-11-16',
//     accessors: 'Service A, Service B',
//   },
//   {
//     secret: 'DATABASE_PASSWORD',
//     lastRotation: '2024-10-01',
//     policies: 'Read-write',
//     duplicates: 0,
//     lastAccess: '2024-11-10',
//     accessors: 'Service C',
//   },
//   // Add more rows as needed
// ];

export default function Audit() {
  const [processCommand, setProcessCommand] = useState("")
  const [applyCommand, setApplyCommand] = useState("")
  const [filters, setFilters] = useState({})
  const [isListenerInstallDialogOpen, setIsListenerInstallDialogOpen] = useState(false);
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);

  // TODO remove mock https://github.com/external-secrets-inc/web-ui/issues/115
  const { data: listenerData, refetch: listenerRefetch, isError: listenerIsError, isRefetchError: listenerIsRefetchError, error: listenerError } = useGetListener(true, filters, {
    refetchInterval: 20 * ONE_SECOND_IN_MILLISECONDS,
    refetchIntervalInBackground: true,
  });

  const listener = {
    id: listenerData ? listenerData.id : "",
    status: listenerData ? listenerData.current_status : "PENDING_REGISTRATION"
  }

  useEffect(() => {
    if (!(listenerError || listenerIsRefetchError)) return;

    handleDefaultApiHttpError(listenerError, "Error while fetching listener")
  }, [listenerError, listenerIsError])

  const { mutate: createToken, data: token } = useCreateAuditInstallationToken({
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to generate manifest token")
  });

  const { data: processFileData, error: processFileError, isError: processFileIsError } = useGetAuditProcessFile(true, token ?? '', "latest", {
    enabled: token !== "",
  });

  useEffect(() => {
    if (!(processFileError)) return;

    handleDefaultApiHttpError(processFileError, "Error while fetching process file")
  }, [processFileError, processFileIsError])

  useEffect(() => {
    createToken({ mock: true })
  }, [createToken])

  // TODO update commands to real endpoints https://github.com/external-secrets-inc/web-ui/issues/118
  useEffect(() => {
    if (!token) return

    let command = [
      "curl \\",
      `${API_DOMAIN}/public/audit/manifest/latest\\`,
      `?token=${token} \\`,
      "| kubectl apply -f -",
    ].join('\n');
    setApplyCommand(command);

    command = [
      "curl \\",
      `${API_DOMAIN}/public/audit/process/latest\\`,
      `?token=${token} \\`,
      "| sh process.sh",
    ].join('\n');
    setProcessCommand(command);
  }, [token])

  const handleListenerInstallDialogOpenChange = (isOpen: boolean) => {
    setIsListenerInstallDialogOpen(isOpen);
  };

  const handleFiltersDialogOpenChange = (isOpen: boolean) => {
    setIsFiltersDialogOpen(isOpen);
  };

  const handleFilterChange = (selectedFilters: FilterState) => {
    setFilters(Object.fromEntries(
      Object.entries(selectedFilters).filter(
        ([, value]) =>
          value !== null &&
          value !== undefined &&
          value !== "" &&
          (!Array.isArray(value) || value.length > 0)
      )
    ))
    listenerRefetch();
  }

  useEffect(() => {
    if (isListenerInstallDialogOpen) {
      trackListenerInstallDialogOpened(listener.id);
    }
  }, [isListenerInstallDialogOpen, listener.id]);

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
        <Dialog open={isListenerInstallDialogOpen} onOpenChange={handleListenerInstallDialogOpenChange}>
          <DialogTrigger asChild>
            <Button
              size="default"
              className="self-center min-[530px]:self-end"
            >
              Install listener
            </Button>
          </DialogTrigger>
          <ListenerInstallDialogContent
            id={listener.id}
            processFile={processFileData ? processFileData.process : ''}
            processCommand={processCommand}
            applyCommand={applyCommand}
          />
        </Dialog>
      </div>

      <div className="flex justify-around gap-x-4 flex-col space-y-4 min-[640px]:flex-row min-[640px]:space-y-0">
        <div className="p-6 border rounded-lg shadow-sm w-full flex flex-col space-y-4 min-[640px]:w-1/2">
          <div className="text-lg font-semibold mb-2">Pizza graph</div>
          <div className="flex items-center">
            <div className="h-24 w-24 border rounded-full flex items-center justify-center">
              [Pie Chart]
            </div>
            <div className="ml-6 flex-grow space-y-2">
              <p>Graph info</p>
              <p>Graph info</p>
              <p>Graph info</p>
            </div>
          </div>
        </div>
        <div className="p-6 border rounded-lg shadow-sm w-full flex flex-col space-y-4 min-[640px]:w-1/2">
          <div className="text-lg font-semibold mb-2">Pizza graph</div>
          <div className="flex items-center">
            <div className="h-24 w-24 border rounded-full flex items-center justify-center">
              [Pie Chart]
            </div>
            <div className="ml-6 space-y-2">
              <p>Graph info</p>
              <p>Graph info</p>
              <p>Graph info</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border rounded-lg shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-col space-y-4 min-[260px]:flex-row min-[260px]:space-y-0">
          <h3 className="text-lg font-semibold">Table title</h3>
          <Dialog open={isFiltersDialogOpen} onOpenChange={handleFiltersDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="self-center min-[260px]:self-end">
                Filters
              </Button>
            </DialogTrigger>
            <FilterComponent onFiltersChange={handleFilterChange} />
          </Dialog>
        </div>
        <div className="p-4 bg-gray-500 rounded">
          <p className="mb-2">Big table with things on it.</p>
          <div>
            <p className="font-bold mb-1">Current Filters:</p>
            <p>
              <span className="font-semibold">Stringified (Query):</span> {qs.stringify(filters, { arrayFormat: 'repeat' })}
            </p>
            <p>
              <span className="font-semibold">Dictionary:</span>{" "}
              <pre className="bg-gray-700 p-2 rounded inline-block">{JSON.stringify(filters, null, 2)}</pre>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
