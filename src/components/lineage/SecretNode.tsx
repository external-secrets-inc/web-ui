import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { LucideSquareAsterisk } from 'lucide-react';

const SecretNode = memo(({ data, isConnectable }) => {
  let bgColor;
  let borderColor;
  if (data.active) {
    bgColor = "bg-purple-100"
    borderColor = "border-purple-400"
  } else {
    bgColor = "bg-gray-100"
    borderColor = "border-gray-200"
  }
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <div className={`flex items-center min-w-64 space-x-4 bg-white p-4 rounded-lg shadow-md border ${borderColor}`}>
        <div className={`flex items-center justify-center w-12 h-12 ${bgColor} text-gray-600 rounded-full`}>
          <LucideSquareAsterisk className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{data.secretName}</h3>
          <p className="text-sm text-gray-500">{data.providerName}</p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        isConnectable={isConnectable}
      />
    </>
  );
});
export default SecretNode