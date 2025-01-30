import { Background, Controls, ReactFlow, Node, Edge, MarkerType, Handle, Position, BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath } from '@xyflow/react';
import '@xyflow/react/dist/base.css';
import Dagre from '@dagrejs/dagre';
import { useEffect, useState, useRef } from 'react';
import { LineageData, LineageNodeData } from '@/components/audit/Audit.interfaces';
import { formatDate } from "@/utils/dateUtils";
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { LucideSquareAsterisk, LucideCopy, LucideNetwork } from 'lucide-react';
import { ReactFlowInstance } from '@xyflow/react';

// Constants for node dimensions - used by Dagre to calculate proper spacing // TODO: Make this dynamic based on the rendered DOM elements. Spoiler: it's not easy lol.
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

/**
 * Creates a Map to efficiently track how many target nodes each source node has.
 * We use Map instead of an object because:
 * 1. O(1) lookup performance
 * 2. No prototype chain to worry about
 * 3. No need to use hasOwnProperty checks
 */
const getSourceTargetMap = (links: LineageData['links']) => {
  const map = new Map<string, number>();
  for (const link of links) {
    map.set(link.fromSecret, (map.get(link.fromSecret) || 0) + 1);
  }
  return map;
};

/**
 * Creates edge configurations for React Flow.
 * The key aspects here are:
 * 1. We create the source-target map once outside the loop for performance
 * 2. We attach sourceHasMultipleTargets to edge data to inform label positioning
 * 3. Edge IDs combine source and target for unique IDs.
 */
const createEdges = (links: LineageData['links']) => {
  // Create the map once to avoid recalculating for each edge
  const sourceTargetMap = getSourceTargetMap(links);

  return links.map(link => ({
    id: `${link.fromSecret}-${link.toSecret}`,
    source: link.fromSecret,
    target: link.toSecret,
    type: 'default',
    animated: true,
    data: {
      // This boolean drives the label positioning logic for split paths or single paths
      sourceHasMultipleTargets: (sourceTargetMap.get(link.fromSecret) || 0) > 1
    },
    label: formatDate(new Date(link.createdAt), { format: 'readableDate' }),
    markerEnd: { type: MarkerType.Arrow, width: 32, height: 32 },
  }));
};

/**
 * Calculates the optimal label position for an edge based on:
 * 1. Whether the source node has multiple targets (splits into multiple edges)
 * 2. The geometric relationship between source and target nodes
 *
 * For split paths (multiple targets):
 * - Places label at middle point of edge after the source node split
 * - This helps avoid label overlaps where edges diverge
 *
 * For single paths:
 * - Places label middle of the path
 * - No need to adjust since there's no risk of overlaps
 */
const getAdjustedLabelPosition = (sourceX: number, sourceY: number, targetX: number, targetY: number, hasMultipleTargets: boolean) => {
  // Calculate the total distance of the edge in both dimensions
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;

  if (hasMultipleTargets) {
    return {
      // For split paths, align with the vertical segment of the step path
      x: sourceX + dx, // Places label the vertical segment of the splitted path
      y: sourceY + dy * 0.75 // getSmoothStepPath() splits the path right at 50%, so we need to move it down 25% for the label to be in the middle of the splitted path, hence 75%.
    };
  }

  return {
    // For single paths, simple center positioning
    x: sourceX + dx / 2,
    y: sourceY + dy / 2
  };
};

/**
 * Custom edge component that handles:
 * 1. Path generation with smooth corners
 * 2. Smart label positioning based on edge type
 * 3. Visual styling and markers
 */
const SecretEdge = ({ id, sourceX, sourceY, targetX, targetY, label, markerEnd, data }: EdgeProps) => {
  const [edgePath] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, borderRadius: 16 });
  const hasMultipleTargets = Boolean(data?.sourceHasMultipleTargets);
  const { x: adjustedLabelX, y: adjustedLabelY } = getAdjustedLabelPosition(sourceX, sourceY, targetX, targetY, hasMultipleTargets);

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
            variant="warning"
            className="absolute font-mono backdrop-blur-sm"
            style={{
              // translate(-50%, -50%) centers the label instead of using x=0 and y=0 start points, then compound the translation to move it to the middle of the edge with adjustedLabelX and adjustedLabelY
              transform: `translate(-50%, -50%) translate(${adjustedLabelX}px, ${adjustedLabelY}px)`
            }}
          >
            <LucideCopy className="size-3 mr-2 text-warning" />
            on {label}
          </Badge>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

const nodeTypes = { secretNode: SecretNode };
const edgeTypes = { default: SecretEdge };

const createNodes = (nodes: LineageData['nodes'], currentSecretId: string, edges: Edge[]) => {
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
};

const applyLayout = (nodes: Node[], edges: Edge[]) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB' });

  edges.forEach(edge => g.setEdge(edge.source, edge.target));
  nodes.forEach(node => g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));

  Dagre.layout(g);

  return nodes.map(node => {
    const { x, y } = g.node(node.id);
    return { ...node, position: { x: x - NODE_WIDTH/2, y: y - NODE_HEIGHT/2 } };
  });
};

export default function AuditSecretDetailsLineage({
  lineageData,
  currentSecretId,
  setSecretId,
  className,
  // Critical for proper fitView timing - tells us when the tab is actually visible
  isActive
}: {
  lineageData: LineageData | undefined;
  currentSecretId: string;
  setSecretId: (id: string) => void;
  className?: string;
  isActive?: boolean;
}) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  // Store instance for manual fitView - can't rely on initial fitView prop as container might be hidden
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  useEffect(() => {
    if (!lineageData?.nodes || !lineageData?.links) return;

    const edges = createEdges(lineageData.links);
    const nodes = createNodes(lineageData.nodes, currentSecretId, edges);
    setNodes(applyLayout(nodes, edges));

    setEdges(edges);
  }, [lineageData, currentSecretId]);

  // Key to fixing mobile fit view - only fit when tab is visible and instance exists
  useEffect(() => {
    if (isActive && reactFlowInstance.current) {
      // Use rAF to ensure DOM is ready after tab transition
      window.requestAnimationFrame(() => reactFlowInstance.current?.fitView({ minZoom: 0.5, maxZoom: 1, padding: 0.5 }));
    }
  }, [isActive]);

  if (!nodes.length) return null;

  return (
    <section
      aria-label="Lineage"
      className={cn("min-h-0 relative overflow-clip", className)}
    >
      <h3 className="font-semibold mb-3 flex items-center gap-2 p-3 rounded-md bg-background border absolute top-3 left-1/2 -translate-x-1/2 z-10 w-max">
        <LucideNetwork />
        Duplicates Lineage
      </h3>
      <ReactFlow
        className="h-full"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{
          minZoom: 0.5,
          maxZoom: 1,
          padding: 0.5
        }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        nodeOrigin={[0.5, 0.5]}
        zoomOnDoubleClick={true}
        onNodeClick={(_, node) => setSecretId(node.id)}
        onInit={(instance) => {
          reactFlowInstance.current = instance;
        }}
      >
        <Controls />
        <Background
          patternClassName="!fill-muted-background"
          className="!bg-muted/10"
          gap={32}
          size={2}
        />
      </ReactFlow>
    </section>
  );
}