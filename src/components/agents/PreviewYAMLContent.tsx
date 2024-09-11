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
      <DialogContent className="max-w-fit max-h-full overflow-auto">
        <DialogHeader>
          <DialogTitle>Manifest file</DialogTitle>
          <DialogDescription>
            Apply this manifest to your cluster to activate your agents
          </DialogDescription>
        </DialogHeader>
        <div className="whitespace-pre font-mono bg-slate-100 w-fit max-h-96 p-2 rounded overflow-scroll">
          <div>{'cat <<EOF | kubectl apply -f -'}</div>
          <div>{content}</div>
          <div>{'EOF'}</div>
        </div>
        <DialogFooter>
          <Button variant={"secondary"}>Copy raw file</Button>
          <Button >Copy with apply</Button>
        </DialogFooter>
      </DialogContent>
  )
}
