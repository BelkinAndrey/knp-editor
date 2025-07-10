import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
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

const FlowEditorContent = ({ currentSchema, onSchemaChange, clearInternalSchemaRef }) => {
  const [nodes, setNodes] = useState([]); // Initialize with empty array, load will populate
  const [edges, setEdges] = useState([]); // Initialize with empty array, load will populate
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = useState(null); // Состояние для выбранного элемента
  const [isPanelVisible, setIsPanelVisible] = useState(true); // Состояние видимости панели (общее вкл/выкл)
  const [isPanelCollapsedState, setIsPanelCollapsedState] = useState(false); // Состояние свернуто/развернуто панели настроек
  const [panelWidthState, setPanelWidthState] = useState(300); // Состояние ширины панели настроек
  const { screenToFlowPosition, getViewport, setViewport } = useReactFlow();
  const [lastMenuOpenTime, setLastMenuOpenTime] = useState(0);
  const reportedSchemaRef = useRef(null); // Добавляем ref для отслеживания последнего переданного состояния

  // New: Internal schema state
  const [internalSchema, setInternalSchema] = useState(() => ({
    name: currentSchema?.name || '',
    nodes: currentSchema?.nodes || [],
    edges: currentSchema?.edges || [],
    position: currentSchema?.position || [0, 0],
    zoom: currentSchema?.zoom || 1,
    isPanelCollapsed: currentSchema?.isPanelCollapsed || false,
    panelWidth: currentSchema?.panelWidth || 300,
    globalParams: currentSchema?.globalParams || [],
    flowHistoryStack: currentSchema?.flowHistoryStack || [] // Добавляем flowHistoryStack
  }));

  // Функция для очистки internalSchema
  const clearInternalSchema = useCallback(() => {
    setInternalSchema({
      name: '',
      nodes: [],
      edges: [],
      position: [0, 0],
      zoom: 1,
      isPanelCollapsed: false,
      panelWidth: 300,
      globalParams: [],
      flowHistoryStack: []
    });
    setNodes([]);
    setEdges([]);
  }, []);

  // Пробрасываем функцию наружу через ref
  React.useEffect(() => {
    if (clearInternalSchemaRef) {
      clearInternalSchemaRef.current = clearInternalSchema;
    }
  }, [clearInternalSchema, clearInternalSchemaRef]);

  // Убираем автоматическое обновление onSchemaChange для предотвращения циклов
  // Теперь onSchemaChange будет вызываться только при определенных действиях пользователя

  // Effect to update internalSchema when currentSchema changes (e.g., when loading a file)
  useEffect(() => {
    // Выполняем глубокое сравнение, чтобы определить, действительно ли currentSchema изменился
    // и не является ли это изменением, которое мы сами отправили родителю.
    if (reportedSchemaRef.current && JSON.stringify(currentSchema) === JSON.stringify(reportedSchemaRef.current)) {
      return; // Игнорируем это обновление, так как оно пришло из FlowEditor
    }

    // Рекурсивная функция для инициализации subFlow в groupNode
    const ensureSubFlow = (nodesToProcess) => {
      return nodesToProcess.map(node => {
        if (node.type === 'groupNode') {
          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              subFlow: {
                nodes: node.data.subFlow?.nodes || [],
                edges: node.data.subFlow?.edges || [],
                position: node.data.subFlow?.position || [0, 0],
                zoom: node.data.subFlow?.zoom || 1,
              }
            }
          };
          // Рекурсивно обрабатываем вложенные subFlows
          updatedNode.data.subFlow.nodes = ensureSubFlow(updatedNode.data.subFlow.nodes);
          return updatedNode;
        }
        return node;
      });
    };

    const updatedInternalSchema = {
      name: currentSchema?.name || '',
      nodes: ensureSubFlow(currentSchema?.nodes || []),
      edges: currentSchema?.edges || [],
      position: currentSchema?.position || [0, 0],
      zoom: currentSchema?.zoom || 1,
      isPanelCollapsed: currentSchema?.isPanelCollapsed || false,
      panelWidth: currentSchema?.panelWidth || 300,
      globalParams: currentSchema?.globalParams || [],
      flowHistoryStack: currentSchema?.flowHistoryStack || []
    };

    setInternalSchema(updatedInternalSchema);
    setIsPanelCollapsedState(updatedInternalSchema.isPanelCollapsed);
    setPanelWidthState(updatedInternalSchema.panelWidth);
  }, [currentSchema]);

  // Вспомогательная функция для получения узлов и ребер текущего потока
  const getFlowContent = useCallback((historyStack) => {
    let currentNodes = internalSchema.nodes;
    let currentEdges = internalSchema.edges;
    let currentPosition = internalSchema.position;
    let currentZoom = internalSchema.zoom;

    for (const flowId of historyStack) {
      const groupNode = currentNodes.find(n => n.id === flowId);
      if (groupNode && groupNode.type === 'groupNode' && groupNode.data && groupNode.data.subFlow) {
        currentNodes = groupNode.data.subFlow.nodes;
        currentEdges = groupNode.data.subFlow.edges;
        currentPosition = groupNode.data.subFlow.position;
        currentZoom = groupNode.data.subFlow.zoom;
      } else {
        return { nodes: [], edges: [], position: [0,0], zoom: 1 };
      }
    }
    return { nodes: currentNodes, edges: currentEdges, position: currentPosition, zoom: currentZoom };
  }, [internalSchema]);

  // Вспомогательная функция для обновления узлов и ребер текущего потока
  const updateFlowContent = useCallback((historyStack, newNodes, newEdges, newPosition, newZoom, panelSettings = {}) => {
    setInternalSchema(prevSchema => {
      const updateNestedSchema = (currentLevel, pathIndex) => {
        if (pathIndex === historyStack.length) {
          return {
            ...currentLevel,
            nodes: newNodes,
            edges: newEdges,
            position: newPosition,
            zoom: newZoom
          };
        }

        const flowId = historyStack[pathIndex];
        const groupNodeIndex = currentLevel.nodes.findIndex(n => n.id === flowId);

        if (groupNodeIndex === -1 || currentLevel.nodes[groupNodeIndex].type !== 'groupNode') {
          return currentLevel;
        }

        const oldGroupNode = currentLevel.nodes[groupNodeIndex];
        const updatedSubFlow = updateNestedSchema(oldGroupNode.data.subFlow, pathIndex + 1);

        const updatedGroupNode = {
          ...oldGroupNode,
          data: {
            ...oldGroupNode.data,
            subFlow: updatedSubFlow
          }
        };

        const newCurrentLevelNodes = currentLevel.nodes.map((node, index) =>
          index === groupNodeIndex ? updatedGroupNode : node
        );

        return {
          ...currentLevel,
          nodes: newCurrentLevelNodes
        };
      };

      if (historyStack.length === 0) {
        return {
          ...prevSchema,
          nodes: newNodes,
          edges: newEdges,
          position: newPosition,
          zoom: newZoom,
          flowHistoryStack: historyStack, // Сохраняем flowHistoryStack на корневом уровне
          ...panelSettings // Применяем настройки панели к корневому уровню
        };
      } else {
        return updateNestedSchema(prevSchema, 0);
      }
    });
  }, []);

  // Effect to load autosave data on mount
  useEffect(() => {
    const loadAutosave = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/autosave');
        const loadedSchema = response.data;

        // Recursively ensure all group nodes have subFlow initialized
        const ensureSubFlow = (nodesToProcess) => {
          return nodesToProcess.map(node => {
            if (node.type === 'groupNode') {
              const updatedNode = {
                ...node,
                data: {
                  ...node.data,
                  subFlow: {
                    nodes: node.data.subFlow?.nodes || [],
                    edges: node.data.subFlow?.edges || [],
                    position: node.data.subFlow?.position || [0, 0],
                    zoom: node.data.subFlow?.zoom || 1,
                  }
                }
              };
              // Recursively process nested subFlows
              updatedNode.data.subFlow.nodes = ensureSubFlow(updatedNode.data.subFlow.nodes);
              return updatedNode;
            }
            return node;
          });
        };

        const initializedSchema = {
          ...loadedSchema,
          nodes: ensureSubFlow(loadedSchema.nodes || []),
          // Also ensure root level position and zoom are initialized if missing
          position: loadedSchema.position || [0, 0],
          zoom: loadedSchema.zoom || 1,
          flowHistoryStack: loadedSchema.flowHistoryStack || [] // Инициализация flowHistoryStack
        };
        setInternalSchema(initializedSchema);

        setIsPanelCollapsedState(initializedSchema.isPanelCollapsed || false);
        setPanelWidthState(initializedSchema.panelWidth || 300);

      } catch (error) {
        console.error('Error loading autosave data:', error);
        if (error.response && error.response.status === 404) {
          console.log('No autosave data found.');
           setInternalSchema({
            name: '',
            nodes: [],
            edges: [],
            position: [0, 0],
            zoom: 1,
            isPanelCollapsed: false,
            panelWidth: 300,
            globalParams: [],
            flowHistoryStack: [] // Инициализация flowHistoryStack при отсутствии данных
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

  // Update local state when internalSchema changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges, position: flowPosition, zoom: flowZoom } = getFlowContent(internalSchema.flowHistoryStack || []);
    setNodes(newNodes);
    setEdges(newEdges);

    // Ensure flowPosition is an array and flowZoom is a number before accessing its elements
    if (Array.isArray(flowPosition) && flowPosition.length === 2 && typeof flowZoom === 'number') {
      setViewport({ x: flowPosition[0], y: flowPosition[1], zoom: flowZoom });
    } else {
      console.warn("Invalid flowPosition or flowZoom received from getFlowContent:", flowPosition, flowZoom);
      // Fallback to default viewport if data is invalid
      setViewport({ x: 0, y: 0, zoom: 1 });
    }

    if (internalSchema.isPanelCollapsed !== undefined) {
      setIsPanelCollapsedState(internalSchema.isPanelCollapsed);
    }
    if (internalSchema.panelWidth !== undefined) {
      setPanelWidthState(internalSchema.panelWidth);
    }

  }, [internalSchema, setViewport, getFlowContent]); // Removed flowHistoryStack from dependencies

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
    debouncedSave(internalSchema);
    return () => {
      debouncedSave.cancel();
    };
  }, [internalSchema, debouncedSave]);

  // Debounced effect to update parent schema
  const debouncedParentUpdate = useCallback(
    debounce((schemaToUpdate) => {
      reportedSchemaRef.current = schemaToUpdate; // Обновляем ref перед передачей родителю
      onSchemaChange(schemaToUpdate);
    }, 2000),
    [onSchemaChange]
  );

  // Effect to trigger debounced parent update when internalSchema changes
  useEffect(() => {
    debouncedParentUpdate(internalSchema);
    return () => {
      debouncedParentUpdate.cancel();
    };
  }, [internalSchema, debouncedParentUpdate]);

  const onNodesChange = useCallback(
    (changes) => {
      const { nodes: currentLevelNodes, edges: currentLevelEdges } = getFlowContent(internalSchema.flowHistoryStack || []);
      const newNodes = applyNodeChanges(changes, currentLevelNodes);
      setNodes(newNodes);

      const viewport = getViewport();
      updateFlowContent(internalSchema.flowHistoryStack || [], newNodes, currentLevelEdges, [viewport.x, viewport.y], viewport.zoom);
    },
    [getFlowContent, internalSchema.flowHistoryStack, getViewport, updateFlowContent],
  );

  const onEdgesChange = useCallback(
    (changes) => {
      const { nodes: currentLevelNodes, edges: currentLevelEdges } = getFlowContent(internalSchema.flowHistoryStack || []);
      const newEdges = applyEdgeChanges(changes, currentLevelEdges);
      setEdges(newEdges);

      const viewport = getViewport();
      updateFlowContent(internalSchema.flowHistoryStack || [], currentLevelNodes, newEdges, [viewport.x, viewport.y], viewport.zoom);
    },
    [getFlowContent, internalSchema.flowHistoryStack, getViewport, updateFlowContent],
  );

  const onConnect = useCallback(
    (params) => {
      const { nodes: currentLevelNodes, edges: currentLevelEdges } = getFlowContent(internalSchema.flowHistoryStack || []);
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
      updateFlowContent(internalSchema.flowHistoryStack || [], currentLevelNodes, newEdges, [viewport.x, viewport.y], viewport.zoom);
    },
    [getFlowContent, internalSchema.flowHistoryStack, getViewport, updateFlowContent],
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
    const { nodes: currentLevelNodes, edges: currentLevelEdges } = getFlowContent(internalSchema.flowHistoryStack || []);
    updateFlowContent(internalSchema.flowHistoryStack || [],
                      currentLevelNodes,
                      currentLevelEdges,
                      [viewport.x, viewport.y],
                      viewport.zoom,
                      { isPanelCollapsed: isPanelCollapsedState, panelWidth: panelWidthState } // Передаем настройки панели
    );
  }, [getViewport, isPanelCollapsedState, panelWidthState, getFlowContent, internalSchema.flowHistoryStack, updateFlowContent]);

  const onContextMenuMouseLeave = useCallback((event) => {
    const relatedTarget = event.relatedTarget;
    if (!relatedTarget || !relatedTarget.closest('.context-menu')) {
      onCloseContextMenu();
    }
  }, [onCloseContextMenu]);

  const onCreateNode = useCallback(({ x, y, nodeType }) => {
    const { nodes: currentLevelNodes, edges: currentLevelEdges } = getFlowContent(internalSchema.flowHistoryStack || []);
    const position = screenToFlowPosition({ x, y });

    const newNode = {
      id: `node-${Date.now()}`,
      type: nodeType,
      position,
      data: {
        label: nodeType === 'inputNode' ? 'Input' :
               nodeType === 'outputNode' ? 'Output' :
               nodeType === 'populationNode' ? 'Population' :
               nodeType === 'groupNode' ? 'Group' :
               'Node',
        ...(nodeType === 'groupNode' && { subFlow: { nodes: [], edges: [], position: [0, 0], zoom: 1 } })
      }
    };
    const newNodes = [...currentLevelNodes, newNode];
    setNodes(newNodes);

    const viewport = getViewport();
    updateFlowContent(internalSchema.flowHistoryStack || [], newNodes, currentLevelEdges, [viewport.x, viewport.y], viewport.zoom);
  }, [screenToFlowPosition, getFlowContent, internalSchema.flowHistoryStack, getViewport, updateFlowContent]);

  const onNodeClick = useCallback((event, node) => {
    const nodeType = node.type === 'inputNode' ? 'input' :
                    node.type === 'outputNode' ? 'output' :
                    node.type === 'populationNode' ? 'population' :
                    node.type === 'groupNode' ? 'group' : 'node';
    
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
    setInternalSchema(prevSchema => ({
      ...prevSchema,
      isPanelCollapsed: isPanelCollapsed,
      panelWidth: panelWidth
    }));
  }, []);

  // Функция для ручного сохранения изменений в родительский компонент
  const saveToParent = useCallback(() => {
    onSchemaChange(internalSchema);
  }, [internalSchema, onSchemaChange]);

  const handleElementSettingsChange = useCallback((elementId, updatedData) => {
    const { nodes: currentLevelNodes, edges: currentLevelEdges } = getFlowContent(internalSchema.flowHistoryStack || []);
    const isEdge = currentLevelEdges.some(edge => edge.id === elementId);
    
    if (elementId === 'global') {
      setInternalSchema(prevSchema => ({
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
      updateFlowContent(internalSchema.flowHistoryStack || [], currentLevelNodes, newEdges, [viewport.x, viewport.y], viewport.zoom);
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
      updateFlowContent(internalSchema.flowHistoryStack || [], newNodes, currentLevelEdges, [viewport.x, viewport.y], viewport.zoom);
    }
  }, [getFlowContent, internalSchema.flowHistoryStack, getViewport, updateFlowContent]);

  const drillIntoGroup = useCallback((nodeId) => {
    // Ищем узел группы на ТЕКУЩЕМ уровне, а не всегда в корневой схеме
    const nodeToDrillInto = nodes.find(n => n.id === nodeId);
    if (nodeToDrillInto && nodeToDrillInto.type === 'groupNode' && nodeToDrillInto.data.subFlow) {
      const viewport = getViewport();
      // Сохраняем текущее состояние потока перед проваливанием
      updateFlowContent(internalSchema.flowHistoryStack || [], nodes, edges, [viewport.x, viewport.y], viewport.zoom);

      // Добавляем ID группы в стек истории и обновляем текущий FlowId
      const newFlowHistoryStack = [...(internalSchema.flowHistoryStack || []), nodeId];
      // setFlowHistoryStack(newFlowHistoryStack); // REMOVED
      setInternalSchema(prevSchema => ({ // Обновляем internalSchema с новым стеком
        ...prevSchema,
        flowHistoryStack: newFlowHistoryStack
      }));
    }
  }, [nodes, edges, getViewport, internalSchema.flowHistoryStack, updateFlowContent]);

  const drillUp = useCallback(() => {
    if ((internalSchema.flowHistoryStack || []).length === 0) return; // Уже на корневом уровне

    const viewport = getViewport();
    // Сохраняем текущее состояние потока перед возвратом
    updateFlowContent(internalSchema.flowHistoryStack || [], nodes, edges, [viewport.x, viewport.y], viewport.zoom);

    // Удаляем последний ID из стека истории
    const newFlowHistoryStack = (internalSchema.flowHistoryStack || []).slice(0, -1);
    // setFlowHistoryStack(newFlowHistoryStack); // REMOVED
    setInternalSchema(prevSchema => ({
      ...prevSchema,
      flowHistoryStack: newFlowHistoryStack
    }));
  }, [nodes, edges, getViewport, internalSchema.flowHistoryStack, updateFlowContent]);

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
      {internalSchema.flowHistoryStack?.length > 0 && ( // Use internalSchema.flowHistoryStack
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
          ← Назад (к {currentSchema.nodes.find(n => n.id === internalSchema.flowHistoryStack[internalSchema.flowHistoryStack.length - 1])?.data?.label || 'корню'})
        </div>
      )}
    </div>
  );
};

const FlowEditor = ({ currentSchema, onSchemaChange, clearInternalSchemaRef }) => {
  return (
    <ReactFlowProvider>
      <FlowEditorContent currentSchema={currentSchema} onSchemaChange={onSchemaChange} clearInternalSchemaRef={clearInternalSchemaRef} />
    </ReactFlowProvider>
  );
};

export default FlowEditor;