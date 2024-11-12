import { trackFeatureCopyRawYAML, trackFeatureCopyYAMLWithApplyCommand, trackFeatureDownloadYAML } from "@/analytics"
import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import saveAs from "file-saver"
import { ClipboardCopyIcon, DownloadIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import ListenerInstallTabContent from "./ListenerInstallTabContent.tsx"
import ListenerInstallAlert from "./ListenerInstallAlert.tsx"

interface ListenerInstallDialogContentProps {
  id: string;
  listenerName: string;
  featureType: string;
  content: string;
  applyCommand: string;
  openTab?: string;
}

function ListenerInstallDialogContent({ id, listenerName, featureType, content, applyCommand, openTab = '' }: ListenerInstallDialogContentProps) {
  const defaultTab = 'manifest';
  const [activeTab, setActiveTab] = useState(openTab || defaultTab);

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

  const handleCopyRaw = () => {
    copyToClipboard(content, 'raw YAML manifest');
    trackFeatureCopyRawYAML(featureType, id)
  }

  const handleCopyWithApply = () => {
    copyToClipboard(applyCommand, "'apply' command");
    trackFeatureCopyYAMLWithApplyCommand(featureType, id)
  };

  const handleDownload = (): void => {
    const file = new File([content], 'manifest.yaml', { type: 'text/yaml' });
    saveAs(file);
    trackFeatureDownloadYAML(featureType, id)
  };

  return (
    <DialogContent
      className="w-[max(50%,640px)] max-w-[calc(100%-theme(spacing.12))] max-h-[calc(100%-theme(spacing.12))] overflow-auto grid-rows-[auto_minmax(100px,1fr)_auto] grid-cols-[minmax(100%,1fr)]"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <DialogHeader>
        <DialogTitle>{listenerName}</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <Tabs
        defaultValue={defaultTab}
        onValueChange={onTabChange}
        value={activeTab}
        className="grid grid-rows-[auto_1fr]"
      >
        <TabsList className="mb-2 w-fit">
          <TabsTrigger value="manifest">Manifest</TabsTrigger>
          <TabsTrigger value="apply">Applying</TabsTrigger>
        </TabsList>
        <ListenerInstallTabContent
          value='manifest'
          description={
            <>
              Below is a preview of the manifest file you apply to your Kubernetes cluster in order to deploy this <span className="lowercase">{featureType}</span>
            </>
          }
          scrollContent={content}
        />
        <ListenerInstallTabContent
          value='apply'
          description={
            <>
              Run the command below to deploy this <span className="lowercase">{featureType}</span> to your Kubernetes cluster
            </>
          }
          scrollContent={applyCommand}
        >
          <ListenerInstallAlert description={
            <p>
              The provided URL in the <code>curl</code> command is a link to the <span className="lowercase">{featureType}</span> manifest file. It is piped to a <code>kubectl apply</code> command that will apply it to your cluster.
            </p>
          } />
        </ListenerInstallTabContent>
      </Tabs>
      <DialogFooter>
        {activeTab === 'manifest' &&
          <>
            <Button onClick={handleCopyRaw} variant="secondary">
              <ClipboardCopyIcon className="mr-2" />Copy
            </Button>
            <Button onClick={handleDownload}><DownloadIcon className="mr-2" />
              Download
            </Button>
          </>
        }
        {activeTab === 'apply' &&
          <Button onClick={handleCopyWithApply}>
            <ClipboardCopyIcon className="mr-2" />Copy
          </Button>
        }
      </DialogFooter>
    </DialogContent>
  )
}

export default ListenerInstallDialogContent
