import { saveAs } from 'file-saver';
import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ClipboardCopyIcon, DownloadIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { DeleteAgentDialog } from "./DeleteAgentDialog";
import { getManifestContent } from "@/services/agents/agentsService";

interface PreviewYAMLContentProps {
  id: string;
  onDeleted: () => void;
  version?: string;
}

export function PreviewYAMLContent({ id, onDeleted, version = 'latest' }: PreviewYAMLContentProps) {
  const [content, setContent] = useState('')

  useEffect(() => {
    const fetchManifestContent = async () => {
      const manifestContent = await getManifestContent(id, version);
      setContent(manifestContent);
    };

    fetchManifestContent();
  }, [id, version]);

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

  const handleDownload = (): void => {
    const file = new File([content], 'manifest.yaml', { type: 'text/yaml' });
    saveAs(file);
  };
  

  return (
    <DialogContent
      className="w-[max(50%,640px)] max-w-[calc(100%-theme(spacing.12))] max-h-[calc(100%-theme(spacing.12))] overflow-auto grid-rows-[auto_minmax(256px,1fr)_auto]"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
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
        <DeleteAgentDialog id={id} onDeleted={onDeleted}/>
        <Button onClick={handleCopyRaw} variant={"secondary"} ><ClipboardCopyIcon className="mr-2" />Copy</Button>
        <Button onClick={handleCopyWithApply} variant={"secondary"}><ClipboardCopyIcon className="mr-2"/>Copy as "apply" command</Button>
        <Button onClick={handleDownload}><DownloadIcon className="mr-2"/>Download</Button>
      </DialogFooter>
    </DialogContent>
  )
}
