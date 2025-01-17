import { trackFeatureCopyRawYAML, trackFeatureCopyYAMLWithApplyCommand, trackFeatureDownloadYAML } from "@/analytics"
import { FeatureItemDeleteAction } from "@/components/FeatureCollection/FeatureItemDeleteAction"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import saveAs from "file-saver"
import { ClipboardCopyIcon, DownloadIcon, LucideInfo, Trash2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { STATUS_MAP } from "@/components/FeatureCollection/FeatureCollection.constants";

interface FeatureItemDialogContentProps {
  featureID: string;
  featureName: string;
  featureType: string;
  featureDescription: string;
  featureStatus: string;
  isPending: boolean;
  activeTab: string;
  manifest: string;
  applyCommand: string;
  setActiveTab: (tab: string) => void;
  onDeleted: () => void;
}

function FeatureItemDialogContent({featureID, featureName, featureType, featureDescription, featureStatus, isPending, activeTab, manifest, applyCommand, setActiveTab, onDeleted} : FeatureItemDialogContentProps) {
  const [internalTab, setInternalTab] = useState(activeTab);

  useEffect(() => {
    setInternalTab(activeTab);
  }, [activeTab]);

  const onTabChange = (value: string) => {
    setInternalTab(value);
    setActiveTab(value);
  };

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
    copyToClipboard(manifest, 'raw YAML manifest');
    trackFeatureCopyRawYAML(featureType, featureID)
  }

  const handleCopyWithApply = () => {
    copyToClipboard(applyCommand, "'apply' command");
    trackFeatureCopyYAMLWithApplyCommand(featureType, featureID)
  };

  const handleDownload = (): void => {
    const file = new File([manifest], 'manifest.yaml', { type: 'text/yaml' });
    saveAs(file);
    trackFeatureDownloadYAML(featureType, featureID)
  };

  return (
    <div
      className="contents"
      onClick={(e) => e.stopPropagation()}
    >
      <DialogContent className="w-[max(50%,640px)] max-w-[calc(100%-theme(spacing.12))] max-h-[calc(100%-theme(spacing.12))] overflow-auto grid-rows-[auto_minmax(100px,1fr)_auto] grid-cols-[minmax(100%,1fr)]">
        <DialogHeader>
          <DialogTitle>{featureName}</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <Tabs
          onValueChange={onTabChange}
          value={internalTab}
          className="grid grid-rows-[auto_1fr]"
        >
          <TabsList className="mb-2 w-fit">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="manifest">Manifest</TabsTrigger>
            <TabsTrigger value="apply">Applying</TabsTrigger>
          </TabsList>
          <TabsContent className="data-[state=active]:grid min-h-0" value="details" >
            <p className="text-muted-foreground text-sm mb-2">
              {featureDescription}
            </p>
            <div className="grid gap-4 border-y py-5">
              <div className="grid md:grid-cols-3">
                <span className="text-muted-foreground">
                  ID
                </span>
                <span className="col-span-2">
                  {featureID}
                </span>
              </div>
              <div className="grid md:grid-cols-3">
                <span className="text-muted-foreground">
                  Current Status
                </span>
                <span className="flex col-span-2 gap-2 items-center">
                  {STATUS_MAP[featureStatus].icon}
                  {STATUS_MAP[featureStatus].text}
                </span>
              </div>
            </div>
            {isPending &&
              <Alert
                variant="warning"
                className="mt-4"
              >
                <AlertTitle className="flex gap-2 items-center">
                {STATUS_MAP[featureStatus].icon}<p><span className="capitalize">{featureType}</span> is not active</p>
                </AlertTitle>
                <AlertDescription>
                  You need to apply the <span className="lowercase">{featureType}</span> manifest file to your cluster in order to activate it. Follow the instructions on the <Button className="underline" variant="ghost" size="inline" onClick={() => setActiveTab('apply')}>Applying tab</Button>
                </AlertDescription>
              </Alert>
            }
          </TabsContent>
          <TabsContent className="data-[state=active]:grid min-h-0" value="manifest">
            <p className="text-muted-foreground text-sm mb-2">
              Below is a preview of the manifest file you apply to your Kubernetes cluster in order to deploy this <span className="lowercase">{featureType}</span>
            </p>
            <ScrollArea className='rounded-lg border'>
              <pre>
                <code className="flex flex-col">
                  <span>{manifest}</span>
                </code>
              </pre>
              <ScrollBar orientation='horizontal'/>
            </ScrollArea>
          </TabsContent>
          <TabsContent className="data-[state=active]:grid min-h-0" value="apply">
              <p className="text-muted-foreground text-sm mb-2">
                Run the command below to deploy this <span className="lowercase">{featureType}</span> to your Kubernetes cluster
              </p>
            <ScrollArea className='rounded-lg border'>
              <pre>
                <code className="flex flex-col">
                  <span>{applyCommand}</span>
                </code>
              </pre>
              <ScrollBar orientation='horizontal'/>
            </ScrollArea>
            <Alert className="mt-4">
              <AlertDescription className="flex gap-2 items-center">
                <LucideInfo className="flex-none" />
                <p>
                  The provided URL in the <code>curl</code> command is a link to the <span className="lowercase">{featureType}</span> manifest file. It is piped to a <code>kubectl apply</code> command that will apply it to your cluster.
                </p>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          {activeTab === 'details' &&
            <FeatureItemDeleteAction
              featureType={featureType}
              featureID={featureID}
              featureName={featureName}
              onDelete={onDeleted}
            >
              <Button variant="destructive">
                <Trash2Icon className="mr-2" />
                Delete {featureType}
              </Button>
            </FeatureItemDeleteAction>
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
    </div>
  )
}

export default FeatureItemDialogContent