import React, { useMemo, useState, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, Handle, Position, ReactFlowProvider, applyEdgeChanges, applyNodeChanges, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import ContextMenu from './ContextMenu';

const FlowEditorContent = ({ currentSchema, onSchemaChange }) => {
  const [nodes, setNodes] = useState(currentSchema.nodes);
  const [edges, setEdges] = useState(currentSchema.edges);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });
  const { screenToFlowPosition } = useReactFlow();

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

  const onCreateNode = useCallback(({ x, y }) => {
    // Преобразуем координаты экрана в координаты потока с учетом зума и панорамирования
    const position = screenToFlowPosition({ x, y });
    
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'default',
      position,
      data: { label: 'Новая нода' }
    };
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    onSchemaChange({ nodes: newNodes, edges });
  }, [nodes, edges, onSchemaChange, screenToFlowPosition]);

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-primary)' }}>
      <ReactFlow 
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onContextMenu={onContextMenu}
        onPaneClick={onPaneClick}
        onMove={onMove}
        onClick={onPaneClick}
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