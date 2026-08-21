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
import ConditionNode from './nodes/ConditionNode';
import ActionNode from './nodes/ActionNode';

const nodeTypes = {
  condition: ConditionNode,
  action: ActionNode,
};

export default function WorkflowBuilderClient({ workflow, isGlobal = false }: { workflow: any, isGlobal?: boolean }) {
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

  // Handle custom node data changes
  const updateNodeData = useCallback((newData: any) => {
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === newData.id) {
          return { ...node, data: newData };
        }
        return node;
      })
    );
  }, []);

  const addConditionNode = () => {
    const id = `condition-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'condition',
      position: { x: 250, y: nodes.length * 100 + 50 },
      data: { id, onChange: updateNodeData }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addActionNode = () => {
    const id = `action-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'action',
      position: { x: 250, y: nodes.length * 100 + 50 },
      data: { id, onChange: updateNodeData }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Compile nodes into backend schema
      const compiledConditions: any[] = [];
      const compiledActions: any[] = [];

      nodes.forEach(node => {
        if (node.type === 'condition' && node.data.field && node.data.operator && node.data.value) {
          compiledConditions.push({
            field: node.data.field,
            operator: node.data.operator,
            value: node.data.value
          });
        } else if (node.type === 'action' && node.data.actionType) {
          compiledActions.push({
            type: node.data.actionType,
            payload: node.data.payload || {}
          });
        }
      });

      // Strip functions from node data before saving to DB
      const safeNodes = nodes.map(n => {
        const { onChange, ...safeData } = n.data as any;
        return { ...n, data: safeData };
      });

      const payload = {
        conditions: compiledConditions,
        actions: [
          ...compiledActions,
          // We save the visual canvas as a special Action so the UI can reconstruct it later
          { type: "Canvas", payload: { nodes: safeNodes, edges } }
        ]
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-100">{workflow.title} Builder</h1>
            {isGlobal && (
              <span className="px-2.5 py-0.5 text-xs font-bold bg-fuchsia-100 text-fuchsia-700 rounded-full border border-fuchsia-200">
                Global Workflow
              </span>
            )}
          </div>
          <p className="text-zinc-400 text-sm mt-1">{workflow.description}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.history.back()} className="px-4 py-2 bg-gray-100 text-zinc-300 rounded-lg hover:bg-gray-200 transition-colors">
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
      
      <div className="flex-1 bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-inner overflow-hidden">
        <ReactFlow
          nodes={nodes.map(n => ({...n, data: { ...n.data, onChange: updateNodeData }}))} // re-inject function
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
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
