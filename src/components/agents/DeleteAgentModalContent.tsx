import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DialogClose } from "@radix-ui/react-dialog"
import { Label } from "@radix-ui/react-label"
import axios from "axios"
import { Trash2Icon } from "lucide-react"
import { useEffect, useState } from "react"

const URL = `${import.meta.env.VITE_API_DOMAIN}/api/agents`
const BEARER_TOKEN = `Bearer ${import.meta.env.VITE_JWT_TOKEN}`

export function DeleteAgentModalContent({id, onDeleted}) {
    const deleteAgent = () =>{
        axios.delete(`${URL}/${id}`, { headers: { Authorization: BEARER_TOKEN } }).then(() => onDeleted())
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
