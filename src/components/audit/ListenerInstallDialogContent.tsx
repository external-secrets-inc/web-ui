import { trackListenerInstallCopyProcess, trackListenerInstallCopyKubernetes } from "@/analytics"
import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClipboardCopyIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import ListenerInstallScrollAreaTabContent from "./ListenerInstallScrollAreaTabContent"
import AuditAlert from "./AuditAlert"

interface ListenerInstallDialogContentProps {
  processFile: string;
  processCommand: string;
  applyCommand: string;
  openTab?: string;
}

function ListenerInstallDialogContent({ processFile, processCommand, applyCommand, openTab = '' }: ListenerInstallDialogContentProps) {
  const defaultTab = 'process';
  const [activeTab, setActiveTab] = useState(openTab?? defaultTab);

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

  const handleCopyProcess = () => {
    copyToClipboard(processCommand, "'bash' command");
    trackListenerInstallCopyProcess()
  }

  const handleCopyKubernetes = () => {
    copyToClipboard(applyCommand, "'apply' command");
    trackListenerInstallCopyKubernetes()
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
          <TabsTrigger value="process">Process</TabsTrigger>
          <TabsTrigger value="kubernetes">Kubernetes</TabsTrigger>
        </TabsList>
        <ListenerInstallScrollAreaTabContent
          value='process'
          description={
            <>
              Preview of the bash script to deploy this listener
            </>
          }
          scrollContent={processFile}
        />
        <ListenerInstallScrollAreaTabContent
          value='process'
          description={
            <>
              Run the command below to deploy this listener to your server
            </>
          }
          scrollContent={processCommand}
        >
          <AuditAlert description={
            <p>
              The provided URL in the <code>curl</code> command is a link to the listener installation file. It is piped to a <code>sh</code> command that will deploy it to server.
            </p>
          } />
        </ListenerInstallScrollAreaTabContent>
        <ListenerInstallScrollAreaTabContent
          value='kubernetes'
          description={
            <>
              Run the command below to deploy this listener to your Kubernetes cluster
            </>
          }
          scrollContent={applyCommand}
        >
          <AuditAlert description={
            <p>
              The provided URL in the <code>curl</code> command is a link to the listener manifest file. It is piped to a <code>kubectl apply</code> command that will apply it to your cluster.
            </p>
          } />
        </ListenerInstallScrollAreaTabContent>
      </Tabs>
      <DialogFooter>
        {activeTab === 'process' &&
          <Button onClick={handleCopyProcess}>
            <ClipboardCopyIcon className="mr-2" />Copy
          </Button>
        }
        {activeTab === 'kubernetes' &&
          <Button onClick={handleCopyKubernetes}>
            <ClipboardCopyIcon className="mr-2" />Copy
          </Button>
        }
      </DialogFooter>
    </DialogContent>
  )
}

export default ListenerInstallDialogContent
