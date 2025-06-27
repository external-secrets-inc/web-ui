import {memo} from 'react';
import {Handle, Position} from '@xyflow/react';

export type StartNodeData = {
    nodeType: 'start';
    name: string;
    phase: string;
}

const Start = ({data}: {data: StartNodeData}) => {
    return (
        <div>
            <div className="flex items-center">
                <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">
                    <img className="w-6 h-6" src="/icons/workflow.png" alt="Workflow"/>
                </div>
                <div className="text-sm font-bold">{data.name}</div>
            </div>
            <Handle
                type="source"
                position={Position.Right}
                className="w-16 !bg-teal-500"
            />
        </div>
    );
};

export default memo(Start);