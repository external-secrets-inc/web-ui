import { FeatureItemDeleteAction } from "@/components/FeatureCollection/FeatureItemDeleteAction";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LucideMoreVertical, LucideSquareArrowOutUpRight, LucideTrash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useFeatureItemDialog } from "./FeatureItemDialogProvider";

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
}: Omit<FeatureItemDropdownMenuProps, 'setFeatureID'>) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { openFeatureItemDialog } = useFeatureItemDialog();

  const handleOpenDetails = (event: Event) => {
    event.preventDefault();
    setDropdownOpen(false);
    openFeatureItemDialog({
      featureID,
      featureName,
      featureStatus,
      featureType,
      featureDescription,
      manifest,
      applyCommand,
      activeTab: 'details'
    });
  };

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen} modal={false}>
      <DropdownMenuTrigger className={cn(className)} asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(event) => event.stopPropagation()}
        >
          <LucideMoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={handleOpenDetails}>
          <LucideSquareArrowOutUpRight className="mr-2" />
          Open details
        </DropdownMenuItem>
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
