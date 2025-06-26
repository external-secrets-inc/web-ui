import {useCallback, useEffect} from 'react';
import {
  Background,
  Controls,
  Edge,
  Node,
  NodeTypes,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  NodeChange,
  Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { WorkflowJob, WorkflowData, WorkflowStep } from "./Workflows.interfaces";

interface WorkflowGraphProps {
  workflow: WorkflowData
}

export type JobNodeData = {
    startNode: boolean;
    nodeType: string;
    name: string;
    phase: string;
    numSteps: number;
}

const JobNode = ({ data }: { data: JobNodeData }) => {
  const borderColor = data.phase === "Succeeded"
        ? "border-success"
        : "border-destructive";

  return (
    <div className={`flex items-center px-2 py-2 shadow-md rounded-md bg-white border-2 ${borderColor}`}>
        <div style={{height: `${data.numSteps * 80}px`}}>
            <div className="flex items-center w-full">
                <div className="ml-2 flex-1">
                    <div className="items-center text-sm font-bold w-full">
                        <p className="text-xs">[{data.nodeType.toUpperCase()}]</p>
                        <p>{data.name}</p>
                    </div>
                </div>
            </div>
            {!data.startNode &&
            <Handle
                type="target"
                position={Position.Left}
                className="w-16 !bg-teal-500"
            />}
            <Handle
                type="source"
                position={Position.Right}
                className="w-16 !bg-teal-500"
            />
        </div>
        </div>
    );
};

export type StepNodeData = {
    nodeType: string;
    name: string;
    phase: string;
}

const StepNode = ({data}: {data: StepNodeData}) => {
    const borderColor = data.phase === "Succeeded"
        ? "border-success"
        : "border-destructive";

    return (
      <div className={`flex items-center px-2 py-2 shadow-md rounded-md bg-white border-2 ${borderColor}`}>
        <div className="text-xs">
            <div className="flex items-center">
                <div className="ml-2">
                  <p className="text-xs">[{data.nodeType.toUpperCase()}]</p>
                    <div className="font-bold">{data.name}</div>
                    <div className="text-gray-500">{data.phase}</div>
                </div>
            </div>
        </div>
        </div>
    );
};

const nodeTypes: NodeTypes = {jobNode: JobNode, stepNode: StepNode};
const edgeTypes: Record<string, never> = Object.freeze({});
const NODE_WIDTH = 250;
const SPACING = 100;

const STATUS_COLORS = Object.freeze({
  running: '#0ea5e9',
  completed: '#22c55e',
  succeeded: '#22c55e',
  failed: '#ef4444',
  pending: '#f59e0b',
  default: '#94a3b8',
});

const getStatusColor = (status?: string): string => {
  const key = status?.toLowerCase() || 'default';
  return STATUS_COLORS[key as keyof typeof STATUS_COLORS] || STATUS_COLORS.default;
};

const createEdge = (source: string, target: string, status: string): Edge => ({
  id: `edge-${source}-${target}`,
  source,
  target,
  type: 'straight',
  animated: status.toLowerCase() === 'running',
  style: { stroke: getStatusColor(status) },
});

const createWorkflowStartNode = (workflow: WorkflowData, yPosition: number): Node => {
  return {
    id: 'workflow-start',
    type: 'container',
    data: {nodeType: 'start', name: workflow.name, phase: workflow.phase},
    position: {x: 0, y: yPosition},
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    className: `workflow-node status-${workflow.phase.toLowerCase()}`,
    style: { width: `${NODE_WIDTH}px` }
  };
};

// Calculate node height based on type and number of steps
const calculateNodeHeight = (nodeType: string, numSteps: number): number => {
  if (nodeType === 'start') {
    return 48; // Approximate height of start node
  }

  // For job nodes (standard, switch, loop), height depends on number of steps
  return numSteps * 80;
};

const createJobNode = (index: number, jobName: string, jobStatus: WorkflowJob, yPosition: number): Node => {
  const phase = jobStatus.phase || 'Pending';
  const numberOfSteps = Object.keys(jobStatus.steps).length
  return {
    id: `job-${jobName}`,
    type: 'container',
    data: { nodeType: jobStatus.type, name: jobName, phase, numSteps: numberOfSteps},
    sourcePosition: Position.Right,
    position: {x: (index + 1) * (SPACING + NODE_WIDTH), y: yPosition},
    className: `job-node status-${phase.toLowerCase()}`,
    style: { width: `${NODE_WIDTH}px` }
  };
};

const createStepNode = (jobName: string, stepName: string, stepStatus: WorkflowStep, stepIndex: number): Node => {
  return {
    id: `step-${jobName}-${stepName}`,
    type: 'container',
    parentId: `job-${jobName}`,
    data: {nodeType: stepStatus.type, name: stepName, phase: stepStatus.phase},
    targetPosition: Position.Top,
    position: {x: 20, y: stepIndex * 50 + (stepIndex - 1) * 20},
    className: `step-node status-${stepStatus.phase.toLowerCase()}`,
  };
};

export function WorkflowGraph({ workflow }: WorkflowGraphProps) {
  const [nodes, setNodes, onNodesChangeDefault] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Custom onNodesChange handler that prevents step nodes from being moved
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Filter out position changes for step nodes
      const filteredChanges = changes.filter(change => {
        // Allow all non-position changes
        if (change.type !== 'position') return true;

        // Find the node being changed
        const node = nodes.find(n => n.id === change.id);

        // If it's a step node (has a parentId), prevent position change
        if (node && node.id.startsWith('step-')) {
          return false;
        }

        // Allow position changes for other nodes
        return true;
      });

      // Apply the filtered changes
      onNodesChangeDefault(filteredChanges);
    },
    [nodes, onNodesChangeDefault]
  );

  const createNodesAndEdges = useCallback(() => {
    if (!workflow) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Calculate heights for all nodes to determine vertical alignment
    const startNodeHeight = calculateNodeHeight('start', 0);

    // Calculate heights for all job nodes
    const jobs = Object.entries(workflow.jobs);
    const jobHeights = jobs.map(([, jobStatus]) => {
      const numberOfSteps = Object.keys(jobStatus.steps || {}).length;
      return calculateNodeHeight(jobStatus.type, numberOfSteps);
    });

    // Find the maximum height to use as reference for centering
    const maxHeight = Math.max(startNodeHeight, ...jobHeights);

    // Create the workflow start node with centered y position
    const startNodeYPosition = (maxHeight - startNodeHeight) / 2;
    const workflowStartNode = createWorkflowStartNode(workflow, startNodeYPosition);
    newNodes.push(workflowStartNode);

    // Create job nodes with centered y positions
    jobs.forEach(([jobName, jobStatus], index) => {
      const numberOfSteps = Object.keys(jobStatus.steps || {}).length;
      const jobHeight = calculateNodeHeight(jobStatus.type, numberOfSteps);
      const jobNodeYPosition = (maxHeight - jobHeight) / 2;

      const jobNode = createJobNode(index, jobName, jobStatus, jobNodeYPosition);
      newNodes.push(jobNode);

      // Connect current job node to the previous node.
      const previousNodeId = index === 0 ? workflowStartNode.id : `job-${jobs[index - 1][0]}`;
      newEdges.push(createEdge(previousNodeId, jobNode.id, jobStatus.phase));

      // Process step nodes (if any) for the current job.
      if (jobStatus.steps) {
        let stepIndex = 1
        Object.entries(jobStatus.steps).forEach(([stepName, stepStatus]) => {
          const stepNode = createStepNode(jobName, stepName, stepStatus, stepIndex);
          newNodes.push(stepNode);
          stepIndex++
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [workflow, setNodes, setEdges]);

  useEffect(() => {
    createNodesAndEdges();
  }, [workflow, createNodesAndEdges]);

  return (
      <ReactFlowProvider>
        <div className="w-full h-full">
          <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              fitViewOptions={{padding: 0.2}}
              defaultEdgeOptions={{
                type: 'smoothstep',
                style: {strokeWidth: 2},
              }}
          >
            <Background color="#94a3b8" gap={16}/>
            <Controls/>
          </ReactFlow>
        </div>
      </ReactFlowProvider>
  );
}
