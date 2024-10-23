import { trackFeatureDeleted } from "@/analytics";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DeleteFeatureDialogContent {
  featureName: string;
  featureType: string;
  featureID: string;
  onDelete: () => void;
}

function DeleteFeatureDialogContent({featureName, featureType, featureID, onDelete} : DeleteFeatureDialogContent) {
  const handleDeleteFeature = () => {
    onDelete();
    trackFeatureDeleted(featureType, featureID)
  }

  return (
    <DialogContent className="max-w-fit overflow-auto">
      <DialogHeader>
        <DialogTitle>Delete <span className="lowercase">{featureType}</span>: <span className="text-muted-foreground">{featureName}</span></DialogTitle>
        <DialogDescription>
          This action can't be undone and will deactivate this <span className="lowercase">{featureType}</span> on your cluster
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button variant={"destructive"} onClick={handleDeleteFeature}>Delete</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}

export default DeleteFeatureDialogContent;