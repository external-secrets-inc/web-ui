import React from "react";
import { Button } from "@/components/ui/button";
import { LucideRefreshCw } from "lucide-react";
import { Loader } from "@/components/ui/Loader";
import { useQueryClient, useIsFetching } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface AuditRefreshButtonProps {
  queryKey: string[];
  children?: React.ReactNode;
  className?: string;
}

export function AuditRefreshButton({
  queryKey,
  children = "Refresh Data",
  className,
}: AuditRefreshButtonProps) {
  const queryClient = useQueryClient();
  const isFetching = useIsFetching({ queryKey }) > 0;

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey,
      refetchType: "active",
    });
  };

  return (
    <Button
      variant="secondary"
      onClick={handleRefresh}
      disabled={isFetching}
      className={cn("flex items-center gap-2 max-md:p-2.5", className)}
    >
      {isFetching ? <Loader /> : <LucideRefreshCw className="size-4" />}
      <span className="hidden md:inline">{children}</span>
    </Button>
  );
}
