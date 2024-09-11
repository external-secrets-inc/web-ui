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
              <span>{'cat <<EOF | kubectl apply -f -'}</span>
              <span>{content}</span>
              <span>{'EOF'}</span>
            </code>
          </pre>
        <DialogFooter>
          <Button variant={"secondary"}>Copy raw file</Button>
          <Button >Copy with apply</Button>
        </DialogFooter>
      </DialogContent>
  )
}
