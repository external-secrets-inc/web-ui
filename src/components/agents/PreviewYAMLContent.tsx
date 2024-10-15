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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


interface PreviewYAMLContentProps {
  id: string;
  onDeleted: () => void;
  version?: string;
  agentName: string;
  status: {
    text: string;
    icon: React.ReactNode;
  };
  activeTab: string;
  setActiveTab: (tab: string) => void;
}


export function PreviewYAMLContent({
  id,
  onDeleted,
  version = 'latest',
  agentName,
  status,
  activeTab,
  setActiveTab,
}: PreviewYAMLContentProps) {
  const defaultTab = 'details';
  const isPending = status.text === 'Provisioning' || status.text === 'Pending Registration';
  const [content, setContent] = useState('')
  const [applyCommand, setApplyCommand] = useState('');

  const onTabChange = (value: string) => {
    setActiveTab(value);
  }

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

  useEffect(() => {
    return () => {
      setActiveTab(defaultTab);
    };
  }, []);

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
        <Tabs
          defaultValue={defaultTab}
          onValueChange={onTabChange}
          value={activeTab}
          className="grid grid-rows-[auto_1fr]"
        >
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="manifest">Manifest</TabsTrigger>
              <TabsTrigger value="apply">Applying</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent className="data-[state=active]:grid min-h-0 gap-4 mt-10" value="details" >
            <div className="grid md:grid-cols-3">
              <span className="text-muted-foreground">
                ID
              </span>
              <span className="col-span-2">
                {id}
              </span>
            </div>

            <div className="grid md:grid-cols-3">
              <span className="text-muted-foreground">
                Current Status
              </span>
              <span className="flex col-span-2 gap-2 items-center">
                {status.icon}
                {status.text}
              </span>
            </div>

            {isPending &&
              <Alert
                variant="warning"
                className="mt-4"
              >
                <AlertTitle>
                  Agent is not active
                </AlertTitle>
                <AlertDescription>
                  You need to apply the agent manifest file to your cluster in order to activate it. Follow the instructions on the <Button className="underline" variant="ghost" size="inline" onClick={() => setActiveTab('apply')}>Applying tab</Button>.
                </AlertDescription>
              </Alert>
            }
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
              <Button onClick={handleCopyRaw} variant="secondary">
                <ClipboardCopyIcon className="mr-2" />Copy
              </Button>
              <Button onClick={handleDownload}><DownloadIcon className="mr-2"/>
                Download
              </Button>
            </>
          }
          {activeTab === 'apply' &&
            <Button onClick={handleCopyWithApply}>
              <ClipboardCopyIcon className="mr-2"/>Copy
            </Button>
          }
        </DialogFooter>
    </DialogContent>
  )
}