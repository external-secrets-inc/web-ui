import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import axios from "axios";
import { getAuthHeaders } from '../../services/auth/authService'; // Import getAuthHeaders

const URL = `${import.meta.env.VITE_API_DOMAIN}/api/agents`;

export function DeleteAgentModalContent({ id, onDeleted }) {
  const deleteAgent = () => {
    axios.delete(`${URL}/${id}`, { 
      headers: getAuthHeaders()  // Use the centralized getAuthHeaders function
    }).then(() => {
      onDeleted();
      toast.success('Agent deleted successfully', { description: "Apply it to your cluster and this page will update automatically." });
    });
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
          <Button variant={"destructive"} onClick={deleteAgent}>Delete</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}