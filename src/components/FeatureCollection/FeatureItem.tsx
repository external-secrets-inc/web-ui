import { trackFeatureItemDialogOpened } from "@/analytics";
import FeatureItemCard from "@/components/FeatureCollection/FeatureItemCard";
import FeatureItemDialogContent from "@/components/FeatureCollection/FeatureItemDialogContent";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";

interface FeatureItemProps {
  featureID: string;
  featureName: string;
  featureStatus: string;
  featureType: string;
  featureDescription: string;
  manifest: string;
  applyCommand: string;
  setFeatureID: (value: string) => void;
  onDeleteFeature: (featureID: string) => void;
}
function FeatureItem({ featureID, featureName, featureStatus, featureType, featureDescription, setFeatureID, applyCommand, manifest, onDeleteFeature }: FeatureItemProps) {
  const isPending = ['PENDING_REGISTRATION', 'PROVISIONING'].includes(featureStatus.toUpperCase());
  const [isFeatureContentDialogOpen, setIsFeatureContentDialogOpen] = useState(false);
  const [activeContentTab, setActiveContentTab] = useState('details');

  const handleFeatureItemDialogOpenChange = (isOpen: boolean) => {
    setIsFeatureContentDialogOpen(isOpen);
    setFeatureID(featureID);
    if (!isOpen) {
      setActiveContentTab('details');
      setFeatureID("")
    }
  };

  const handleDeleteFeature = () => {
    onDeleteFeature(featureID)
  }

  const handleApplyButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFeatureID(featureID);
    setActiveContentTab('apply');
    setIsFeatureContentDialogOpen(true);
  };

  useEffect(() => {
    if (isFeatureContentDialogOpen) {
      trackFeatureItemDialogOpened(featureType, featureID, featureName);
    }
  }, [isFeatureContentDialogOpen, featureType, featureID, featureName]);

  return (
    <Dialog open={isFeatureContentDialogOpen} onOpenChange={handleFeatureItemDialogOpenChange}>
      <DialogTrigger asChild>
        <FeatureItemCard
          featureType={featureType}
          featureName={featureName}
          featureID={featureID}
          featureStatus={featureStatus}
          isPending={isPending}
          onPreviewYaml={() => setIsFeatureContentDialogOpen(true)}
          onDelete={handleDeleteFeature}
          onApply={handleApplyButtonClick}
        />
      </DialogTrigger>
      <FeatureItemDialogContent
        activeTab={activeContentTab}
        setActiveTab={setActiveContentTab}
        id={featureID}
        featureName={featureName}
        featureStatus={featureStatus}
        isPending={isPending}
        onDeleted={handleDeleteFeature}
        content={manifest}
        applyCommand={applyCommand}
        featureType={featureType}
        featureDescription={featureDescription}
      />
    </Dialog>
  )
}

export default FeatureItem;