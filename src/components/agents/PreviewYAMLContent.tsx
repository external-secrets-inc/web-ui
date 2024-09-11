import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import axios from "axios"
import { ClipboardCopyIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const URL = `${import.meta.env.VITE_API_DOMAIN}/api/agents/:id/manifest/:version`
const BEARER_TOKEN = `Bearer ${import.meta.env.VITE_JWT_TOKEN}`
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

  const copyToClipboard = async (text: string, kind: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${kind}`, {
        cancel: {
          label: 'Dismiss',
          onClick: () => {},
        },
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  const handleCopyRaw = () => {
    copyToClipboard(content, 'raw YAML');
  }

  const handleCopyWithApply = () => {
    const applyCommand = `cat <<EOF | kubectl apply -f -\n${content}\nEOF`;
    copyToClipboard(applyCommand, "YAML within 'kubectl apply'");
  }

  return (
      <DialogContent className="w-[max(50%,640px)] max-w-[calc(100%-theme(spacing.12))] max-h-[calc(100%-theme(spacing.12))] overflow-auto grid-rows-[auto_minmax(256px,1fr)_auto]">
        <DialogHeader>
          <DialogTitle>Manifest file</DialogTitle>
          <DialogDescription>
            Apply this manifest to your cluster to activate your agents
          </DialogDescription>
        </DialogHeader>
          <pre>
            <code className="flex flex-col">
              <span>{content}</span>
            </code>
          </pre>
        <DialogFooter>
          <Button onClick={handleCopyRaw} variant={"secondary"} ><ClipboardCopyIcon className="mr-2" />Copy raw YAML</Button>
          <Button onClick={handleCopyWithApply}><ClipboardCopyIcon className="mr-2"/> Copy as CLI command</Button>
        </DialogFooter>
      </DialogContent>
  )
}
