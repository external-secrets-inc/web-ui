import { trackFeatureDeleteDialogOpened, trackFeatureYamlDialogOpened } from "@/analytics";
import DeleteFeatureDialogContent from "@/components/FeatureList/DeleteFeatureDialogContent";
import FeatureDialogContent from "@/components/FeatureList/FeatureDialogContent";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { LucideAlertCircle, LucideCheckCircle, LucideMoreVertical, LucideSquareArrowOutUpRight, LucideTrash2, LucideXCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface FeatureDropdownProps {
  onPreviewYaml: () => void;
  onDelete: () => void;
}

const FeatureDropdown: React.FC<FeatureDropdownProps> = ({ onPreviewYaml, onDelete }) => {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="absolute top-4 right-4"
          variant="ghost"
          size="icon"
          onClick={(event) => event.stopPropagation()}
        >
          <LucideMoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onClick={(event) => event.stopPropagation()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DropdownMenuItem onSelect={onPreviewYaml}>
          <LucideSquareArrowOutUpRight className="mr-2" />
          Open details
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onDelete}>
          <LucideTrash2 className="mr-2" />
          Delete agent
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface FeatureDetailsCardDialogProps {
  featureID: string;
  featureName: string;
  featureStatus: string;
  featureType: string;
  featureDescription: string;
  manifest: string;
  applyCommand: string;
  setFeatureId: (value: string) => void;
  onDeleteFeature: (featureId: string) => void;
}

const STATUS_MAP: { [key: string]: { text: string, icon: React.ReactNode } } = {
  "PROVISIONING": {
    text: "Provisioning",
    icon: <LucideAlertCircle className="text-orange-500"/>
  },
  "PENDING_REGISTRATION": {
    text: "Pending Registration",
    icon: <LucideAlertCircle className="text-orange-500"/>
  },
  "ACTIVE": {
    text: "Active",
    icon: <LucideCheckCircle className="text-green-700" />
  },
  "OFFLINE": {
    text: "Offline",
    icon: <LucideXCircle className="text-muted-foreground" />
  },
  "PENDING_DELETION": {
    text: "Pending Deletion",
    icon: <LucideTrash2 className="text-destructive"/>
  },
  "DELETED": {
    text: "Deleted",
    icon: <LucideAlertCircle className="text-destructive"/>
  }
};

function FeatureDetailsCardDialog({ featureID, featureName, featureStatus, featureType, featureDescription, setFeatureId, applyCommand, manifest, onDeleteFeature} : FeatureDetailsCardDialogProps) {
  const isPending = ['PENDING_REGISTRATION', 'PROVISIONING'].includes(featureStatus.toUpperCase());
  const [isFeatureContentDialogOpen, setIsFeatureContentDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeContentTab, setActiveContentTab] = useState('details');

  const status = STATUS_MAP[featureStatus] || { text: featureStatus, icon: null };

  const handleYamlDialogOpenChange = (isOpen: boolean) => {
    setIsFeatureContentDialogOpen(isOpen);
    setFeatureId(featureID);
    if (!isOpen) {
      setActiveContentTab('details');
      setFeatureId("")
    }
  };

  const handleDeleteFeature = () => {
    onDeleteFeature(featureID)
  }

  const handleApplyButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFeatureId(featureID);
    setActiveContentTab('apply');
    setIsFeatureContentDialogOpen(true);
  };
  
  useEffect(() => {
    if (isFeatureContentDialogOpen) {
      trackFeatureYamlDialogOpened(featureType, featureID, featureName);
    }
  }, [isFeatureContentDialogOpen, featureType, featureID, featureName]);

  useEffect(() => {
    if (isDeleteDialogOpen) {
      trackFeatureDeleteDialogOpened(featureType, featureName, "dropdown");
    }
  }, [isDeleteDialogOpen, featureType, featureName]);

  return (
    <>
      <Dialog open={isFeatureContentDialogOpen} onOpenChange={handleYamlDialogOpenChange}>
        <DialogTrigger asChild>
          <Card className="group flex flex-col relative hover:border-muted-foreground/50 hover:bg-muted/15 transition-all" asChild>
            <div>
              <CardHeader className="text-left">
                <CardTitle className="flex">
                  <div className="grow">{featureName}</div>
                  <FeatureDropdown
                    onPreviewYaml={() => setIsFeatureContentDialogOpen(true)}
                    onDelete={() => setIsDeleteDialogOpen(true)}
                  />
                </CardTitle>
                <div className="text-sm text-slate-500">{featureID}</div>
              </CardHeader>
              <CardFooter className='mt-auto gap-2'>
                  <span className='flex gap-2 items-center'>
                    {status.icon}
                    {status.text}
                  </span>
                  {isPending &&
                    <Button
                      size="default"
                      className="ml-auto"
                      onClick={handleApplyButtonClick}
                    >
                      Apply
                    </Button>
                  }
              </CardFooter>
            </div>
          </Card>
        </DialogTrigger>
        <FeatureDialogContent 
          activeTab={activeContentTab}
          setActiveTab={setActiveContentTab}
          id={featureID}
          featureName={featureName}
          status={status}
          onDeleted={handleDeleteFeature}
          content={manifest}
          applyCommand={applyCommand}
          featureType={featureType}
          featureDescription={featureDescription}
        />
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DeleteFeatureDialogContent featureName={featureName} featureType={featureType} featureID={featureID} onDelete={handleDeleteFeature} />
      </Dialog>
    </>
  )
}

export default FeatureDetailsCardDialog;