import { Background, Controls, ReactFlow, Node, Edge, MarkerType, Handle, Position, BaseEdge, EdgeLabelRenderer, EdgeProps, getStraightPath } from '@xyflow/react';
import '@xyflow/react/dist/base.css';
import Dagre from '@dagrejs/dagre';
import { useEffect, useState } from 'react';
import { LineageData, LineageNodeData } from '@/components/audit/Audit.interfaces';
import { formatDate } from "@/utils/dateUtils";
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { LucideSquareAsterisk, LucideCopy } from 'lucide-react';

const NODE_WIDTH = 320;
const NODE_HEIGHT = 192;

const SecretNode = ({
  data
}: {
  data: LineageNodeData
}) => {
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
        data.active && 'ring-1 ring-offset-2 ring-offset-accent ring-primary hover:ring-primary hover:ring-1 cursor-grab pointer-events-none'
      )}>
        <div className="flex items-center gap-2 px-4 py-2 bg-background border-b">
          <LucideSquareAsterisk
            className={cn(
              "size-6 text-muted-foreground transition-color",
              data.active && "text-primary"
            )}
          />
          <span>{data.secretName}</span>
        </div>
        <div className="flex p-4 py-3 bg-muted/40 backdrop-blur-sm">
          <Badge
            variant="outline"
            className="bg-background"
          >
            {data.providerName}
          </Badge>
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
};

const SecretEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  markerEnd
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        className="!stroke-muted-foreground"
      />
      {label && (
        <EdgeLabelRenderer>
          <Badge
            variant="outline"
            className="absolute font-mono font-normal bg-background"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`
            }}
          >
            <LucideCopy className="size-3 mr-2" />
            {label}
          </Badge>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

function createEdges(links: LineageData['links']) {
  return links.map(link => ({
    id: `${link.fromSecret}-${link.toSecret}`,
    source: link.fromSecret,
    target: link.toSecret,
    type: 'default',
    animated: true,
    label: formatDate(new Date(link.createdAt), { format: 'readableDate' }),
    markerEnd: { type: MarkerType.Arrow, width: 32, height: 32 },
  }));
}

function createNodes(nodes: LineageData['nodes'], currentSecretId: string, edges: Edge[]) {
  const sourceNodes = new Set(edges.map(e => e.source));
  const targetNodes = new Set(edges.map(e => e.target));

  return nodes.map(node => ({
    id: node.secretID,
    type: "secretNode",
    data: {
      secretName: node.secretName,
      providerName: node.providerName || "Unknown Provider",
      active: node.secretID === currentSecretId,
      sourcePosition: sourceNodes.has(node.secretID),
      targetPosition: targetNodes.has(node.secretID)
    },
    position: { x: 0, y: 0 }
  }));
}

function applyLayout(nodes: Node[], edges: Edge[]) {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB' });

  edges.forEach(edge => g.setEdge(edge.source, edge.target));
  nodes.forEach(node => g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));

  Dagre.layout(g);

  return nodes.map(node => {
    const { x, y } = g.node(node.id);
    return { ...node, position: { x: x - NODE_WIDTH/2, y: y - NODE_HEIGHT/2 } };
  });
}

export default function AuditSecretDetailsLineage({
  lineageData,
  currentSecretId,
  setSecretId
}: {
  lineageData: LineageData | undefined;
  currentSecretId: string;
  setSecretId: (id: string) => void;
}) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    if (!lineageData?.nodes || !lineageData?.links) return;

    const edges = createEdges(lineageData.links);
    const nodes = createNodes(lineageData.nodes, currentSecretId, edges);
    const layoutedNodes = applyLayout(nodes, edges);

    setNodes(layoutedNodes);
    setEdges(edges);
  }, [lineageData, currentSecretId]);

  return (
    <ReactFlow
      className="h-full"
      nodes={nodes}
      edges={edges}
      nodeTypes={{secretNode: SecretNode}}
      edgeTypes={{default: SecretEdge}}
      fitView
      fitViewOptions={{
        minZoom: 0.5,
        maxZoom: 1,
      }}
      minZoom={0.25}
      maxZoom={1.75}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={true}
      panOnDrag={true}
      zoomOnScroll={true}
      zoomOnPinch={true}
      zoomOnDoubleClick={true}
      onNodeClick={(_, node) => setSecretId(node.id)}
    >
      <Controls />
      <Background
        patternClassName="!fill-muted-background"
        className="!bg-muted/10"
        gap={32}
        size={2}
      />
    </ReactFlow>
  );
}