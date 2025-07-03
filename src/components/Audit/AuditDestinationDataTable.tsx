import { useEffect, useMemo, useState } from "react";
import { DestinationTableData } from "./Audit.interfaces";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LucideMoreVertical, LucidePlus, LucideTrash2, LucideEdit } from "lucide-react";
import { FeatureItemDeleteAction } from "@/components/FeatureCollection/FeatureItemDeleteAction";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { DataProvider, DataTable, defineColumns } from "@/components/ui/DataProvider";
import useGetDestinations from "@/services/audit/queries/useGetDestinations";
import useDeleteDestination from "@/services/audit/mutations/useDeleteDestination";
import { DestinationDialogForm } from "./DestinationDialogForm";

interface DestinationTableMeta {
  renderRowActions?: (row: DestinationTableData) => React.ReactNode;
}

export default function AuditDestinationDataTable() {
  const columns = useMemo(() => defineColumns<DestinationTableData>(columnHelper => [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => <strong>{info.getValue()}</strong>
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: info => info.getValue()
    }),
    columnHelper.display({
      id: 'actions',
      cell: props => (
        <div className='flex justify-end'>
          {(props.table.options.meta as DestinationTableMeta)?.renderRowActions?.(props.row.original)}
        </div>
      )
    })
  ]), []);

  const destinationTableMeta: DestinationTableMeta = {
    renderRowActions: (row) => (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => event.stopPropagation()}
            >
              <LucideMoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            onClick={(event) => event.stopPropagation()}
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setSelectedDestinationId(row.destinationID);
                setIsAddDestinationDialogOpen(true);
              }}
            >
              <LucideEdit className="mr-2" />
              Edit Destination
            </DropdownMenuItem>
            <FeatureItemDeleteAction
              featureType="Audit Destination"
              featureID={row.destinationID}
              featureName={row.name}
              onDelete={() => {
                performDelete(row.destinationID);
              }}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <LucideTrash2 className="mr-2" />
                Delete Destination
              </DropdownMenuItem>
            </FeatureItemDeleteAction>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  };

  const [isAddDestinationDialogOpen, setIsAddDestinationDialogOpen] = useState(false);//
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>("");

  const {
    data: destinationsData,
    refetch,
    isLoading: isLoadingDestinations,
    isError: isErrorDestinations,
    error: destinationsError
  } = useGetDestinations(false);

  const { mutate: deleteDestination } = useDeleteDestination({
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to delete Destination"),
    onSuccess: () => {
      refetch();
      toast.success("Destination deleted successfully")
    },
  });

  const performDelete = (destinationID: string) => {
    deleteDestination({ destinationID });
  };

  const destinations = useMemo(() => {
    if (!destinationsData) return []

    return destinationsData.map(destination => ({
      ...destination,
      id: destination.destinationID,
    }));
  }, [destinationsData]);

  useEffect(() => {
    if (!destinationsError) return;
    handleDefaultApiHttpError(destinationsError, "Error while fetching listener Audit data");
  }, [destinationsError, isErrorDestinations]);

  const handleAddDestinationDialogOpenChange = (isOpen: boolean) => {
    setIsAddDestinationDialogOpen(isOpen);
    if (!isOpen) {
      setSelectedDestinationId("");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Dialog
        open={isAddDestinationDialogOpen}
        onOpenChange={handleAddDestinationDialogOpenChange}
      >
        <DialogTrigger asChild>
          <Button variant="outline" className="self-end">
            <LucidePlus />
            Add Destination
          </Button>
        </DialogTrigger>
        <DestinationDialogForm
          destinationID={selectedDestinationId || undefined}
          onSuccess={() => {
            handleAddDestinationDialogOpenChange(false);
            refetch();
          }}
          onCancel={() => {
            handleAddDestinationDialogOpenChange(false);
          }}
        />
      </Dialog>

      <DataProvider
        data={destinations}
        columns={columns}
        initialSort={{ id: 'name', desc: false }}
        isLoading={isLoadingDestinations}
        meta={destinationTableMeta}
      >
        <DataTable />
      </DataProvider>
    </div>
  );
}
