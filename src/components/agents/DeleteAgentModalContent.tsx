import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { DialogClose } from "@radix-ui/react-dialog"
import axios from "axios"

const URL = `${import.meta.env.VITE_API_DOMAIN}/api/agents`
const BEARER_TOKEN = `Bearer ${import.meta.env.VITE_JWT_TOKEN}`

export function DeleteAgentModalContent({ id, onDeleted }) {
  const deleteAgent = () => {
    axios.delete(`${URL}/${id}`, { headers: { Authorization: BEARER_TOKEN } }).then(() => {
      onDeleted()
      toast.success('File copied succesfully', { description: "Apply it to your cluster and this page will update on its" })

    })
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
          <Button variant={"destructive"} onClick={deleteAgent}>Delete</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}
