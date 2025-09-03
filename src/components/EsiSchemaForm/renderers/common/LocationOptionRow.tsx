import { Badge } from "@/components/ui/badge";
import { LucideAsteriskSquare, LucideAtSign } from "lucide-react";
import type { LocationApiOption } from "./Location.interfaces";

type Props = {
  label: string;
  checkboxNode?: React.ReactNode;
  decoded?: LocationApiOption | null;
};

export function LocationOptionRow({ label, checkboxNode, decoded }: Props) {
  const hasProperty = Boolean(decoded?.remoteRef?.property);
  const storeName = decoded?.name || "Unknown Store";
  const keyPath = decoded?.remoteRef?.key;
  const dominantKey = keyPath || label;

  return (
    <div className="flex items-center gap-2 w-full">
      {checkboxNode}
      <LucideAsteriskSquare className="text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="font-medium text-foreground truncate">
          {dominantKey}
          {hasProperty && (
            <span className="leading-none font-bold text-muted-foreground">
              .{decoded?.remoteRef?.property}
            </span>
          )}
        </span>

        <Badge variant="outline" className="flex items-center gap-1 pl-1.5">
          <LucideAtSign className="size-3 text-muted-foreground" />
          {storeName}
        </Badge>
      </div>
    </div>
  );
}
