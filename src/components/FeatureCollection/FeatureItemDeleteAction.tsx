import { trackFeatureDeleteDialogOpened } from "@/analytics";
import FeatureItemDeleteDialogContent from "@/components/FeatureCollection/FeatureItemDeleteDialogContent";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"

interface FeatureItemDeleteActionProps {
  featureType: string;
  featureID: string;
  featureName: string;
  onDelete: () => void;
  children: React.ReactNode;
}

export function FeatureItemDeleteAction({
  featureType,
  featureID,
  featureName,
  onDelete,
  children,
}: FeatureItemDeleteActionProps) {
  const handleDeleteDialogOpenChange = (open: boolean) => {
    if (open) {
      trackFeatureDeleteDialogOpened(featureType, featureID, "details-dialog")
    }
  };

  return (
    <Dialog onOpenChange={handleDeleteDialogOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <FeatureItemDeleteDialogContent
        featureType={featureType}
        featureID={featureID}
        featureName={featureName}
        onDelete={onDelete}
      />
    </Dialog>
  )
}