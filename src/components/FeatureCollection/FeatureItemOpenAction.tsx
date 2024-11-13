import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import { trackFeatureItemDialogOpened } from "@/analytics";
import FeatureItemDialogContent from "@/components/FeatureCollection/FeatureItemDialogContent";

interface FeatureItemOpenActionProps {
  children: React.ReactNode;
  featureID: string;
  featureName: string;
  featureStatus: string;
  featureType: string;
  featureDescription: string;
  manifest: string;
  applyCommand: string;
  setFeatureID: (value: string) => void;
  onDeleteFeature: (featureID: string) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  activeTab?: string;
  onActiveTabChange?: (tab: string) => void;
}

function FeatureItemOpenAction({
  children,
  featureID,
  featureName,
  featureStatus,
  featureType,
  featureDescription,
  manifest,
  applyCommand,
  setFeatureID,
  onDeleteFeature,
  isOpen,
  onOpenChange,
  activeTab = 'details',
  onActiveTabChange
}: FeatureItemOpenActionProps) {
  const [open, setOpen] = useState(isOpen);
  const isPending = ['PENDING_REGISTRATION', 'PROVISIONING'].includes(featureStatus.toUpperCase());

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    setFeatureID(newOpen ? featureID : '');
    onOpenChange(newOpen);
  };

  useEffect(() => {
    if (isOpen) {
      trackFeatureItemDialogOpened(featureType, featureID, featureName);
    }
  }, [isOpen, featureType, featureID, featureName]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <FeatureItemDialogContent
        activeTab={activeTab}
        setActiveTab={tab => onActiveTabChange?.(tab)}
        featureID={featureID}
        featureName={featureName}
        featureStatus={featureStatus}
        isPending={isPending}
        onDeleted={() => onDeleteFeature(featureID)}
        manifest={manifest}
        applyCommand={applyCommand}
        featureType={featureType}
        featureDescription={featureDescription}
      />
    </Dialog>
  );
}

export default FeatureItemOpenAction;