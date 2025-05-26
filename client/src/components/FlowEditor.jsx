import React, { useMemo, useState, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, Handle, Position, ReactFlowProvider, applyEdgeChanges, applyNodeChanges, useReactFlow, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import ContextMenu from './ContextMenu';
import InputNode from '../elements/InputNode';
import OutputNode from '../elements/OutputNode';
import PopulationNode from '../elements/PopulationNode';

const nodeTypes = {
  inputNode: InputNode,
  outputNode: OutputNode,
  populationNode: PopulationNode,
};

const FlowEditorContent = ({ currentSchema, onSchemaChange }) => {
  const [nodes, setNodes] = useState(currentSchema.nodes);
  const [edges, setEdges] = useState(currentSchema.edges);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });
  const { screenToFlowPosition, getViewport, setViewport } = useReactFlow();

  useEffect(() => {
    setNodes(currentSchema.nodes);
    setEdges(currentSchema.edges);
    // Set viewport if position and zoom are available in currentSchema
    if (currentSchema.position !== undefined && currentSchema.zoom !== undefined) {
      setViewport({ x: currentSchema.position[0], y: currentSchema.position[1], zoom: currentSchema.zoom });
    }
  }, [currentSchema, setViewport]);

  const onNodesChange = useCallback(
    (changes) => {
      const newNodes = applyNodeChanges(changes, nodes);
      setNodes(newNodes);
      const viewport = getViewport();
      onSchemaChange({ nodes: newNodes, edges, position: [viewport.x, viewport.y], zoom: viewport.zoom });
    },
    [nodes, edges, onSchemaChange, getViewport],
  );

  const onEdgesChange = useCallback(
    (changes) => {
      const newEdges = applyEdgeChanges(changes, edges);
      setEdges(newEdges);
      const viewport = getViewport();
      onSchemaChange({ nodes, edges: newEdges, position: [viewport.x, viewport.y], zoom: viewport.zoom });
    },
    [nodes, edges, onSchemaChange, getViewport],
  );

  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      const viewport = getViewport();
      onSchemaChange({ nodes, edges: newEdges, position: [viewport.x, viewport.y], zoom: viewport.zoom });
    },
    [edges, nodes, onSchemaChange, getViewport],
  );

  const onCloseContextMenu = useCallback(() => {
    setContextMenu({ show: false, x: 0, y: 0 });
  }, []);

  const onContextMenu = useCallback((event) => {
    event.preventDefault();
    
    // Проверяем, был ли клик по контекстному меню
    const isContextMenuClick = event.target.closest('.context-menu');
    
    if (isContextMenuClick) {
      return; // Если клик был по меню, ничего не делаем
    }

    // Если меню открыто, закрываем его
    if (contextMenu.show) {
      onCloseContextMenu();
      return;
    }

    // Позиционируем меню под курсором
    setContextMenu({ 
      show: true, 
      x: event.clientX, 
      y: event.clientY 
    });
  }, [contextMenu.show, onCloseContextMenu]);

  const onContextMenuMouseLeave = useCallback((event) => {
    // Проверяем, что курсор действительно покинул меню
    const relatedTarget = event.relatedTarget;
    if (!relatedTarget || !relatedTarget.closest('.context-menu')) {
      onCloseContextMenu();
    }
  }, [onCloseContextMenu]);

  const onPaneClick = useCallback(() => {
    if (contextMenu.show) {
      onCloseContextMenu();
    }
  }, [contextMenu.show, onCloseContextMenu]);

  const onMove = useCallback(() => {
    if (contextMenu.show) {
      onCloseContextMenu();
    }
  }, [contextMenu.show, onCloseContextMenu]);

  const onMoveEnd = useCallback(() => {
    // Capture viewport state after user finishes moving/zooming
    const viewport = getViewport();
    // Only update position and zoom, keep existing nodes and edges
    onSchemaChange(prevSchema => ({
      ...prevSchema,
      position: [viewport.x, viewport.y],
      zoom: viewport.zoom
    }));
  }, [onSchemaChange, getViewport]);

  const onCreateNode = useCallback(({ x, y, nodeType }) => {
    // Преобразуем координаты экрана в координаты потока с учетом зума и панорамирования
    const position = screenToFlowPosition({ x, y });
    
    const newNode = {
      id: `node-${Date.now()}`,
      type: nodeType,
      position,
      data: { 
        label: nodeType === 'inputNode' ? 'Input' : 
               nodeType === 'outputNode' ? 'Output' : 
               'Population'
      }
    };
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    const viewport = getViewport();
    onSchemaChange({ nodes: newNodes, edges, position: [viewport.x, viewport.y], zoom: viewport.zoom });
  }, [nodes, edges, onSchemaChange, screenToFlowPosition, getViewport]);

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-primary)' }}>
      <ReactFlow 
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onContextMenu={onContextMenu}
        onPaneClick={onPaneClick}
        onMove={onMove}
        onMoveEnd={onMoveEnd}
        onClick={onPaneClick}
        connectOnClick={true}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
      >
        <Background />
        <Controls showZoom={false} showInteractive={false} />
      </ReactFlow>
      {contextMenu.show && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={onCloseContextMenu}
          onCreateNode={onCreateNode}
          onMouseLeave={onContextMenuMouseLeave}
        />
      )}
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