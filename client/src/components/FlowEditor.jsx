import React, { useMemo, useState, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, Handle, Position, ReactFlowProvider, applyEdgeChanges, applyNodeChanges  } from 'reactflow';
import 'reactflow/dist/style.css';

const FlowEditorContent = ({ currentSchema, onSchemaChange }) => {
  const [nodes, setNodes] = useState(currentSchema.nodes);
  const [edges, setEdges] = useState(currentSchema.edges);

  useEffect(() => {
    setNodes(currentSchema.nodes);
    setEdges(currentSchema.edges);
  }, [currentSchema]);

  const onNodesChange = useCallback(
    (changes) => {
      const newNodes = applyNodeChanges(changes, nodes);
      setNodes(newNodes);
      onSchemaChange({ nodes: newNodes, edges });
    },
    [nodes, edges, onSchemaChange],
  );

  const onEdgesChange = useCallback(
    (changes) => {
      const newEdges = applyEdgeChanges(changes, edges);
      setEdges(newEdges);
      onSchemaChange({ nodes, edges: newEdges });
    },
    [nodes, edges, onSchemaChange],
  );

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-primary)' }}>
      <ReactFlow 
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls showZoom={false} showInteractive={false} />
      </ReactFlow>
    </div>
  );
};

const FlowEditor = ({ currentSchema, onSchemaChange }) => {
  return (
    <ReactFlowProvider>
      <FlowEditorContent 
        currentSchema={currentSchema}
        onSchemaChange={onSchemaChange}
      />
    </ReactFlowProvider>
  );
};

export default FlowEditor;