import { trackFeatureDeleteDialogOpened } from "@/analytics";
import FeatureItemDeleteDialogContent from "@/components/FeatureCollection/FeatureItemDeleteDialogContent";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2Icon } from "lucide-react"

interface FeatureItemDeleteButtonProps {
  featureType: string;
  featureId: string;
  featureName: string;
  onDelete: () => void;
}

export function FeatureItemDeleteButton({
  featureType,
  featureId,
  featureName,
  onDelete,
}: FeatureItemDeleteButtonProps) {
  const handleDeleteDialogOpenChange = (open: boolean) => {
    if (open) {
      trackFeatureDeleteDialogOpened(featureType, featureId, "details-dialog")
    }
  };

  return (
    <Dialog onOpenChange={handleDeleteDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2Icon className="mr-2" />
          Delete {featureType}
        </Button>
      </DialogTrigger>
      <FeatureItemDeleteDialogContent
        featureType={featureType}
        featureID={featureId}
        featureName={featureName}
        onDelete={onDelete}
      />
    </Dialog>
  )
}