import React from 'react';
import { Handle, Position } from '@xyflow/react';

export default function ActionNode({ data }: { data: any }) {
  const onChangeActionType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (data.onChange) data.onChange({ ...data, actionType: e.target.value, payload: {} });
  };
  
  const onChangePayload = (key: string, value: string) => {
    const newPayload = { ...(data.payload || {}), [key]: value };
    if (data.onChange) data.onChange({ ...data, payload: newPayload });
  };

  return (
    <div className="bg-white border-2 border-emerald-500 rounded-xl p-4 shadow-sm w-64">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-emerald-500" />
      <div className="font-semibold text-emerald-600 mb-2 text-sm flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Action
      </div>
      
      <div className="space-y-2 flex flex-col">
        <select value={data.actionType || ''} onChange={onChangeActionType} className="w-full bg-gray-50 border border-gray-200 rounded p-1.5 text-xs text-gray-700 outline-none">
          <option value="">Select Action</option>
          <option value="Create Task">Create Task</option>
          <option value="Send Email">Send Email</option>
          <option value="Assign User">Assign User</option>
        </select>

        {data.actionType === 'Create Task' && (
          <>
            <input type="text" placeholder="Task Title" value={data.payload?.title || ''} onChange={(e) => onChangePayload('title', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-1.5 text-xs text-gray-700 outline-none" />
            <input type="text" placeholder="Task Description" value={data.payload?.description || ''} onChange={(e) => onChangePayload('description', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-1.5 text-xs text-gray-700 outline-none" />
          </>
        )}

        {data.actionType === 'Send Email' && (
          <>
            <input type="text" placeholder="To (Email)" value={data.payload?.to || ''} onChange={(e) => onChangePayload('to', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-1.5 text-xs text-gray-700 outline-none" />
            <input type="text" placeholder="Subject" value={data.payload?.subject || ''} onChange={(e) => onChangePayload('subject', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-1.5 text-xs text-gray-700 outline-none" />
          </>
        )}

        {data.actionType === 'Assign User' && (
          <>
            <input type="text" placeholder="Target User ID" value={data.payload?.userId || ''} onChange={(e) => onChangePayload('userId', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-1.5 text-xs text-gray-700 outline-none" />
            <p className="text-[10px] text-gray-500 mt-1 leading-tight">Enter the 24-character Object ID of the user to assign.</p>
          </>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500" />
    </div>
  );
}
