import React, {memo} from 'react';
import Start, {StartNodeData} from "./Start";
import StandardJob, {StandardJobNodeData} from "./jobs/Standard";
import LoopJob, {LoopJobNodeData} from "./jobs/Loop";
import SwitchJob, {SwitchJobNodeData} from "./jobs/Switch";
import DebugStep, {DebugNodeData} from "./steps/Debug";
import TransformStep, {TransformNodeData} from "./steps/Transform";
import ScriptStep, {ScriptNodeData} from "./steps/Script";
import GenerateStep, {GenerateNodeData} from "./steps/Generate";
import PushStep, {PushNodeData} from "./steps/Push";

export type ContainerData =
    StartNodeData
    | StandardJobNodeData
    | LoopJobNodeData
    | SwitchJobNodeData
    | DebugNodeData
    | TransformNodeData
    | ScriptNodeData
    | GenerateNodeData
    | PushNodeData;

const Node = ({data}: {data: ContainerData}) => {
    const borderColor = data.phase === "Succeeded"
        ? "border-success"
        : "border-destructive";

    let NodeComponent: React.ReactNode;

    switch (data.nodeType) {
        case 'start':
            NodeComponent = <Start data={data as StartNodeData} />;
            break;
        case 'standard':
            NodeComponent = <StandardJob data={data as StandardJobNodeData} />;
            break;
        case 'loop':
            NodeComponent = <LoopJob data={data as LoopJobNodeData} />;
            break;
        case 'switch':
            NodeComponent = <SwitchJob data={data as SwitchJobNodeData} />;
            break;
        case 'debug':
            NodeComponent = <DebugStep data={data as DebugNodeData} />;
            break;
        case 'transform':
            NodeComponent = <TransformStep data={data as TransformNodeData} />;
            break;
        case 'javascript':
            NodeComponent = <ScriptStep data={data as ScriptNodeData} />;
            break;
        case 'generator':
            NodeComponent = <GenerateStep data={data as GenerateNodeData} />;
            break;
        case 'push':
            NodeComponent = <PushStep data={data as PushNodeData} />;
            break;
        default:
            NodeComponent = <div>Unknown node type</div>;
    }

    return (
        <div className={`flex items-center px-2 py-2 shadow-md rounded-md bg-white border-2 ${borderColor}`}>
            {NodeComponent}
        </div>
    );
};

export default memo(Node);