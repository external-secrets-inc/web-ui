import { useEffect, useState } from "react";
import { AxiosError } from "axios";

import { API_DOMAIN, DOCS_DOMAIN, ONE_SECOND_IN_MILLISECONDS } from "@/constants";
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

export default function Audit() {
  const [processCommand, setProcessCommand] = useState("")
  const [applyCommand, setApplyCommand] = useState("")
  const [isListenerInstallDialogOpen, setIsListenerInstallDialogOpen] = useState(false);

  // TODO remove mock https://github.com/external-secrets-inc/web-ui/issues/115
  const { data: listenerData, isError: listenerIsError, error: listenerError } = useGetListener(true, {
    refetchInterval: 20 * ONE_SECOND_IN_MILLISECONDS,
    refetchIntervalInBackground: true,
  });

  const listener = {
    id: listenerData ? listenerData.id : "",
    status: listenerData ? listenerData.current_status : "PENDING_REGISTRATION"
    // status: "PENDING_REGISTRATION"
  }

  useEffect(() => {
    if (!(listenerError)) return;

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

  const handleFeatureItemDialogOpenChange = (isOpen: boolean) => {
    setIsListenerInstallDialogOpen(isOpen);
  };

  useEffect(() => {
    if (isListenerInstallDialogOpen) {
      trackListenerInstallDialogOpened(listener.id);
    }
  }, [isListenerInstallDialogOpen, listener.id]);

  return (
    <div className="space-y-8">
      <div className='flex items-center justify-between p-4 border rounded-lg m530:flex-row flex-col m530:w-auto w-full m530:space-y-0 space-y-4'>
        <div className='text-lg'>
          <span className='flex flex-col m530:flex-row gap-2 items-center text-center m530:text-left'>
            Listener Status:
            <div className='flex flex-row gap-2 items-center'>
              {STATUS_MAP["PENDING_REGISTRATION"].icon}
              {STATUS_MAP["PENDING_REGISTRATION"].text}
            </div>
          </span>
        </div>
        <Dialog open={isListenerInstallDialogOpen} onOpenChange={handleFeatureItemDialogOpenChange}>
          <DialogTrigger asChild>
            <Button
              size="default"
              className="self-center m530:self-end"
            >Install listener</Button>
          </DialogTrigger>
          <ListenerInstallDialogContent
            id={listener.id}
            processFile={processFileData ? processFileData.process : ''}
            processCommand={processCommand}
            applyCommand={applyCommand}
          />
        </Dialog>
      </div>

      {/* Graphs Section */}
      <div className="flex justify-around gap-x-4 flex-col sm:flex-row sm:space-y-0 space-y-4">
        <div className="p-6 border rounded-lg shadow-sm w-1/2 flex flex-col space-y-4">
          <div className="text-lg font-semibold mb-2">Pizza graph</div>
          <div className="flex items-center">
            <div className="h-24 w-24 border  rounded-full flex items-center justify-center">
              [Pie Chart]
            </div>
            <div className="ml-6 flex-grow space-y-2">
              <p>Graph info</p>
              <p>Graph info</p>
              <p>Graph info</p>
            </div>
          </div>
        </div>
        <div className="p-6 border rounded-lg shadow-sm w-1/2 flex flex-col space-y-4">
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

      {/* Table Section */}
      <div className="p-6 border rounded-lg shadow-sm space-y-4">
        <div className="flex items-center justify-between sm:flex-row flex-col sm:space-y-0 space-y-4">
          <h3 className="text-lg font-semibold">Table title</h3>
          <Button className="self-center sm:self-end">
            Button to open filters
          </Button>
        </div>
        <div className="p-4 bg-gray-100 rounded">
          Big table with things on it but I don’t need to worry about right now
        </div>
      </div>
    </div>
  );
}
