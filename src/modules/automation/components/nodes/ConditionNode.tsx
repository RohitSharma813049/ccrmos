import React from 'react';
import { Handle, Position } from '@xyflow/react';

export default function ConditionNode({ data }: { data: any }) {
  // Update ReactFlow node data directly
  const onChangeField = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (data.onChange) data.onChange({ ...data, field: e.target.value });
  };
  const onChangeOperator = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (data.onChange) data.onChange({ ...data, operator: e.target.value });
  };
  const onChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) data.onChange({ ...data, value: e.target.value });
  };

  return (
    <div className="bg-white border-2 border-amber-500 rounded-xl p-4 shadow-sm w-64">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-amber-500" />
      <div className="font-semibold text-amber-600 mb-2 text-sm flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Condition
      </div>
      
      <div className="space-y-2 flex flex-col">
        <select value={data.field || ''} onChange={onChangeField} className="w-full bg-gray-50 border border-gray-200 rounded p-1.5 text-xs text-gray-700 outline-none">
          <option value="">Select Field</option>
          <option value="status">Status</option>
          <option value="source">Source</option>
          <option value="email">Email</option>
          <option value="amount">Amount</option>
        </select>
        
        <select value={data.operator || ''} onChange={onChangeOperator} className="w-full bg-gray-50 border border-gray-200 rounded p-1.5 text-xs text-gray-700 outline-none">
          <option value="">Select Operator</option>
          <option value="equals">Equals</option>
          <option value="not_equals">Does Not Equal</option>
          <option value="contains">Contains</option>
          <option value="greater_than">Greater Than</option>
          <option value="less_than">Less Than</option>
        </select>

        <input 
          type="text" 
          value={data.value || ''} 
          onChange={onChangeValue} 
          placeholder="Value to compare" 
          className="w-full bg-gray-50 border border-gray-200 rounded p-1.5 text-xs text-gray-700 outline-none"
        />
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-amber-500" />
    </div>
  );
}
