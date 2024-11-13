import { FeatureItemDeleteAction } from "@/components/FeatureCollection/FeatureItemDeleteAction";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LucideMoreVertical, LucideSquareArrowOutUpRight, LucideTrash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import FeatureItemOpenAction from "@/components/FeatureCollection/FeatureItemOpenAction";

interface FeatureItemDropdownMenuProps {
  featureType: string;
  featureName: string;
  featureID: string;
  onDeleteFeature: () => void;
  className?: string;
  featureStatus: string;
  featureDescription: string;
  manifest: string;
  applyCommand: string;
  setFeatureID: (value: string) => void;
}

function FeatureItemDropdownMenu({
  featureType,
  featureName,
  featureID,
  onDeleteFeature,
  className,
  featureStatus,
  featureDescription,
  manifest,
  applyCommand,
  setFeatureID,
}: FeatureItemDropdownMenuProps) {
  const [hasFeatureDialogOpen, setHasFeatureDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const handleOpenDetails = (event: Event) => {
    event.preventDefault();
    setHasFeatureDialogOpen(true);
  };

  useEffect(() => {
    if (!hasFeatureDialogOpen) {
      setDropdownOpen(false);
    }
  }, [hasFeatureDialogOpen]);

  return (
    <DropdownMenu
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      modal={false}
    >
      <DropdownMenuTrigger className={cn(className)} asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(event) => event.stopPropagation()}
        >
          <LucideMoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onClick={(event) => event.stopPropagation()}
        onCloseAutoFocus={() => setDropdownOpen(false)}
      >
        <FeatureItemOpenAction
          featureID={featureID}
          featureName={featureName}
          featureStatus={featureStatus}
          featureType={featureType}
          featureDescription={featureDescription}
          manifest={manifest}
          applyCommand={applyCommand}
          setFeatureID={setFeatureID}
          onDeleteFeature={onDeleteFeature}
          isOpen={hasFeatureDialogOpen}
          onOpenChange={setHasFeatureDialogOpen}
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
        >
          <DropdownMenuItem onSelect={(event) => handleOpenDetails(event)}>
            <LucideSquareArrowOutUpRight className="mr-2" />
            Open details
          </DropdownMenuItem>
        </FeatureItemOpenAction>

        <FeatureItemDeleteAction
          featureType={featureType}
          featureID={featureID}
          featureName={featureName}
          onDelete={onDeleteFeature}
        >
          <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
            <LucideTrash2 className="mr-2" />
            Delete {featureType}
          </DropdownMenuItem>
        </FeatureItemDeleteAction>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default FeatureItemDropdownMenu;
