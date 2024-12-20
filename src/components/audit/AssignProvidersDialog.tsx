import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MultiSelect } from "@/components/ui/Multi-select";
import { useState, useMemo, useEffect } from "react";
import { Loader } from "@/components/ui/Loader";
import { ProviderTableData } from "./Audit.interfaces";

interface AssignProvidersDialogProps {
  currentAssignedProviders: string[];
  providers: ProviderTableData[];
  isLoadingProviders?: boolean;
  onAssign: (providerIds: string[]) => Promise<void>;
  onCancel: () => void;
}

export function AssignProvidersDialog({
  currentAssignedProviders,
  providers,
  isLoadingProviders = false,
  onAssign,
  onCancel,
}: AssignProvidersDialogProps) {
  const providerOptions = useMemo(() =>
    providers?.map((provider) => ({
      label: provider.name || "Unknown Provider",
      value: provider.providerID,
    })) || []
  , [providers]);

  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    setSelectedProviders(currentAssignedProviders);
  }, [currentAssignedProviders]);

  const handleAssign = async () => {
    setIsAssigning(true);
    try {
      await onAssign(selectedProviders);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Assign Providers</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        {isLoadingProviders ? (
          <div className="flex justify-center">
            <Loader />
          </div>
        ) : (
          <MultiSelect
            options={providerOptions}
            placeholder="Select providers..."
            onValueChange={setSelectedProviders}
            value={selectedProviders}
            animation={0}
            defaultValue={currentAssignedProviders}
          />
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isAssigning}>
          Cancel
        </Button>
        <Button onClick={handleAssign} disabled={isAssigning}>
          {isAssigning ? (
            <Loader />
          ) : (
            'Assign'
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
