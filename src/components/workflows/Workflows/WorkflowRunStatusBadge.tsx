import {
  LucideCircleAlert,
  LucideCircleCheck,
  LucideClock,
  LucideShieldQuestion,
  LucideTimer,
  LucideCalendarClock,
  LucideCalendarCheck2,
} from "lucide-react";
import { formatDate, formatDuration } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/Loader";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import useOrgLink from "@/hooks/useOrgLink";
import type { WorkflowRunData } from "./Workflows.interfaces";
import { useState, useEffect } from "react";

const STATUS_CONFIG = {
  Pending: {
    variant: "outline" as const,
    icon: <LucideClock />,
    tooltipTextColor: "text-foreground" as const,
    tooltipIconColor: "text-foreground" as const,
  },
  Running: {
    variant: "default" as const,
    icon: <Loader />,
    tooltipTextColor: "text-foreground" as const,
    tooltipIconColor: "text-primary-400" as const,
  },
  Succeeded: {
    variant: "success" as const,
    icon: <LucideCircleCheck />,
    tooltipTextColor: "text-success" as const,
    tooltipIconColor: "text-success" as const,
  },
  Failed: {
    variant: "destructive" as const,
    icon: <LucideCircleAlert />,
    tooltipTextColor: "text-destructive" as const,
    tooltipIconColor: "text-destructive" as const,
  },
} as const;

const DEFAULT_STATUS = {
  variant: "outline" as const,
  icon: <LucideShieldQuestion />,
  tooltipTextColor: "text-muted-foreground" as const,
  tooltipIconColor: "text-muted-foreground" as const,
};

interface LiveDurationProps {
  startTime?: string;
}

function LiveDuration({ startTime }: LiveDurationProps) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setElapsedMs(0);
      return;
    }

    const startDate = new Date(startTime);
    const now = new Date();

    if (startDate > now) {
      setElapsedMs(0);
      return;
    }

    const updateElapsed = () => {
      const currentNow = new Date();
      setElapsedMs(currentNow.getTime() - startDate.getTime());
    };

    updateElapsed();
    const intervalToUpdateElapsed = setInterval(updateElapsed, 20);

    return () => clearInterval(intervalToUpdateElapsed);
  }, [startTime]);

  if (!startTime || new Date(startTime) > new Date()) {
    return null;
  }

  return <>{formatDuration(elapsedMs * 1000000)}</>;
}

interface WorkflowRunStatusIndicatorProps {
  isLastRun: boolean;
  run: WorkflowRunData;
}

function WorkflowRunStatusIndicator({ isLastRun, run }: WorkflowRunStatusIndicatorProps) {
  if (!isLastRun && run.phase !== "Pending") {
    return null;
  }

  return (
    <div className="flex items-center gap-2 justify-between">
      {isLastRun && (
        <div className="text-xs text-muted-foreground">Latest run</div>
      )}
      {run.phase === "Pending" && (
        <div className="text-xs text-muted-foreground">
          Waiting to start
        </div>
      )}
    </div>
  );
}

interface WorkflowRunExecutionTimeProps {
  run: WorkflowRunData;
}

function WorkflowRunExecutionTime({ run }: WorkflowRunExecutionTimeProps) {
  const hasCompletedExecution = run.executionTimeNanos && run.executionTimeNanos > 0;
  const isCurrentlyRunning = run.startTime && (run.phase === "Pending" || run.phase === "Running");

  if (!hasCompletedExecution && !isCurrentlyRunning) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-foreground">
      <LucideTimer className="text-primary-400" />
      {hasCompletedExecution ? (
        <div>
          Took{" "}
          <span className="text-muted-foreground font-mono min-w-[9ch] inline-flex">
            {formatDuration(run.executionTimeNanos!)}
          </span>
        </div>
      ) : (
        <div>
          Running for{" "}
          <span className="text-muted-foreground font-mono min-w-[9ch] inline-flex">
            <LiveDuration startTime={run.startTime} />
          </span>
        </div>
      )}
    </div>
  );
}

interface WorkflowRunStartTimeProps {
  run: WorkflowRunData;
}

function WorkflowRunStartTime({ run }: WorkflowRunStartTimeProps) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-start gap-2 text-foreground">
      <LucideCalendarClock className="text-primary-400" />
      <span>
        Started on
        <br />
        <span className="text-muted-foreground">
          {formatDate(run.startTime!, {
            format: "readableDateNoTime",
          })}
          <br />
          <span className="text-foreground font-sans">at</span>{" "}
          {formatDate(run.startTime!, { format: "timeOnly" })}
        </span>
      </span>
    </div>
  );
}

interface WorkflowRunCompletionTimeProps {
  run: WorkflowRunData;
}

function WorkflowRunCompletionTime({ run }: WorkflowRunCompletionTimeProps) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-start gap-2 text-foreground">
      <LucideCalendarCheck2 className="text-primary-400" />
      <span>
        Completed on
        <br />
        <span className="text-muted-foreground">
          {formatDate(run.completionTime!, {
            format: "readableDateNoTime",
          })}
          <br />
          <span className="text-foreground font-sans">at</span>{" "}
          {formatDate(run.completionTime!, { format: "timeOnly" })}
        </span>
      </span>
    </div>
  );
}

interface WorkflowRunStatusDisplayProps {
  run: WorkflowRunData;
  statusConfig: typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG] | typeof DEFAULT_STATUS;
}

function WorkflowRunStatusDisplay({ run, statusConfig }: WorkflowRunStatusDisplayProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-foreground",
        statusConfig.tooltipIconColor
      )}
    >
      {statusConfig.icon}
      <span
        className={cn("font-medium", statusConfig.tooltipTextColor)}
      >
        {run.phase}
      </span>
    </div>
  );
}

interface WorkflowRunTooltipContentProps {
  run: WorkflowRunData;
  isLastRun: boolean;
  statusConfig: typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG] | typeof DEFAULT_STATUS;
}

function WorkflowRunTooltipContent({ run, isLastRun, statusConfig }: WorkflowRunTooltipContentProps) {
  return (
    <div>
      <div className="font-semibold text-sm text-foreground">
        {run.name}
      </div>

      <WorkflowRunStatusIndicator isLastRun={isLastRun} run={run} />

      <div className="grid grid-cols-[auto_auto] gap-4 text-xs pt-4 border-t border-muted-foreground/30 mt-4">
        <WorkflowRunStatusDisplay run={run} statusConfig={statusConfig} />
        <WorkflowRunExecutionTime run={run} />
        {run.startTime && <WorkflowRunStartTime run={run} />}
        {run.completionTime && <WorkflowRunCompletionTime run={run} />}
      </div>
    </div>
  );
}

interface WorkflowRunStatusBadgeProps {
  run: WorkflowRunData;
  templateNamespace?: string;
  templateName?: string;
  isLastRun?: boolean;
}
export function WorkflowRunStatusBadge({
  run,
  templateNamespace,
  templateName,
  isLastRun = false,
}: WorkflowRunStatusBadgeProps) {
  const getOrgLink = useOrgLink();
  const statusConfig =
    STATUS_CONFIG[run.phase as keyof typeof STATUS_CONFIG] || DEFAULT_STATUS;

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Link
          to={{
            pathname: getOrgLink(
              `/workflows/templates/${templateNamespace}/${templateName}/runs/${run.namespace}/${run.name}`
            ),
          }}
          className="group block"
        >
          <Badge
            className="
              py-1 px-2 cursor-pointer transition-[opacity,transform] ease-in-out opacity-50 group-hover:opacity-100
              group-last:opacity-100 group-last:outline group-last:outline-1 group-last:outline-primary-500/40 group-last:outline-offset-2 group-last:shadow-sm
              group-[:nth-last-of-type(2):not(:first-of-type)]:mr-1
              animate-in fade-in-0 zoom-in-150 duration-500
              hover:scale-105 active:scale-100 [transition-duration:200ms]
            "
            variant={statusConfig.variant}
          >
            <span className="transition-transform">{statusConfig.icon}</span>
          </Badge>
        </Link>
      </TooltipTrigger>
      <TooltipContent className="p-4">
        <WorkflowRunTooltipContent
          run={run}
          isLastRun={isLastRun}
          statusConfig={statusConfig}
        />
      </TooltipContent>
    </Tooltip>
  );
}
