import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useGetFindings from "@/services/findings/queries/useGetFindings";
import { LucideRadar } from "lucide-react";
export function FindingsCountBadge() {
  const { data, isLoading, isError } = useGetFindings();

  if (isLoading || isError) return null;

  const findingsCount = data?.length ?? 0;

  if (findingsCount <= 0) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="secondary"
          className="inline-flex items-center gap-2 text-[10px] leading-none font-mono font-bold px-1.5 -mr-1"
        >
          {findingsCount > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <LucideRadar className="!text-muted-foreground -ml-0.5 my-px size-3" />
              {String(findingsCount)}
            </span>
          )}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <LucideRadar className="!text-muted-foreground -ml-0.5 my-px" />{" "}
          {findingsCount > 0 &&
            `${findingsCount} ${
              findingsCount === 1 ? "unique finding" : "unique findings"
            }`}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
