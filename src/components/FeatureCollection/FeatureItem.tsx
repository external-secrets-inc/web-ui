import { trackFeatureDeleteDialogOpened, trackFeatureYamlDialogOpened } from "@/analytics";
import FeatureItemCard from "@/components/FeatureCollection/FeatureItemCard";
import FeatureItemDeleteDialogContent from "@/components/FeatureCollection/FeatureItemDeleteDialogContent";
import FeatureItemDialogContent from "@/components/FeatureCollection/FeatureItemDialogContent";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { LucideAlertCircle, LucideCheckCircle, LucideTrash2, LucideXCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface FeatureItemProps {
  featureID: string;
  featureName: string;
  featureStatus: string;
  featureType: string;
  featureDescription: string;
  manifest: string;
  applyCommand: string;
  setFeatureId: (value: string) => void;
  onDeleteFeature: (featureId: string) => void;
}

const STATUS_MAP: { [key: string]: { text: string, icon: React.ReactNode } } = {
  "PROVISIONING": {
    text: "Provisioning",
    icon: <LucideAlertCircle className="text-orange-500" />
  },
  "PENDING_REGISTRATION": {
    text: "Pending Registration",
    icon: <LucideAlertCircle className="text-orange-500" />
  },
  "ACTIVE": {
    text: "Active",
    icon: <LucideCheckCircle className="text-green-700" />
  },
  "OFFLINE": {
    text: "Offline",
    icon: <LucideXCircle className="text-muted-foreground" />
  },
  "PENDING_DELETION": {
    text: "Pending Deletion",
    icon: <LucideTrash2 className="text-destructive" />
  },
  "DELETED": {
    text: "Deleted",
    icon: <LucideAlertCircle className="text-destructive" />
  }
};

function FeatureItem({ featureID, featureName, featureStatus, featureType, featureDescription, setFeatureId, applyCommand, manifest, onDeleteFeature }: FeatureItemProps) {
  const isPending = ['PENDING_REGISTRATION', 'PROVISIONING'].includes(featureStatus.toUpperCase());
  const [isFeatureContentDialogOpen, setIsFeatureContentDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeContentTab, setActiveContentTab] = useState('details');

  const status = STATUS_MAP[featureStatus] || { text: featureStatus, icon: null };

  const handleYamlDialogOpenChange = (isOpen: boolean) => {
    setIsFeatureContentDialogOpen(isOpen);
    setFeatureId(featureID);
    if (!isOpen) {
      setActiveContentTab('details');
      setFeatureId("")
    }
  };

  const handleDeleteFeature = () => {
    onDeleteFeature(featureID)
  }

  const handleApplyButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFeatureId(featureID);
    setActiveContentTab('apply');
    setIsFeatureContentDialogOpen(true);
  };

  useEffect(() => {
    if (isFeatureContentDialogOpen) {
      trackFeatureYamlDialogOpened(featureType, featureID, featureName);
    }
  }, [isFeatureContentDialogOpen, featureType, featureID, featureName]);

  useEffect(() => {
    if (isDeleteDialogOpen) {
      trackFeatureDeleteDialogOpened(featureType, featureName, "dropdown");
    }
  }, [isDeleteDialogOpen, featureType, featureName]);

  return (
    <>
      <Dialog open={isFeatureContentDialogOpen} onOpenChange={handleYamlDialogOpenChange}>
        <DialogTrigger asChild>
          <FeatureItemCard
            featureName={featureName}
            featureID={featureID}
            status={status}
            isPending={isPending}
            onPreviewYaml={() => setIsFeatureContentDialogOpen(true)}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onApply={handleApplyButtonClick}
          />
        </DialogTrigger>
        <FeatureItemDialogContent
          activeTab={activeContentTab}
          setActiveTab={setActiveContentTab}
          id={featureID}
          featureName={featureName}
          status={status}
          onDeleted={handleDeleteFeature}
          content={manifest}
          applyCommand={applyCommand}
          featureType={featureType}
          featureDescription={featureDescription}
        />
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <FeatureItemDeleteDialogContent
          featureName={featureName}
          featureType={featureType}
          featureID={featureID}
          onDelete={handleDeleteFeature}
        />
      </Dialog>
    </>
  )
}

export default FeatureItem;