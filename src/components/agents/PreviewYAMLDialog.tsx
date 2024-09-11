import { Button } from "@/components/ui/button"
import {
  Dialog, DialogTrigger
} from "@/components/ui/dialog"
import { PreviewYamlContent } from "./PreviewYAMLContent"

export function PreviewYamlDialog({ id, buttonVariant = "default" }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={buttonVariant}>Preview YAML</Button>
      </DialogTrigger>
      <PreviewYamlContent id={id} />
    </Dialog>
  )
}
