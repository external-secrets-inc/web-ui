import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DeleteAgentModalContent } from "./DeleteAgentModalContent"
import { Trash2Icon } from "lucide-react"

interface DeleteAgentDialogProps {
  id: string;
  onDeleted: () => void;
}

export function DeleteAgentDialog({id, onDeleted}: DeleteAgentDialogProps) {
  const handleDeleteDialogOpenChange = (open: boolean) => {
    if (open) {
      analytics.track("Agent Delete Dialog Opened", {
        agentId: id,
      });
    }
  };

  return (
    <Dialog onOpenChange={handleDeleteDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="md:mr-auto">
          <Trash2Icon className="mr-2" />
          Delete
        </Button>
      </DialogTrigger>
      <DeleteAgentModalContent id={id} onDeleted={onDeleted} />
    </Dialog>
  )
}