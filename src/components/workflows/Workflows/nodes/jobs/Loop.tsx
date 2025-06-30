import {memo} from 'react';
import {Handle, Position} from '@xyflow/react';

export type LoopJobNodeData = {
    nodeType: 'loop';
    name: string;
    phase: string;
    numSteps: number;
}

const LoopJob = ({data}: {data: LoopJobNodeData}) => {
    return (
        <div style={{height: `${data.numSteps * 80}px`}}>
            <div className="flex items-center w-full">
                <div className="rounded-full h-6 w-6 flex justify-center items-center bg-gray-100">
                    <img className="w-4 h-4" src="/icons/cogs.png" alt="Job"/>
                </div>
                <div className="ml-2 flex-1">
                    <div className="items-center text-sm font-bold w-full">
                        <p className="text-xs">[Loop]</p>
                        <p>{data.name}</p>
                    </div>
                </div>
            </div>
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-teal-500"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="!bg-teal-500"
            />
        </div>
    );
};

export default memo(LoopJob);
