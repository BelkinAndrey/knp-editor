import React, { useMemo, useState, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, Handle, Position, ReactFlowProvider, applyEdgeChanges, applyNodeChanges, useReactFlow, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import ContextMenu from './ContextMenu';
import InputNode from '../elements/InputNode';
import OutputNode from '../elements/OutputNode';
import PopulationNode from '../elements/PopulationNode';
import axios from 'axios';
import { debounce } from 'lodash'; // Assuming lodash is available, or we can implement a simple debounce
import SettingsPanel from './SettingsPanel';
import './FlowEditor.css'; // Импорт стилей

const nodeTypes = {
  inputNode: InputNode,
  outputNode: OutputNode,
  populationNode: PopulationNode,
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
        // Загружаем состояние панели и ширину
        setIsPanelCollapsedState(loadedSchema.isPanelCollapsed || false);
        setPanelWidthState(loadedSchema.panelWidth || 300);

        // Also call onSchemaChange to update parent component's state if needed
        onSchemaChange({
          name: loadedSchema.name, // Предполагается, что name тоже сохраняется
          nodes: loadedSchema.nodes || [],
          edges: loadedSchema.edges || [],
          position: loadedSchema.position || [0, 0],
          zoom: loadedSchema.zoom || 1,
          isPanelCollapsed: loadedSchema.isPanelCollapsed || false, // Передаем загруженное состояние
          panelWidth: loadedSchema.panelWidth || 300 // Передаем загруженную ширину
        });
      } catch (error) {
        console.error('Error loading autosave data:', error);
        // Handle 404 specifically - no autosave data found, which is not an error
        if (error.response && error.response.status === 404) {
          console.log('No autosave data found.');
          // Initialize with an empty schema if no autosave data
           onSchemaChange({
            name: '', // Имя по умолчанию
            nodes: [],
            edges: [],
            position: [0, 0],
            zoom: 1,
            isPanelCollapsed: false, // Состояние панели по умолчанию
            panelWidth: 300 // Ширина панели по умолчанию
          });
           // Устанавливаем начальные состояния панели и ширины
           setIsPanelCollapsedState(false);
           setPanelWidthState(300);

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
        // В schemaToSave уже есть isPanelCollapsed и panelWidth благодаря onSchemaChange
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
    // Состояния панели и ширины теперь управляются загрузчиком и handleSavePanelSettings
    // Раскомментируем и обновляем для загрузки из основных файлов
    if (currentSchema.isPanelCollapsed !== undefined) {
      setIsPanelCollapsedState(currentSchema.isPanelCollapsed);
    }
    if (currentSchema.panelWidth !== undefined) {
      setPanelWidthState(currentSchema.panelWidth);
    }

  }, [currentSchema, setViewport]);

  const onNodesChange = useCallback(
    (changes) => {
      const newNodes = applyNodeChanges(changes, nodes);
      setNodes(newNodes);
      const viewport = getViewport();
      // Call onSchemaChange to update the parent state and trigger save effect
      onSchemaChange({
        ...currentSchema, // Сохраняем name, isPanelCollapsed, panelWidth
        nodes: newNodes,
        edges: edges,
        position: [viewport.x, viewport.y],
        zoom: viewport.zoom
      });
    },
    [nodes, edges, onSchemaChange, getViewport, currentSchema],
  );

  const onEdgesChange = useCallback(
    (changes) => {
      const newEdges = applyEdgeChanges(changes, edges);
      setEdges(newEdges);
      const viewport = getViewport();
      // Call onSchemaChange to update the parent state and trigger save effect
      onSchemaChange({
        ...currentSchema, // Сохраняем name, isPanelCollapsed, panelWidth
        nodes: nodes,
        edges: newEdges,
        position: [viewport.x, viewport.y],
        zoom: viewport.zoom
      });
    },
    [nodes, edges, onSchemaChange, getViewport, currentSchema],
  );

  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge({ ...params, animated: true }, edges);
      setEdges(newEdges);
      const viewport = getViewport();
      // Call onSchemaChange to update the parent state and trigger save effect
      onSchemaChange({
        ...currentSchema, // Сохраняем name, isPanelCollapsed, panelWidth
        nodes: nodes,
        edges: newEdges,
        position: [viewport.x, viewport.y],
        zoom: viewport.zoom
      });
    },
    [edges, nodes, onSchemaChange, getViewport, currentSchema],
  );

  const onCloseContextMenu = useCallback(() => {
    setContextMenu({ show: false, x: 0, y: 0 });
  }, []);

  const onContextMenu = useCallback((event) => {
    event.preventDefault();

    // Проверяем, был ли клик по контекстному меню или по панели настроек
    const isContextMenuClick = event.target.closest('.context-menu');
    const isSettingsPanelClick = event.target.closest('.settings-panel-wrapper') || 
                                event.target.closest('.settings-panel-container') ||
                                event.target.closest('.settings-panel') ||
                                event.target.closest('.settings-toggle-button');

    if (isContextMenuClick || isSettingsPanelClick) {
      return; // Если клик был по меню или по панели настроек, ничего не делаем
    }

    // Если меню открыто, закрываем его
    if (contextMenu.show) {
      onCloseContextMenu();
      return;
    }

    // Позиционируем меню под курсором
    const newContextMenu = { 
      show: true, 
      x: event.clientX, 
      y: event.clientY 
    };
    setContextMenu(newContextMenu);
    setLastMenuOpenTime(Date.now());
  }, [contextMenu.show, onCloseContextMenu]);

  const onPaneClick = useCallback(() => {
    if (contextMenu.show) {
      onCloseContextMenu();
    }
    setSelectedElement(null);
  }, [contextMenu.show, onCloseContextMenu]);

  const onMove = useCallback(() => {
    // Не закрываем меню, если оно было открыто менее 300мс назад
    if (contextMenu.show && Date.now() - lastMenuOpenTime > 300) {
      onCloseContextMenu();
    }
  }, [contextMenu.show, onCloseContextMenu, lastMenuOpenTime]);

  const onMoveEnd = useCallback(() => {
    // Capture viewport state after user finishes moving/zooming
    const viewport = getViewport();
    // Only update position and zoom, keep existing nodes and edges
    // Call onSchemaChange to update the parent state and trigger save effect
    onSchemaChange(prevSchema => ({
      ...prevSchema,
      position: [viewport.x, viewport.y],
      zoom: viewport.zoom,
      isPanelCollapsed: isPanelCollapsedState, // Сохраняем текущее состояние панели
      panelWidth: panelWidthState // Сохраняем текущую ширину панели
    }));
  }, [onSchemaChange, getViewport, isPanelCollapsedState, panelWidthState]);

  const onContextMenuMouseLeave = useCallback((event) => {
    // Проверяем, что курсор действительно покинул меню
    const relatedTarget = event.relatedTarget;
    if (!relatedTarget || !relatedTarget.closest('.context-menu')) {
      onCloseContextMenu();
    }
  }, [onCloseContextMenu]);

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
    onSchemaChange({
      ...currentSchema, // Сохраняем name, isPanelCollapsed, panelWidth
      nodes: newNodes,
      edges: edges,
      position: [viewport.x, viewport.y],
      zoom: viewport.zoom
    });
  }, [nodes, edges, onSchemaChange, screenToFlowPosition, getViewport, currentSchema]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedElement({ type: 'node', ...node });
    onCloseContextMenu(); // Закрываем контекстное меню при выборе ноды
  }, [onCloseContextMenu]);

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedElement({ type: 'edge', ...edge });
    onCloseContextMenu(); // Закрываем контекстное меню при выборе связи
  }, [onCloseContextMenu]);

  const togglePanelVisibility = useCallback(() => {
    setIsPanelVisible(prev => !prev);
  }, []);

  const handleSavePanelSettings = useCallback(({ isPanelCollapsed, panelWidth }) => {
    setIsPanelCollapsedState(isPanelCollapsed);
    setPanelWidthState(panelWidth);
    // Обновляем схему с новыми значениями состояния панели и ширины
    onSchemaChange(prevSchema => ({
      ...prevSchema,
      isPanelCollapsed: isPanelCollapsed,
      panelWidth: panelWidth
    }));
  }, [onSchemaChange]);

  // Обработчик для отслеживания кликов по документу
  useEffect(() => {
    const handleDocumentClick = (event) => {
      // Проверяем, был ли клик вне контекстного меню
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
        onClick={onPaneClick}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        connectOnClick={true}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        selectNodesOnDrag={true}
        deleteKeyCode="Delete"
      >
        <Background />
        <Controls showZoom={false} showInteractive={false} />
        <SettingsPanel 
          selectedElement={selectedElement}
          isVisible={isPanelVisible}
          onToggleVisibility={togglePanelVisibility}
          initialPanelCollapsed={isPanelCollapsedState} // Передаем состояние свернуто/развернуто
          initialPanelWidth={panelWidthState} // Передаем ширину
          onSaveSettings={handleSavePanelSettings} // Передаем функцию сохранения
        />
      </ReactFlow>
      {contextMenu.show && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={onCloseContextMenu}
          onCreateNode={onCreateNode}
          onMouseLeave={onContextMenuMouseLeave} // Add mouseleave handler
        />
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