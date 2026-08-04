import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2, X } from 'lucide-react';

interface PermissionMatrixProps {
  role: any;
  isOpen: boolean;
  onClose: () => void;
}

const MODULES = [
  'Leads',
  'Customers',
  'Projects',
  'Tasks',
  'Invoices',
  'Orders',
  'Departments',
  'Teams',
];

const ACTIONS = ['view', 'create', 'edit', 'delete'];

export default function PermissionMatrix({ role, isOpen, onClose }: PermissionMatrixProps) {
  const [loading, setLoading] = useState(false);
  
  // Initialize state with existing permissions or empty
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>(
    role.permissions || {}
  );

  const handleToggle = (module: string, action: string) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...(prev[module] || {}),
        [action]: !(prev[module]?.[action] || false),
      },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/owner/roles/${role._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      });

      if (!res.ok) throw new Error('Failed to update matrix');
      
      toast.success('Permission matrix updated');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            Permission Matrix: <span className="text-blue-600">{role.name}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 bg-gray-50 flex-grow">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Module</th>
                  {ACTIONS.map((action) => (
                    <th key={action} className="text-center py-4 px-6 font-semibold text-gray-700 text-sm capitalize">
                      {action}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map((module) => (
                  <tr key={module} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900 text-sm">{module}</td>
                    {ACTIONS.map((action) => (
                      <td key={`${module}-${action}`} className="text-center py-4 px-6">
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition-all cursor-pointer accent-blue-600"
                          checked={permissions[module]?.[action] || false}
                          onChange={() => handleToggle(module, action)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-white flex justify-end space-x-3 shrink-0">
          <button 
            onClick={onClose} 
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center shadow-sm disabled:opacity-70"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Matrix
          </button>
        </div>

      </div>
    </div>
  );
}
