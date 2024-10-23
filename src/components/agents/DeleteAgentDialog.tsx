import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DeleteAgentModalContent } from "./DeleteAgentModalContent"
import { Trash2Icon } from "lucide-react"
import { trackFeatureDeleteDialogOpened } from "@/analytics";

interface DeleteAgentDialogProps {
  id: string;
  agentName: string;
  onDeleted: () => void;
}

export function DeleteAgentDialog({id, agentName, onDeleted}: DeleteAgentDialogProps) {
  const handleDeleteDialogOpenChange = (open: boolean) => {
    if (open) {
      trackFeatureDeleteDialogOpened("Agent", id, "details-dialog");
    }
  };

  return (
    <Dialog onOpenChange={handleDeleteDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2Icon className="mr-2" />
          Delete agent
        </Button>
      </DialogTrigger>
      <DeleteAgentModalContent
        id={id}
        agentName={agentName}
        onDeleted={onDeleted}
      />
    </Dialog>
  )
}