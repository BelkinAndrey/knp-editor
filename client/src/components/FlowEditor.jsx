import React, { useMemo, useState, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, Handle, Position, ReactFlowProvider, applyEdgeChanges, applyNodeChanges, useReactFlow, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import ContextMenu from './ContextMenu';
import InputNode from '../elements/InputNode';
import OutputNode from '../elements/OutputNode';
import PopulationNode from '../elements/PopulationNode';
import axios from 'axios';

const nodeTypes = {
  inputNode: InputNode,
  outputNode: OutputNode,
  populationNode: PopulationNode,
};

const FlowEditorContent = ({ currentSchema, onSchemaChange }) => {
  const [nodes, setNodes] = useState(currentSchema.nodes);
  const [edges, setEdges] = useState(currentSchema.edges);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });
  const { screenToFlowPosition, toObject, setViewport } = useReactFlow();

  useEffect(() => {
    setNodes(currentSchema.nodes);
    setEdges(currentSchema.edges);
  }, [currentSchema]);

  const onNodesChange = useCallback(
    (changes) => {
      const newNodes = applyNodeChanges(changes, nodes);
      // Filter out edges connected to removed nodes
      const nodeIds = newNodes.map(node => node.id);
      const newEdges = edges.filter(edge => nodeIds.includes(edge.source) && nodeIds.includes(edge.target));

      setNodes(newNodes);
      setEdges(newEdges); // Update edges state
      onSchemaChange({ nodes: newNodes, edges: newEdges }); // Pass updated edges
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

  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      onSchemaChange({ nodes, edges: newEdges });
    },
    [edges, nodes, onSchemaChange],
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
    onSchemaChange({ nodes: newNodes, edges });
  }, [nodes, edges, onSchemaChange, screenToFlowPosition]);

  // Function to save autosave data
  const saveAutosave = useCallback(async () => {
    if (!toObject) return; // Ensure React Flow instance is available
    const flowObject = toObject();
    try {
      await axios.post('http://localhost:3000/api/autosave', {
        nodes: flowObject.nodes,
        edges: flowObject.edges,
        zoom: flowObject.viewport.zoom,
        position: { x: flowObject.viewport.x, y: flowObject.viewport.y }
      });
      console.log('Autosave successful!');
    } catch (error) {
      console.error('Error saving autosave:', error);
    }
  }, [toObject]);

  // Effect to load autosave data on mount
  useEffect(() => {
    const loadAutosave = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/autosave');
        const autosaveData = response.data;
        if (autosaveData) {
          setNodes(autosaveData.nodes || []);
          setEdges(autosaveData.edges || []);
          if (autosaveData.zoom !== undefined && autosaveData.position) {
            setViewport({ x: autosaveData.position.x, y: autosaveData.position.y, zoom: autosaveData.zoom });
          }
          // Notify parent component if necessary, or handle state update internally
          // onSchemaChange({ nodes: autosaveData.nodes || [], edges: autosaveData.edges || [] }); // Uncomment if you want to update parent state
        }
      } catch (error) {
        console.error('Error loading autosave:', error);
        // Handle 404 - no autosave data found (this is expected on first load)
        if (error.response && error.response.status === 404) {
          console.log('No autosave data found.');
        } else {
          alert('Failed to load autosave data.');
        }
      }
    };

    loadAutosave();
  }, [setNodes, setEdges, setViewport]);

  // Effect for periodic autosave
  useEffect(() => {
    const intervalId = setInterval(() => {
      saveAutosave();
    }, 30000); // Save every 30 seconds

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [saveAutosave]);

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