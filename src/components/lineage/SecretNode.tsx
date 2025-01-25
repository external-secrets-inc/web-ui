import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { LucideSquareAsterisk } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type SecretNodeData = {
  secretName: string;
  providerName: string;
  active: boolean;
  targetPosition?: boolean;
  sourcePosition?: boolean;
  [key: string]: unknown;
}

function SecretNode({ data }: { data: SecretNodeData }) {
  return (
    <>
      {data.targetPosition && (
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={false}
          className="invisible"
        />
      )}
      <div className={cn(
        'overflow-clip rounded-lg border ring-0 ring-transparent ring-offset-background/75 hover:ring-muted-foreground/50 hover:ring-offset-2 hover:ring-1 transition-shadow',
        data.active && 'ring-1 ring-offset-2 ring-offset-accent ring-primary hover:ring-primary hover:ring-1 cursor-grab'
      )}>
        <div className="flex items-center gap-2 px-4 py-2 bg-background border-b">
          <LucideSquareAsterisk className={cn(
            "size-6 text-muted-foreground transition-color",
            data.active && "text-primary"
          )}/>
          <span>{data.secretName}</span>
        </div>
        <div className="flex p-4 py-3 bg-muted/40 backdrop-blur-sm">
          <Badge variant="outline" className="bg-background">{data.providerName}</Badge>
        </div>
      </div>
      {data.sourcePosition && (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={false}
          className="rounded-full !bg-muted ring-1 ring-muted-foreground"
        />
      )}
    </>
  );
}

export default memo(SecretNode);