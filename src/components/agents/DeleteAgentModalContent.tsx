import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { DialogClose } from "@radix-ui/react-dialog"
import { deleteAgent } from "@/services/agents/agentsService"

interface DeleteAgentModalContentProps {
  id: string;
  onDeleted: () => void;
}

export function DeleteAgentModalContent({ id, onDeleted }: DeleteAgentModalContentProps) {
  const handleDeleteAgent = async () => {
    await deleteAgent(id);
    onDeleted();
  };

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
