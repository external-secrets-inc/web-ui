import { trackFeatureDeleteDialogOpened } from "@/analytics";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2Icon } from "lucide-react"

interface FeatureItemDeleteButtonProps {
  featureType: string;
  featureId: string;
  children: React.ReactNode;
}

export function FeatureItemDeleteButton({featureType, featureId, children}: FeatureItemDeleteButtonProps) {
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
      {children}
    </Dialog>
  )
}