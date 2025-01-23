import { Background, Controls, ReactFlow, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import SecretNode from "@/components/lineage/SecretNode";
import SecretEdge from "@/components/lineage/SecretEdge";
import { useEffect, useState } from 'react';
import { LineageData } from '@/components/audit/Audit.interfaces';

const nodeWidth = 300;
const nodeHeight = 125;

const nodeTypes = {
  secretNode: SecretNode
}

const edgeTypes = {
  secretEdge: SecretEdge
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
dagreGraph.setGraph({ rankdir: 'TB' }); // TB: Top-Bottom (pode ser 'LR', 'RL', etc.)
const applyLayout = (nodes: Node[], edges: Edge[]) => {
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const position = dagreGraph.node(node.id);
    return {
      ...node,
      position: { x: position.x - nodeWidth / 2, y: position.y - nodeHeight / 2 },
    };
  });
};

interface AuditSecretDetailsLineageProps {
  lineageData: LineageData | undefined;
  currentSecretId: string;
}

export default function AuditSecretDetailsLineage({ lineageData, currentSecretId }: AuditSecretDetailsLineageProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    if (!lineageData) return;

    const nodes = lineageData.nodes.map((node) => {
      return {
        id: node.secretID,
        type: "secretNode",
        data: {
          label: node.secretName,
          active: node.secretID === currentSecretId,
          ...node
        },
        position: { x: 0, y: 0 }
      }
    })
    const edges = lineageData.links.map((link) => {
      return {
        id: `${link.fromSecret}-${link.toSecret}`,
        source: link.fromSecret,
        target: link.toSecret,
        animated: true,
        label: `duplicated on ${new Date(link.createdAt).toLocaleString()}`
      }
    })
    setNodes(applyLayout(nodes, edges))
    setEdges(edges)
  }, [lineageData, currentSecretId])

  return (
    <ReactFlow
      className="h-full"
      nodes={nodes}
      edges={edges}
      fitView
      fitViewOptions={{
        minZoom: 0.5,
        maxZoom: 1,
      }}
      minZoom={0.25}
      maxZoom={1.75}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
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
        gap={32}
        size={2}
      />
    </ReactFlow>
  );
}