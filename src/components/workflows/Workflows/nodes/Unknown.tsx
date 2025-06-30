import {memo} from 'react';

export type UnknownNodeData = {
    nodeType: 'unknown';
    name: string;
    phase: string;
}

const UnknownNode = ({data}: {data: UnknownNodeData}) => {
    return (
        <div className="text-xs">
            <div className="flex items-center">
                <div className="rounded-full w-8 h-8 flex justify-center items-center bg-gray-100">
                    <img className="w-6 h-6" src="/icons/unknown.png" alt="Job" />
                </div>
                <div className="ml-2">
                    <div className="font-bold">{data.name}</div>
                    <div className="text-gray-500">{data.phase}</div>
                </div>
            </div>
        </div>
    );
};

export default memo(UnknownNode);
