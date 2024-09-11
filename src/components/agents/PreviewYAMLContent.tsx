import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DialogClose } from "@radix-ui/react-dialog"
import axios from "axios"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const URL = `${import.meta.env.VITE_API_DOMAIN}/api/agents/:id/manifest/:version`
const BEARER_TOKEN = `Bearer ${import.meta.env.VITE_JWT_TOKEN}`

const APPLY_HEADER = 'cat <<EOF | kubectl apply -f -'
const APPLY_FOOTER = 'EOF'

export function PreviewYamlContent({id, version = 'latest'}) {
  const [content, setContent] = useState('')

  const getManifestContent = () => {
    const url = URL.replace(':id',id).replace(':version', version)
    axios.get(url, {
          headers: {
            Authorization: BEARER_TOKEN,
            'Content-Type': 'application/json'
          },
        }
      ).then(({data}) => {
        setContent(data.manifest)
      })
    }

  useEffect(() => getManifestContent(), [])

  const copyContent = async (withApply = true) => {
    const finalText = withApply ? `
    ${APPLY_HEADER}
    ${content}
    ${APPLY_FOOTER}
    ` : content
    try {
      await navigator.clipboard.writeText(finalText);
    } catch (error) {
      console.error(error.message);
    }
  }

  return (
      <DialogContent className="max-w-fit max-h-full overflow-auto">
        <DialogHeader>
          <DialogTitle>Manifest file</DialogTitle>
          <DialogDescription>
            Apply this manifest to your cluster to activate your agents
          </DialogDescription>
        </DialogHeader>
        <div className="whitespace-pre font-mono bg-slate-100 w-fit max-h-96 p-2 rounded overflow-scroll">
          <div>{APPLY_HEADER}</div>
          <div>{content}</div>
          <div>{APPLY_FOOTER}</div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
          <Button variant={"secondary"} onClick={() => copyContent(false)}>Copy raw file</Button>
          </DialogClose><DialogClose asChild>
          <Button onClick={copyContent}>Copy with apply</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
  )
}
