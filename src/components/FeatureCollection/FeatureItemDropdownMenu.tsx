import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LucideMoreVertical, LucideSquareArrowOutUpRight, LucideTrash2 } from "lucide-react";

interface FeatureItemDropdownMenuProps {
  onPreviewYaml: () => void;
  onDelete: () => void;
}

function FeatureItemDropdownMenu({ onPreviewYaml, onDelete }: FeatureItemDropdownMenuProps) {
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
}

export default FeatureItemDropdownMenu;
