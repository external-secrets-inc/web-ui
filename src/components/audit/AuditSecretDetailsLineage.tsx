import { Background, Controls, ReactFlow, Node, Edge, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/base.css';
import Dagre from '@dagrejs/dagre';
import SecretNode from "@/components/lineage/SecretNode";
import SecretEdge from "@/components/lineage/SecretEdge";
import { useEffect, useState } from 'react';
import { LineageData } from '@/components/audit/Audit.interfaces';
import { formatDate } from "@/utils/dateUtils";


const NODE_WIDTH = 320;
const NODE_HEIGHT = 192;

interface AuditSecretDetailsLineageProps {
  lineageData: LineageData | undefined;
  currentSecretId: string;
}

export default function AuditSecretDetailsLineage({ lineageData, currentSecretId }: AuditSecretDetailsLineageProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    if (!lineageData?.nodes || !lineageData?.links) return;

    // Create edges
    const newEdges = lineageData.links.map(link => ({
      id: `${link.fromSecret}-${link.toSecret}`,
      source: link.fromSecret,
      target: link.toSecret,
      type: 'default',
      animated: true,
      label: `${formatDate(new Date(link.createdAt), { format: 'readableDate' })}`,
      markerEnd: {
        type: MarkerType.Arrow,
        width: 32,
        height: 32,
      },
    }));

    // Track which nodes are sources and targets for handle placement
    const sourceNodes = new Set(newEdges.map(e => e.source));
    const targetNodes = new Set(newEdges.map(e => e.target));

    // Create nodes
    const newNodes = lineageData.nodes.map(node => ({
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

    // Apply layout
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'TB' });

    newEdges.forEach(edge => g.setEdge(edge.source, edge.target));
    newNodes.forEach(node => {
      g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    Dagre.layout(g);

    // Set final positions
    const layoutedNodes = newNodes.map(node => {
      const { x, y } = g.node(node.id);
      return {
        ...node,
        position: { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 },
      };
    });

    setNodes(layoutedNodes);
    setEdges(newEdges);
  }, [lineageData, currentSecretId]);

  return (
    <ReactFlow
      className="h-full"
      nodes={nodes}
      edges={edges}
      nodeTypes={{ secretNode: SecretNode }}
      edgeTypes={{ default: SecretEdge }}
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