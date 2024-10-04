import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { deleteAgent } from "@/services/agents/agentsService"
import { trackAgentDeleted } from "@/analytics";

interface DeleteAgentModalContentProps {
  id: string;
  onDeleted: () => void;
}

export function DeleteAgentModalContent({ id, onDeleted }: DeleteAgentModalContentProps) {
  const handleDeleteAgent = async () => {
    await deleteAgent(id)
    trackAgentDeleted(id);
    onDeleted()
  }

  return (
    <DialogContent className="max-w-fit overflow-auto">
      <DialogHeader>
        <DialogTitle>Delete agent</DialogTitle>
        <DialogDescription>
          This action can't be undone and will deactivate this agent on your cluster
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button variant={"destructive"} onClick={handleDeleteAgent}>Delete</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}