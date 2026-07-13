"use client";

import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function WorkflowBuilderClient({ workflow }: { workflow: any }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // If we have saved canvas data in actions, load it
    const canvasAction = workflow.actions?.find((a: any) => a.type === "Canvas");
    if (canvasAction && canvasAction.payload) {
      setNodes(canvasAction.payload.nodes || []);
      setEdges(canvasAction.payload.edges || []);
    } else {
      // Default trigger node based on workflow type
      setNodes([
        {
          id: 'trigger-1',
          type: 'input',
          position: { x: 250, y: 50 },
          data: { label: `Trigger: ${workflow.trigger}` },
          style: { border: '2px solid #3b82f6', borderRadius: '8px', padding: '10px' }
        }
      ]);
    }
  }, [workflow]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const addConditionNode = () => {
    const newNode: Node = {
      id: `condition-${Date.now()}`,
      position: { x: 250, y: nodes.length * 100 + 50 },
      data: { label: 'Condition (e.g. Field = Value)' },
      style: { border: '2px solid #f59e0b', borderRadius: '8px', padding: '10px' }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addActionNode = () => {
    const newNode: Node = {
      id: `action-${Date.now()}`,
      position: { x: 250, y: nodes.length * 100 + 50 },
      data: { label: 'Action (e.g. Send Email)' },
      style: { border: '2px solid #10b981', borderRadius: '8px', padding: '10px' }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        actions: [{ type: "Canvas", payload: { nodes, edges } }]
      };
      
      const res = await fetch(`/api/automation/workflows/${workflow._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert("Workflow saved successfully!");
      } else {
        alert("Failed to save workflow");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving workflow");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{workflow.title} Builder</h1>
          <p className="text-gray-500 text-sm">{workflow.description}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.history.back()} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Back
          </button>
          <button onClick={addConditionNode} className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
            + Add Condition
          </button>
          <button onClick={addActionNode} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
            + Add Action
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow disabled:opacity-50">
            {isSaving ? "Saving..." : "Save Workflow"}
          </button>
        </div>
      </div>
      
      <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-inner overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
