import { BaseEdge, EdgeLabelRenderer, EdgeProps, getStraightPath } from '@xyflow/react';
import { Badge } from "@/components/ui/badge";
import { LucideCopy } from 'lucide-react';

export default function SecretEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} className="!stroke-muted-foreground" />
      {label && (
        <EdgeLabelRenderer>
          <Badge
            variant="outline"
            className="absolute font-mono font-normal bg-background"
            style={{transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`}}
          >
            <LucideCopy className="size-3 mr-2" />
            {label}
          </Badge>
        </EdgeLabelRenderer>
      )}
    </>
  );
}