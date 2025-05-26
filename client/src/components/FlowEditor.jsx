import React, { useMemo, useState, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, Handle, Position, ReactFlowProvider, applyEdgeChanges, applyNodeChanges, useReactFlow, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import ContextMenu from './ContextMenu';
import InputNode from '../elements/InputNode';
import OutputNode from '../elements/OutputNode';
import PopulationNode from '../elements/PopulationNode';
import axios from 'axios';
import { debounce } from 'lodash'; // Assuming lodash is available, or we can implement a simple debounce

const nodeTypes = {
  inputNode: InputNode,
  outputNode: OutputNode,
  populationNode: PopulationNode,
};

const FlowEditorContent = ({ currentSchema, onSchemaChange }) => {
  const [nodes, setNodes] = useState([]); // Initialize with empty array, load will populate
  const [edges, setEdges] = useState([]); // Initialize with empty array, load will populate
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });
  const { screenToFlowPosition, getViewport, setViewport } = useReactFlow();

  // Effect to load autosave data on mount
  useEffect(() => {
    const loadAutosave = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/autosave');
        const loadedSchema = response.data;
        // Update the state and propagate changes up
        setNodes(loadedSchema.nodes || []);
        setEdges(loadedSchema.edges || []);
        if (loadedSchema.position !== undefined && loadedSchema.zoom !== undefined) {
          setViewport({ x: loadedSchema.position[0], y: loadedSchema.position[1], zoom: loadedSchema.zoom });
        }
        // Also call onSchemaChange to update parent component's state if needed
        onSchemaChange({
          nodes: loadedSchema.nodes || [],
          edges: loadedSchema.edges || [],
          position: loadedSchema.position || [0, 0],
          zoom: loadedSchema.zoom || 1
        });
      } catch (error) {
        console.error('Error loading autosave data:', error);
        // Handle 404 specifically - no autosave data found, which is not an error
        if (error.response && error.response.status === 404) {
          console.log('No autosave data found.');
          // Initialize with an empty schema if no autosave data
           onSchemaChange({
            nodes: [],
            edges: [],
            position: [0, 0],
            zoom: 1
          });
        } else {
          // Other errors should be logged or handled
          alert('Failed to load autosave data.');
        }
      }
    };

    loadAutosave();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Debounced effect to save schema changes
  const debouncedSave = useCallback(
    debounce(async (schemaToSave) => {
      try {
        await axios.post('http://localhost:3000/api/autosave', schemaToSave);
      } catch (error) {
        console.error('Error saving autosave data:', error);
      }
    }, 1000), // 1000ms debounce time
    [] // Empty dependency array for debounce function
  );

  // Effect to trigger debounced save when schema changes
  useEffect(() => {
    // currentSchema is already updated by onSchemaChange callbacks
    debouncedSave(currentSchema);
    // Cleanup function to cancel debounce on unmount or before next effect run
    return () => {
      debouncedSave.cancel();
    };
  }, [currentSchema, debouncedSave]); // Dependency on currentSchema and debouncedSave

  // Update local state when currentSchema prop changes (e.g., after loading)
  useEffect(() => {
    setNodes(currentSchema.nodes);
    setEdges(currentSchema.edges);
    // Set viewport only if currentSchema has valid position/zoom
    if (currentSchema.position !== undefined && currentSchema.zoom !== undefined) {
        setViewport({ x: currentSchema.position[0], y: currentSchema.position[1], zoom: currentSchema.zoom });
    }
  }, [currentSchema, setViewport]);

  const onNodesChange = useCallback(
    (changes) => {
      const newNodes = applyNodeChanges(changes, nodes);
      setNodes(newNodes);
      const viewport = getViewport();
      // Call onSchemaChange to update the parent state and trigger save effect
      onSchemaChange({ nodes: newNodes, edges, position: [viewport.x, viewport.y], zoom: viewport.zoom });
    },
    [nodes, edges, onSchemaChange, getViewport],
  );

  const onEdgesChange = useCallback(
    (changes) => {
      const newEdges = applyEdgeChanges(changes, edges);
      setEdges(newEdges);
      const viewport = getViewport();
      // Call onSchemaChange to update the parent state and trigger save effect
      onSchemaChange({ nodes, edges: newEdges, position: [viewport.x, viewport.y], zoom: viewport.zoom });
    },
    [nodes, edges, onSchemaChange, getViewport],
  );

  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge({ ...params, animated: true }, edges);
      setEdges(newEdges);
      const viewport = getViewport();
      // Call onSchemaChange to update the parent state and trigger save effect
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
    // Call onSchemaChange to update the parent state and trigger save effect
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
    // Call onSchemaChange to update the parent state and trigger save effect
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
        selectNodesOnDrag={true}
        deleteKeyCode="Delete"
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