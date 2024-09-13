import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DeleteAgentModalContent } from "./DeleteAgentModalContent"
import { Trash2Icon } from "lucide-react"

export function DeleteAgentDialog({id, onDeleted}) {
  return (
    <Dialog>
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
