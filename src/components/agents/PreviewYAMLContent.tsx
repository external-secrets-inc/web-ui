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
import { getManifestContent, createManifestToken } from "@/services/agents/agentsService";
import { trackCopyRawYAML, trackCopyYAMLWithApplyCommand, trackDownloadYAML } from "@/analytics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { API_DOMAIN } from '@/constants';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';


interface PreviewYAMLContentProps {
  id: string;
  onDeleted: () => void;
  version?: string;
  agentName: string;
  currentStatus: string;
}

export function PreviewYAMLContent({ id, onDeleted, version = 'latest', agentName, currentStatus }: PreviewYAMLContentProps) {
  const [content, setContent] = useState('')
  const [activeTab, setActiveTab] = useState('details');
  const [applyCommand, setApplyCommand] = useState('');

  useEffect(() => {
    const fetchManifestContent = async () => {
      const manifestContent = await getManifestContent(id, version);
      setContent(manifestContent);
    };

    const generateApplyCommand = async () => {
      const token = await createManifestToken(id);
      const command = [
        "curl \\",
        `${API_DOMAIN}/public/agents/${id}/manifest/${version}\\`,
        `?token=${token} \\`,
        "| kubectl apply -f -",
      ].join('\n');
      setApplyCommand(command);
    };

    fetchManifestContent();
    generateApplyCommand();
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
    trackCopyRawYAML(id);
  }

  const handleCopyWithApply = () => {
    copyToClipboard(applyCommand, "curl with 'kubectl apply'");
    trackCopyYAMLWithApplyCommand(id);
  };

  const handleDownload = (): void => {
    const file = new File([content], 'manifest.yaml', { type: 'text/yaml' });
    saveAs(file);
    trackDownloadYAML(id);
  };

  return (
    <DialogContent
      className="w-[max(50%,640px)] max-w-[calc(100%-theme(spacing.12))] max-h-[calc(100%-theme(spacing.12))] overflow-auto grid-rows-[auto_minmax(100px,1fr)_auto] grid-cols-[minmax(100%,1fr)]"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <DialogHeader>
        <DialogTitle>{agentName}</DialogTitle>
        <DialogDescription>
          Apply this manifest to your cluster to activate your agents
        </DialogDescription>
      </DialogHeader>
        <Tabs defaultValue="details" onValueChange={setActiveTab} className="grid grid-rows-[auto_1fr]">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="manifest">Manifest</TabsTrigger>
              <TabsTrigger value="apply">Applying</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent className="not:[hidden]:grid min-h-0" value="details" >
            <p>{currentStatus}</p> {/* TODO: Improve this */}
          </TabsContent>
          <TabsContent className="data-[state=active]:grid min-h-0" value="manifest" >
            <ScrollArea className='rounded-lg border'>
              <pre>
                <code className="flex flex-col">
                  <span>{content}</span>
                </code>
              </pre>
              <ScrollBar orientation='horizontal'/>
            </ScrollArea>
          </TabsContent>
          <TabsContent className="data-[state=active]:grid min-h-0" value="apply" >
            <ScrollArea className='rounded-lg border'>
              <pre>
                <code className="flex flex-col">
                  <span>{applyCommand}</span>
                </code>
              </pre>
              <ScrollBar orientation='horizontal'/>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          {activeTab === 'details' &&
            <DeleteAgentDialog id={id} onDeleted={onDeleted} />
          }
          {activeTab === 'manifest' &&
            <>
              <Button onClick={handleCopyRaw} variant={"secondary"} ><ClipboardCopyIcon className="mr-2" />Copy</Button>
              <Button onClick={handleDownload}><DownloadIcon className="mr-2"/>Download</Button>
            </>
          }
          {activeTab === 'apply' &&
            <Button onClick={handleCopyWithApply} variant={"secondary"}><ClipboardCopyIcon className="mr-2"/>Copy</Button>
          }
        </DialogFooter>
    </DialogContent>
  )
}