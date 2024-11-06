import { FeatureItemDeleteAction } from "@/components/FeatureCollection/FeatureItemDeleteAction";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LucideMoreVertical, LucideSquareArrowOutUpRight, LucideTrash2 } from "lucide-react";

interface FeatureItemDropdownMenuProps {
  featureType: string;
  featureName: string;
  featureID: string;
  onPreviewYaml: () => void;
  onDelete: () => void;
}

function FeatureItemDropdownMenu({
  featureType,
  featureName,
  featureID,
  onPreviewYaml,
  onDelete
}: FeatureItemDropdownMenuProps) {
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
        <FeatureItemDeleteAction
          featureType={featureType}
          featureID={featureID}
          featureName={featureName}
          onDelete={onDelete}
        >
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <LucideTrash2 className="mr-2" />
            Delete {featureType}
          </DropdownMenuItem>
        </FeatureItemDeleteAction>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default FeatureItemDropdownMenu;
