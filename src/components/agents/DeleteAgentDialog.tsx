import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DeleteAgentModalContent } from "./DeleteAgentModalContent"
import { Trash2Icon } from "lucide-react"
import { trackDeleteDialogOpened } from "@/analytics";

interface DeleteAgentDialogProps {
  id: string;
  onDeleted: () => void;
}

export function DeleteAgentDialog({id, onDeleted}: DeleteAgentDialogProps) {
  const handleDeleteDialogOpenChange = (open: boolean) => {
    if (open) {
      trackDeleteDialogOpened(id);
    }
  };

  return (
    <Dialog onOpenChange={handleDeleteDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2Icon className="mr-2" />
          Delete Agent
        </Button>
      </DialogTrigger>
      <DeleteAgentModalContent id={id} onDeleted={onDeleted} />
    </Dialog>
  )
}