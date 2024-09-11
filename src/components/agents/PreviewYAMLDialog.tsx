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
import axios from "axios"
import { useEffect, useState } from "react"
import { PreviewYamlContent } from "./PreviewYAMLContent"

export function PreviewYamlDialog({id, buttonVariant="default"}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={buttonVariant}>Preview YAML</Button>
      </DialogTrigger>
      <PreviewYamlContent id={id}/>
    </Dialog>
  )
}
