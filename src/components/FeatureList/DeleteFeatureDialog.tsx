import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2Icon } from "lucide-react"

interface DeleteFeatureDialogProps {
  featureType: string;
  children: React.ReactNode;
}

export function DeleteFeatureDialog({featureType, children}: DeleteFeatureDialogProps) {
  const handleDeleteDialogOpenChange = (open: boolean) => {
    if (open) {
      // TODO - Add segment event
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