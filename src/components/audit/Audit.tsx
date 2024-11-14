import { useEffect, useState } from "react";
import { AxiosError } from "axios";

import { API_DOMAIN } from "@/constants";
import useCreateAuditInstallationToken from "@/services/audit/mutations/useCreateAuditInstallationToken";
import useGetAuditProcessFile from "@/services/audit/queries/useGetAuditProcessFile";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { ApiHttpError } from "@/types";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import ListenerInstallDialogContent from "./ListenerInstallDialogContent";
// TODO use listener data to get status https://github.com/external-secrets-inc/web-ui/issues/115
// import useGetListener from "@/services/listener/queries/useGetListener";


export default function Audit() {
  const [processCommand, setProcessCommand] = useState("")
  const [applyCommand, setApplyCommand] = useState("")
  const [isListenerInstallDialogOpen, setIsListenerInstallDialogOpen] = useState(false);

  // TODO use listener data to get status https://github.com/external-secrets-inc/web-ui/issues/115
  // const { data: listenerData, isError: listenerIsError, error: listenerError } = useGetListener({
  //   refetchInterval: 20 * ONE_SECOND_IN_MILLISECONDS,
  //   refetchIntervalInBackground: true,
  // });

  // useEffect(() => {
  //   if (!(listenerError)) return;

  //   handleDefaultApiHttpError(listenerError, "Error while fetching listener")
  // }, [listenerError, listenerIsError])

  const { mutate: createToken, data: token } = useCreateAuditInstallationToken({
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to generate manifest token")
  });

  const { data: processFileData, error: processFileError, isError: processFileIsError } = useGetAuditProcessFile(true, token ?? '', "latest", {
    enabled: token !== "",
  });

  useEffect(() => {
    if (!(processFileError)) return;

    handleDefaultApiHttpError(processFileError, "Error while fetching listener")
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

  // useEffect(() => {
  //   if (isFeatureContentDialogOpen) {
  //     trackFeatureItemDialogOpened(featureType, tenantID, featureName);
  //   }
  // }, [isFeatureContentDialogOpen, featureType, tenantID, featureName]);

  return (
    <Dialog open={isListenerInstallDialogOpen} onOpenChange={handleFeatureItemDialogOpenChange}>
      <DialogTrigger asChild>
        <Button>Install</Button>
      </DialogTrigger>
      <ListenerInstallDialogContent
        processFile={processFileData ? processFileData.process : ''}
        processCommand={processCommand}
        applyCommand={applyCommand}
      />
    </Dialog>
  );
}
