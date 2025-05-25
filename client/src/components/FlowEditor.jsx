import React, { useMemo, useState, useCallback } from 'react';
import ReactFlow, { Controls, Background, Handle, Position, ReactFlowProvider, applyEdgeChanges, applyNodeChanges  } from 'reactflow';
import 'reactflow/dist/style.css';
import {Nodes, Edges} from '../data/scheme';

const FlowEditorContent = () => {
  const [nodes, setNodes] = useState(Nodes);
  const [edges, setEdges] = useState(Edges);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );


  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-primary)' }}>
      <ReactFlow 
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <Background />
      </ReactFlow>
    </div>
  );
};

const FlowEditor = () => {
  return (
    <ReactFlowProvider>
      <FlowEditorContent />
    </ReactFlowProvider>
  );
};

export default FlowEditor;