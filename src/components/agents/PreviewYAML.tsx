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
export function PreviewYaml({id, version = 'latest', buttonVariant="default"}) {
  const [content, setContent] = useState(`
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-deployment
  labels:
    app: agent
spec:
  replicas: 1
  selector:
    matchLabels:
      app: agent
  template:
    metadata:
      labels:
        app: agent
    spec:
      containers:
      - name: agent-container
        image: us-central1-docker.pkg.dev/eighth-bivouac-433212-h5/esi/agent
        ports:
        - containerPort: 8080
      imagePullSecrets:
      - name: ghcr-secret
`)

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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={buttonVariant}>Preview YAML</Button>
      </DialogTrigger>
      <DialogContent className="max-w-fit overflow-auto">
        <DialogHeader>
          <DialogTitle>Manifest file</DialogTitle>
          <DialogDescription>
            Apply this manifest to your cluster to activate your agents
          </DialogDescription>
        </DialogHeader>
        <div className="whitespace-pre font-mono bg-slate-100 min-w-96 p-2 rounded">
          <div>{'cat <<EOF | kubectl apply -f -'}</div>
          <div>{content}</div>
          <div>{'EOF'}</div>
        </div>
        <DialogFooter>
          <Button variant={"secondary"}>Copy raw file</Button>
          <Button >Copy with apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
