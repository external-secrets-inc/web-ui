import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useGetFindings from "@/services/findings/queries/useGetFindings";
import { LucideLocateFixed } from "lucide-react";
export function FindingsCountBadge() {
  const { data, isLoading, isError } = useGetFindings();

  if (isLoading || isError) return null;

  const findingsCount = data?.length ?? 0;

  if (findingsCount <= 0) return null;

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className="inline-flex items-center gap-2 text-xs leading-none font-mono font-bold px-1.5 -mr-1.5"
        >
          {findingsCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <LucideLocateFixed className="!text-muted-foreground -ml-0.5 my-px" />
              {String(findingsCount)}
            </span>
          )}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <LucideLocateFixed className="size-5 text-muted-foreground -ml-0.5 my-px" />{" "}
          {findingsCount > 0 &&
            `${findingsCount} ${
              findingsCount === 1 ? "unique finding" : "unique findings"
            }`}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
