import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@radix-ui/react-label"
import { Trash2Icon } from "lucide-react"
import { DeleteAgentModalContent } from "./DeleteAgentModalContent"

export function DeleteAgentDialog({ id, onDeleted, variant = "destructive", showIcon = true, showLabel = true }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} className="cursor-pointer">
          {showLabel && <Label> Delete</Label>}
          {showIcon && <Trash2Icon />}
        </Button>
      </DialogTrigger>
      <DeleteAgentModalContent id={id} onDeleted={onDeleted} />
    </Dialog>
  )
}
