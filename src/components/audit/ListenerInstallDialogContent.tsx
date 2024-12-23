import { trackListenerInstallCopyBash, trackListenerInstallCopyKubernetes } from "@/analytics"
import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LucideInfo } from "lucide-react"
import { ClipboardCopyIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import DescribedScrollArea from "./DescribedScrollArea"

interface ListenerInstallDialogContentProps {
  id: string;
  bashFileContent: string;
  isLoadingBashFile: boolean;
  bashCommand: string;
  manifestCommand: string;
  openTab?: string;
}

function ListenerInstallDialogContent({ id, bashFileContent, isLoadingBashFile, bashCommand, manifestCommand, openTab }: ListenerInstallDialogContentProps) {
  const defaultTab = 'bash';
  const [activeTab, setActiveTab] = useState(openTab ?? defaultTab);

  const onTabChange = (value: string) => {
    setActiveTab(value);
  }

  const copyToClipboard = async (text: string, kind: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${kind}`, {
        cancel: {
          label: 'Dismiss',
          onClick: () => { },
        },
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  const handleCopyBash = () => {
    copyToClipboard(bashCommand, "'bash' command");
    trackListenerInstallCopyBash(id)
  }

  const handleCopyKubernetesManifest = () => {
    copyToClipboard(manifestCommand, "'manifest' command");
    trackListenerInstallCopyKubernetes(id)
  };

  return (
    <DialogContent
      className="w-[max(50%,640px)] max-w-[calc(100%-theme(spacing.12))] max-h-[calc(100%-theme(spacing.12))] overflow-auto grid-rows-[auto_minmax(100px,1fr)_auto] grid-cols-[minmax(100%,1fr)]"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <DialogHeader>
        <DialogTitle>Install listener</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <Tabs
        defaultValue={defaultTab}
        onValueChange={onTabChange}
        value={activeTab}
        className="grid grid-rows-[auto_1fr]"
      >
        <TabsList className="mb-2 w-fit">
          <TabsTrigger value="bash">Bash</TabsTrigger>
          <TabsTrigger value="kubernetes">Kubernetes</TabsTrigger>
        </TabsList>
        <TabsContent className="data-[state=active]:grid min-h-0" value="bash">
          <DescribedScrollArea
            description='Preview of the bash script to deploy this listener'
            content={bashFileContent}
            isLoadingContent={isLoadingBashFile}
          />
          <DescribedScrollArea
            description='Run the command below to deploy this listener to your server'
            content={bashCommand}
          />
          <Alert className="mt-4">
            <AlertDescription className="flex gap-2 items-center">
              <LucideInfo className="flex-none" />
              <p>
                The provided URL in the <code>curl</code> command is a link to the bash installation file content. It is piped to a <code>bash</code> command that will run it and deploy it to server.
              </p>
            </AlertDescription>
          </Alert>
        </TabsContent>
        <TabsContent className="data-[state=active]:grid min-h-0" value="kubernetes">
          <DescribedScrollArea
            description='Run the command below to deploy this listener to your Kubernetes cluster'
            content={manifestCommand}
          />
          <Alert className="mt-4">
            <AlertDescription className="flex gap-2 items-center">
              <LucideInfo className="flex-none" />
              <p>
                The provided URL in the <code>curl</code> command is a link to the listener manifest file. It is piped to a <code>kubectl apply</code> command that will apply it to your cluster.
              </p>
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
      <DialogFooter>
        {activeTab === 'bash' &&
          <Button onClick={handleCopyBash}>
            <ClipboardCopyIcon className="mr-2" />Copy
          </Button>
        }
        {activeTab === 'kubernetes' &&
          <Button onClick={handleCopyKubernetesManifest}>
            <ClipboardCopyIcon className="mr-2" />Copy
          </Button>
        }
      </DialogFooter>
    </DialogContent>
  )
}

export default ListenerInstallDialogContent
