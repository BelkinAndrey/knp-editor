import React, { useMemo, useState, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, Handle, Position, ReactFlowProvider, applyEdgeChanges, applyNodeChanges, useReactFlow, addEdge, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import ContextMenu from './ContextMenu';
import InputNode from '../elements/InputNode';
import OutputNode from '../elements/OutputNode';
import PopulationNode from '../elements/PopulationNode';
import GroupNode from '../elements/GroupNode';
import axios from 'axios';
import { debounce } from 'lodash'; // Assuming lodash is available, or we can implement a simple debounce
import SettingsPanel from './SettingsPanel';
import './FlowEditor.css'; // Импорт стилей

const nodeTypes = {
  inputNode: InputNode,
  outputNode: OutputNode,
  populationNode: PopulationNode,
  groupNode: GroupNode,
};

const FlowEditorContent = ({ currentSchema, onSchemaChange }) => {
  const [nodes, setNodes] = useState([]); // Initialize with empty array, load will populate
  const [edges, setEdges] = useState([]); // Initialize with empty array, load will populate
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = useState(null); // Состояние для выбранного элемента
  const [isPanelVisible, setIsPanelVisible] = useState(true); // Состояние видимости панели (общее вкл/выкл)
  const [isPanelCollapsedState, setIsPanelCollapsedState] = useState(false); // Состояние свернуто/развернуто панели настроек
  const [panelWidthState, setPanelWidthState] = useState(300); // Состояние ширины панели настроек
  const { screenToFlowPosition, getViewport, setViewport } = useReactFlow();
  const [lastMenuOpenTime, setLastMenuOpenTime] = useState(0);
  const [currentFlowId, setCurrentFlowId] = useState(null); // null означает корневой уровень

  // Вспомогательная функция для получения узлов и ребер текущего потока
  const getFlowContent = useCallback((flowId) => {
    if (!flowId) { // Корневой уровень
      return { nodes: currentSchema.nodes, edges: currentSchema.edges };
    }
    const groupNode = currentSchema.nodes.find(n => n.id === flowId);
    if (groupNode && groupNode.data && groupNode.data.subFlow) {
      return { nodes: groupNode.data.subFlow.nodes, edges: groupNode.data.subFlow.edges };
    }
    return { nodes: [], edges: [] };
  }, [currentSchema]);

  // Вспомогательная функция для обновления узлов и ребер текущего потока
  const updateFlowContent = useCallback((flowId, newNodes, newEdges, newPosition, newZoom) => {
    onSchemaChange(prevSchema => {
      let updatedSchema = { ...prevSchema };
      if (!flowId) { // Корневой уровень
        updatedSchema.nodes = newNodes;
        updatedSchema.edges = newEdges;
        updatedSchema.position = newPosition;
        updatedSchema.zoom = newZoom;
      } else {
        updatedSchema.nodes = prevSchema.nodes.map(node => {
          if (node.id === flowId && node.type === 'groupNode') {
            return {
              ...node,
              data: {
                ...node.data,
                subFlow: {
                  nodes: newNodes,
                  edges: newEdges,
                  position: newPosition,
                  zoom: newZoom
                }
              }
            };
          }
          return node;
        });
      }
      return updatedSchema;
    });
  }, [onSchemaChange]);

  // Effect to load autosave data on mount
  useEffect(() => {
    const loadAutosave = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/autosave');
        const loadedSchema = response.data;
        onSchemaChange(loadedSchema);

        setIsPanelCollapsedState(loadedSchema.isPanelCollapsed || false);
        setPanelWidthState(loadedSchema.panelWidth || 300);

      } catch (error) {
        console.error('Error loading autosave data:', error);
        if (error.response && error.response.status === 404) {
          console.log('No autosave data found.');
           onSchemaChange({
            name: '',
            nodes: [],
            edges: [],
            position: [0, 0],
            zoom: 1,
            isPanelCollapsed: false,
            panelWidth: 300,
            globalParams: []
          });
           setIsPanelCollapsedState(false);
           setPanelWidthState(300);
        } else {
          alert('Failed to load autosave data.');
        }
      }
    };
    loadAutosave();
  }, []);

  // Update local state when currentSchema or currentFlowId changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = getFlowContent(currentFlowId);
    setNodes(newNodes);
    setEdges(newEdges);

    let flowPosition = [0, 0];
    let flowZoom = 1;

    if (!currentFlowId) { // Root level
      if (currentSchema.position !== undefined && currentSchema.zoom !== undefined) {
          flowPosition = currentSchema.position;
          flowZoom = currentSchema.zoom;
      }
    } else { // Sub-flow level
      const groupNode = currentSchema.nodes.find(n => n.id === currentFlowId);
      if (groupNode && groupNode.data && groupNode.data.subFlow && groupNode.data.subFlow.position !== undefined && groupNode.data.subFlow.zoom !== undefined) {
        flowPosition = groupNode.data.subFlow.position;
        flowZoom = groupNode.data.subFlow.zoom;
      }
    }
    setViewport({ x: flowPosition[0], y: flowPosition[1], zoom: flowZoom });

    if (currentSchema.isPanelCollapsed !== undefined) {
      setIsPanelCollapsedState(currentSchema.isPanelCollapsed);
    }
    if (currentSchema.panelWidth !== undefined) {
      setPanelWidthState(currentSchema.panelWidth);
    }

  }, [currentSchema, currentFlowId, setViewport, getFlowContent]);

  // Debounced effect to save schema changes
  const debouncedSave = useCallback(
    debounce(async (schemaToSave) => {
      try {
        await axios.post('http://localhost:3000/api/autosave', schemaToSave);
      } catch (error) {
        console.error('Error saving autosave data:', error);
      }
    }, 1000),
    []
  );

  // Effect to trigger debounced save when schema changes
  useEffect(() => {
    debouncedSave(currentSchema);
    return () => {
      debouncedSave.cancel();
    };
  }, [currentSchema, debouncedSave]);

  const onNodesChange = useCallback(
    (changes) => {
      const { nodes: currentLevelNodes, edges: currentLevelEdges } = getFlowContent(currentFlowId);
      const newNodes = applyNodeChanges(changes, currentLevelNodes);
      setNodes(newNodes);

      const viewport = getViewport();
      updateFlowContent(currentFlowId, newNodes, currentLevelEdges, [viewport.x, viewport.y], viewport.zoom);
    },
    [getFlowContent, currentFlowId, getViewport, updateFlowContent],
  );

  const onEdgesChange = useCallback(
    (changes) => {
      const { nodes: currentLevelNodes, edges: currentLevelEdges } = getFlowContent(currentFlowId);
      const newEdges = applyEdgeChanges(changes, currentLevelEdges);
      setEdges(newEdges);

      const viewport = getViewport();
      updateFlowContent(currentFlowId, currentLevelNodes, newEdges, [viewport.x, viewport.y], viewport.zoom);
    },
    [getFlowContent, currentFlowId, getViewport, updateFlowContent],
  );

  const onConnect = useCallback(
    (params) => {
      const { nodes: currentLevelNodes, edges: currentLevelEdges } = getFlowContent(currentFlowId);
      const strokeColor = 'var(--border-color)';
      const newEdge = {
        ...params,
        animated: false,
        type: 'default',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
        },
        style: {
          strokeWidth: 2,
          stroke: strokeColor
        },
        data: {
          strokeWidth: 2
        }
      };
      const newEdges = addEdge(newEdge, currentLevelEdges);
      setEdges(newEdges);

      const viewport = getViewport();
      updateFlowContent(currentFlowId, currentLevelNodes, newEdges, [viewport.x, viewport.y], viewport.zoom);
    },
    [getFlowContent, currentFlowId, getViewport, updateFlowContent],
  );

  const onCloseContextMenu = useCallback(() => {
    setContextMenu({ show: false, x: 0, y: 0 });
  }, []);

  const onContextMenu = useCallback((event) => {
    event.preventDefault();

    const isContextMenuClick = event.target.closest('.context-menu');
    const isSettingsPanelClick = event.target.closest('.settings-panel-wrapper') ||
                                event.target.closest('.settings-panel-container') ||
                                event.target.closest('.settings-panel') ||
                                event.target.closest('.settings-toggle-button');

    if (isContextMenuClick || isSettingsPanelClick) {
      return;
    }

    if (contextMenu.show) {
      onCloseContextMenu();
      return;
    }

    const newContextMenu = {
      show: true,
      x: event.clientX,
      y: event.clientY
    };
    setContextMenu(newContextMenu);
    setLastMenuOpenTime(Date.now());
  }, [contextMenu.show, onCloseContextMenu]);

  const onPaneClick = useCallback((event) => {
    const isNodeClick = event.target.closest('.react-flow__node');
    const isEdgeClick = event.target.closest('.react-flow__edge');
    const isSettingsPanelClick = event.target.closest('.settings-panel-wrapper') ||
                                event.target.closest('.settings-panel-container') ||
                                event.target.closest('.settings-panel') ||
                                event.target.closest('.settings-toggle-button');

    if (isNodeClick || isEdgeClick || isSettingsPanelClick) {
      return;
    }

    if (contextMenu.show) {
      onCloseContextMenu();
    }
    setSelectedElement(() => null);
  }, [contextMenu.show, onCloseContextMenu]);

  const onMove = useCallback(() => {
    if (contextMenu.show && Date.now() - lastMenuOpenTime > 300) {
      onCloseContextMenu();
    }
  }, [contextMenu.show, onCloseContextMenu, lastMenuOpenTime]);

  const onMoveEnd = useCallback(() => {
    const viewport = getViewport();
    const { nodes: currentLevelNodes, edges: currentLevelEdges } = getFlowContent(currentFlowId);
    updateFlowContent(currentFlowId, currentLevelNodes, currentLevelEdges, [viewport.x, viewport.y], viewport.zoom);

    onSchemaChange(prevSchema => ({
      ...prevSchema,
      isPanelCollapsed: isPanelCollapsedState,
      panelWidth: panelWidthState
    }));
  }, [onSchemaChange, getViewport, isPanelCollapsedState, panelWidthState, getFlowContent, currentFlowId, updateFlowContent]);

  const onContextMenuMouseLeave = useCallback((event) => {
    const relatedTarget = event.relatedTarget;
    if (!relatedTarget || !relatedTarget.closest('.context-menu')) {
      onCloseContextMenu();
    }
  }, [onCloseContextMenu]);

  const onCreateNode = useCallback(({ x, y, nodeType }) => {
    const { nodes: currentLevelNodes, edges: currentLevelEdges } = getFlowContent(currentFlowId);
    const position = screenToFlowPosition({ x, y });

    const newNode = {
      id: `node-${Date.now()}`,
      type: nodeType,
      position,
      data: {
        label: nodeType === 'inputNode' ? 'Input' :
               nodeType === 'outputNode' ? 'Output' :
               nodeType === 'populationNode' ? 'Population' :
               'Group',
        ...(nodeType === 'groupNode' && { subFlow: { nodes: [], edges: [] } })
      }
    };
    const newNodes = [...currentLevelNodes, newNode];
    setNodes(newNodes);

    const viewport = getViewport();
    updateFlowContent(currentFlowId, newNodes, currentLevelEdges, [viewport.x, viewport.y], viewport.zoom);
  }, [screenToFlowPosition, getFlowContent, currentFlowId, getViewport, updateFlowContent]);

  const onNodeClick = useCallback((event, node) => {
    const nodeType = node.type === 'inputNode' ? 'input' :
                    node.type === 'outputNode' ? 'output' :
                    node.type === 'populationNode' ? 'population' : 'node';
    
    const newSelectedElement = {
      type: nodeType,
      id: node.id,
      data: node.data,
      position: node.position,
      width: node.width,
      height: node.height
    };
    
    setSelectedElement(() => newSelectedElement);
    onCloseContextMenu();
  }, [onCloseContextMenu]);

  const onEdgeClick = useCallback((event, edge) => {
    const newSelectedElement = {
      type: 'edge',
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: edge.animated,
      data: edge.data
    };
    
    setSelectedElement(() => newSelectedElement);
    onCloseContextMenu();
  }, [onCloseContextMenu]);

  const togglePanelVisibility = useCallback(() => {
    setIsPanelVisible(prev => !prev);
  }, []);

  const handleSavePanelSettings = useCallback(({ isPanelCollapsed, panelWidth }) => {
    setIsPanelCollapsedState(isPanelCollapsed);
    setPanelWidthState(panelWidth);
    onSchemaChange(prevSchema => ({
      ...prevSchema,
      isPanelCollapsed: isPanelCollapsed,
      panelWidth: panelWidth
    }));
  }, [onSchemaChange]);

  const handleElementSettingsChange = useCallback((elementId, updatedData) => {
    const { nodes: currentLevelNodes, edges: currentLevelEdges } = getFlowContent(currentFlowId);
    const isEdge = currentLevelEdges.some(edge => edge.id === elementId);
    
    if (elementId === 'global') {
      onSchemaChange(prevSchema => ({
        ...prevSchema,
        globalParams: updatedData.globalParams
      }));
      return;
    }
    
    if (isEdge) {
      const newEdges = currentLevelEdges.map(edge => {
        if (edge.id === elementId) {
          const newStroke = updatedData.color || edge.style?.stroke || 'var(--border-color)';
          return {
            ...edge,
            style: {
              ...edge.style,
              stroke: newStroke
            },
            markerEnd: {
              ...(edge.markerEnd || {}),
              type: MarkerType.ArrowClosed,
              color: newStroke
            },
            data: {
              ...edge.data,
              ...updatedData
            }
          };
        }
        return edge;
      });
      setEdges(newEdges);
      const viewport = getViewport();
      updateFlowContent(currentFlowId, currentLevelNodes, newEdges, [viewport.x, viewport.y], viewport.zoom);
    } else {
      const newNodes = currentLevelNodes.map(node => {
        if (node.id === elementId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...updatedData
            }
          };
        }
        return node;
      });
      setNodes(newNodes);
      const viewport = getViewport();
      updateFlowContent(currentFlowId, newNodes, currentLevelEdges, [viewport.x, viewport.y], viewport.zoom);
    }
  }, [getFlowContent, currentFlowId, getViewport, updateFlowContent]);

  const drillIntoGroup = useCallback((nodeId) => {
    const nodeToDrillInto = currentSchema.nodes.find(n => n.id === nodeId); // Find from full schema
    if (nodeToDrillInto && nodeToDrillInto.type === 'groupNode' && nodeToDrillInto.data.subFlow) {
      const viewport = getViewport();
      updateFlowContent(currentFlowId, nodes, edges, [viewport.x, viewport.y], viewport.zoom); // Save current view

      setCurrentFlowId(nodeId); // Change flow ID
    }
  }, [nodes, edges, currentSchema, getViewport, currentFlowId, updateFlowContent]);

  const drillUp = useCallback(() => {
    if (!currentFlowId) return; // Already at root

    const viewport = getViewport();
    updateFlowContent(currentFlowId, nodes, edges, [viewport.x, viewport.y], viewport.zoom); // Save current view

    setCurrentFlowId(null); // Go to root level
  }, [nodes, edges, getViewport, currentFlowId, updateFlowContent]);

  // Обработчик для отслеживания кликов по документу
  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!event.target.closest('.context-menu') && contextMenu.show) {
        onCloseContextMenu();
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [contextMenu.show, onCloseContextMenu]);

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-primary)', position: 'relative' }}>
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
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onNodeDoubleClick={(event, node) => {
          if (node.type === 'groupNode') {
            drillIntoGroup(node.id);
          }
        }}
        connectOnClick={true}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        selectNodesOnDrag={true}
        deleteKeyCode="Delete"
        defaultEdgeOptions={{
          animated: false,
          type: 'default',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'var(--border-color)',
          },
          style: {
            strokeWidth: 2,
            stroke: 'var(--border-color)'
          },
          data: {
            strokeWidth: 2
          }
        }}
        onInit={instance => {
          window.reactFlowInstance = instance;
        }}
      >
        <Background />
        <Controls showZoom={false} showInteractive={false} />
        <SettingsPanel
          key={`settings-panel-${selectedElement?.id || 'none'}`}
          selectedElement={selectedElement}
          isVisible={isPanelVisible}
          onToggleVisibility={togglePanelVisibility}
          initialPanelCollapsed={isPanelCollapsedState}
          initialPanelWidth={panelWidthState}
          onSaveSettings={handleSavePanelSettings}
          onElementSettingsChange={handleElementSettingsChange}
          currentSchema={currentSchema}
        />
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
      {currentFlowId && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 100,
          backgroundColor: 'var(--bg-secondary)',
          padding: '8px 15px',
          borderRadius: '5px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          color: 'var(--text-color)',
          cursor: 'pointer'
        }} onClick={drillUp}>
          ← Назад (к {currentSchema.nodes.find(n => n.id === currentFlowId)?.data?.label || 'корню'})
        </div>
      )}
    </div>
  );
};

const FlowEditor = ({ currentSchema, onSchemaChange }) => {
  return (
    <ReactFlowProvider>
      <FlowEditorContent currentSchema={currentSchema} onSchemaChange={onSchemaChange} />
    </ReactFlowProvider>
  );
};

export default FlowEditor;