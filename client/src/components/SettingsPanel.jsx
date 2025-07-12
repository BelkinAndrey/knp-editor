import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './SettingsPanel.css'; // Import styles for the settings panel and button
import NeuronParamsPanel from './NeuronParamsPanel';
import EdgeParamsPanel from './EdgeParamsPanel';

const SettingsPanel = ({ selectedElement, isVisible, onToggleVisibility, initialPanelCollapsed = false, initialPanelWidth = 300, onSaveSettings, onElementSettingsChange, currentSchema }) => {
  const [panelWidth, setPanelWidth] = useState(initialPanelWidth); // Initial panel width from props
  const [isResizing, setIsResizing] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(initialPanelCollapsed); // Collapsed/expanded state
  const [isNeuronParamsCollapsed, setIsNeuronParamsCollapsed] = useState(false);
  const panelRef = useRef(null);
  const [populationLabel, setPopulationLabel] = useState(''); // State for population label input
  const [inputOutputLabel, setInputOutputLabel] = useState(''); // Новое состояние для метки input/output
  const [groupLabel, setGroupLabel] = useState(''); // Новое состояние для метки group
  const [populationColor, setPopulationColor] = useState('#000000'); // Добавляем состояние для цвета
  const [edgeColor, setEdgeColor] = useState('#000000'); // Добавляем состояние для цвета проекции
  const [neuronType, setNeuronType] = useState('BLIFATNeuron'); // Новое состояние для типа нейрона
  const [neuronCount, setNeuronCount] = useState('1'); // Новое состояние для количества нейронов
  const [neuronParams, setNeuronParams] = useState({}); // Новое состояние для параметров нейрона
  const [edgeType, setEdgeType] = useState('DeltaSynapse'); // Новое состояние для типа синапса
  const [edgeParams, setEdgeParams] = useState({}); // Новое состояние для параметров синапса
  const [isEdgeParamsCollapsed, setIsEdgeParamsCollapsed] = useState(false); // Состояние для сворачивания панели параметров синапса
  const [edgePanels, setEdgePanels] = useState([]); // Новое состояние для хранения панелей параметров проекции
  const [populationEdgePanels, setPopulationEdgePanels] = useState([]); // Новое состояние для хранения панелей проекций в популяции
  const [globalParams, setGlobalParams] = useState([]); // Состояние для глобальных параметров
  const [showAddParamMenu, setShowAddParamMenu] = useState(false); // Состояние для отображения меню добавления параметра
  const [newParamType, setNewParamType] = useState('float'); // Тип нового параметра
  const [newParamName, setNewParamName] = useState('name_parameter'); // Изменяем начальное значение
  const [newParamValue, setNewParamValue] = useState(''); // Значение нового параметра
  
  // Эффект для инициализации globalParams при изменении currentSchema
  useEffect(() => {
    if (currentSchema?.globalParams) {
      setGlobalParams(currentSchema.globalParams);
    }
  }, [currentSchema?.globalParams]);

  // Флаги для отслеживания изменений
  const isInitialMount = useRef(true);
  const prevElementIdRef = useRef(null);
  const prevValuesRef = useRef({
    neuronParams: {},
    neuronType: '',
    neuronCount: '',
    populationLabel: '',
    populationColor: '',
    edgeColor: '',
    edgeType: '',
    edgeParams: {}
  });

  // Добавляем функцию для получения параметров по умолчанию
  const getDefaultEdgeParams = useCallback((edgeType) => {
    switch (edgeType) {
      case 'DeltaSynapse':
        return {
          weight_: 1.0,
          delay_: 0
        };
      case 'AdditiveSTDPDeltaSynapse':
        return {
          weight_: 1.0,
          delay_: 0,
          tau_plus_: 10,
          tau_minus_: 10,
          OutputType: 'EXCITATORY',
          train: true
        };
      case 'SynapticResourceSTDPDeltaSynapse':
        return {
          weight_: 1.0,
          delay_: 0,
          synaptic_resource_: 0,
          w_min_: 0,
          w_max_: 1,
          d_u_: 0,
          dopamine_plasticity_period_: 0,
          OutputType: 'EXCITATORY',
          train: true
        };
      default:
        return {};
    }
  }, []);

  // Вспомогательная функция для обработки панелей проекций (добавление параметров по умолчанию)
  const processEdgePanels = useCallback((panels) => {
    return panels.map(panel => ({
      ...panel,
      edgeParams: {
        ...getDefaultEdgeParams(panel.edgeType),
        ...panel.edgeParams
      }
    }));
  }, [getDefaultEdgeParams]);

  // Эффект для инициализации состояния при изменении selectedElement
  useEffect(() => {
    // Если элемент не изменился, не обновляем состояние
    if (selectedElement?.id === prevElementIdRef.current) {
      return;
    }

    prevElementIdRef.current = selectedElement?.id;

    if (!selectedElement) {
      // Сбрасываем состояние при отсутствии выбранного элемента
      setPopulationLabel('');
      setInputOutputLabel(''); // Добавляем сброс метки input/output
      setGroupLabel(''); // Добавляем сброс метки group
      setPopulationColor('#000000');
      setEdgeColor('#000000');
      setNeuronType('BLIFATNeuron');
      setNeuronCount('1');
      setNeuronParams({});
      setIsNeuronParamsCollapsed(false);
      setEdgeType('DeltaSynapse');
      setEdgeParams({});
      setIsEdgeParamsCollapsed(false);
      return;
    }

    // Инициализируем состояние из данных элемента
    if (selectedElement.type === 'population') {
      // Получаем данные из элемента
      const elementData = selectedElement.data || {};
      
      // Обновляем все состояния с проверкой на существование значений
      const newLabel = elementData.label || '';
      const newColor = elementData.color || '#000000';
      const newNeuronType = elementData.neuronType || 'BLIFATNeuron';
      const newNeuronCount = (elementData.neuronCount || 1).toString();
      setIsNeuronParamsCollapsed(elementData.isNeuronParamsCollapsed || false);
      
      // Получаем параметры нейрона для текущего типа
      let neuronTypeParams = {};
      
      // Проверяем наличие параметров в данных элемента
      if (elementData.neuronParams) {
        // Если есть параметры для текущего типа, используем их
        if (elementData.neuronParams[newNeuronType]) {
          neuronTypeParams = { ...elementData.neuronParams[newNeuronType] };
        } else {
          // Если параметров нет, инициализируем значения по умолчанию в зависимости от типа
          switch (newNeuronType) {
            case 'BLIFATNeuron':
              neuronTypeParams = {
                threshold: -50,
                tau: 20,
                restPotential: -70
              };
              break;
            case 'SynapticResourceSTDPNeuron':
              neuronTypeParams = {
                threshold: -50,
                tau: 20,
                restPotential: -70,
                resourceAmount: 1.0,
                recoveryTime: 100
              };
              break;
            case 'AltAILIF':
              neuronTypeParams = {
                threshold: -50,
                tau: 20,
                restPotential: -70,
                refractoryPeriod: 5
              };
              break;
            default:
              neuronTypeParams = {};
          }
        }
      }
      
      // Обновляем состояния
      setPopulationLabel(newLabel);
      setPopulationColor(newColor);
      setNeuronType(newNeuronType);
      setNeuronCount(newNeuronCount);
      setNeuronParams(neuronTypeParams);

      // Если параметры были инициализированы значениями по умолчанию, обновляем их в родительском компоненте
      if (!elementData.neuronParams?.[newNeuronType]) {
        onElementSettingsChange?.(selectedElement.id, {
          neuronParams: {
            [newNeuronType]: neuronTypeParams
          }
        });
      }

      // Инициализируем панели проекций из данных элемента
      const panels = elementData.populationEdgePanels || [];
      
      // Если панелей нет, создаем пустой массив
      if (panels.length === 0) {
        setPopulationEdgePanels([]);
      } else {
        // Проверяем и добавляем параметры по умолчанию для существующих панелей
        setPopulationEdgePanels(processEdgePanels(panels));
      }
    } else if (selectedElement.type === 'input' || selectedElement.type === 'output') {
      const elementData = selectedElement.data || {};
      const newLabel = elementData.label || '';
      setInputOutputLabel(newLabel);
    } else if (selectedElement.type === 'group') {
      const elementData = selectedElement.data || {};
      const newLabel = elementData.label || '';
      setGroupLabel(newLabel);
      
      // Если нода имеет родителя, не показываем subFlow в настройках
      // так как она использует схему родителя
      if (elementData.parent) {
        // Нода является наследником - показываем информацию о родителе
        // subFlow будет пустым, так как используется схема родителя
      } else {
        // Нода является независимой - может иметь свой subFlow
      }
    } else if (selectedElement.type === 'edge') {
      const elementData = selectedElement.data || {};
      const newColor = elementData.color || '#000000';
      const newEdgeType = elementData.edgeType || 'DeltaSynapse';
      
      // Инициализируем панели из данных элемента
      const panels = elementData.edgePanels || [];
      
      // Если панелей нет, создаем первую по умолчанию
      if (panels.length === 0) {
        const defaultPanel = {
          id: Date.now(),
          edgeType: newEdgeType,
          edgeParams: getDefaultEdgeParams(newEdgeType),
          isCollapsed: false
        };
        setEdgePanels([defaultPanel]);
        onElementSettingsChange?.(selectedElement.id, {
          edgePanels: [defaultPanel]
        });
      } else {
        // Проверяем и добавляем параметры по умолчанию для существующих панелей
        setEdgePanels(processEdgePanels(panels));
      }
      
      setEdgeColor(newColor);
    }
  }, [selectedElement?.id, onElementSettingsChange, processEdgePanels]); // Добавлен processEdgePanels в зависимости useEffect

  // Обработчик изменения параметров нейрона
  const handleNeuronParamChange = useCallback((paramName, value) => {
    if (!selectedElement) return;
    
    const newParams = {
      ...neuronParams,
      [paramName]: value
    };
    
    setNeuronParams(newParams);
    
    // Немедленно обновляем родительский компонент с правильной структурой
    onElementSettingsChange?.(selectedElement.id, {
      neuronParams: {
        [neuronType]: newParams
      }
    });
  }, [selectedElement, neuronParams, neuronType, onElementSettingsChange]);

  // Обновляем обработчики
  const handlePopulationLabelChange = useCallback((newValue) => {
    if (!selectedElement) return;
    
    const value = newValue.replace(/\s+/g, '');
    setPopulationLabel(value);
    
    onElementSettingsChange?.(selectedElement.id, {
      label: value
    });
  }, [selectedElement, onElementSettingsChange]);

  const handlePopulationColorChange = useCallback((newColor) => {
    if (!selectedElement) return;
    
    setPopulationColor(newColor);
    
    onElementSettingsChange?.(selectedElement.id, {
      color: newColor
    });
  }, [selectedElement, onElementSettingsChange]);

  const handleNeuronTypeChange = useCallback((newType) => {
    if (!selectedElement) return;
    
    setNeuronType(newType);
    setNeuronParams({});
    
    // Инициализируем параметры по умолчанию для нового типа
    let defaultParams = {};
    switch (newType) {
      case 'BLIFATNeuron':
        defaultParams = {
          threshold: -50,
          tau: 20,
          restPotential: -70
        };
        break;
      case 'SynapticResourceSTDPNeuron':
        defaultParams = {
          threshold: -50,
          tau: 20,
          resourceAmount: 1.0,
          recoveryTime: 100
        };
        break;
      case 'AltAILIF':
        defaultParams = {
          threshold: -50,
          tau: 20,
          refractoryPeriod: 5
        };
        break;
      default:
        defaultParams = {};
    }
    
    onElementSettingsChange?.(selectedElement.id, {
      neuronType: newType,
      neuronParams: {
        [newType]: defaultParams
      }
    });
  }, [selectedElement, onElementSettingsChange]);

  const handleNeuronCountChange = useCallback((value) => {
    if (!selectedElement) return;
    
    setNeuronCount(value);
    onElementSettingsChange?.(selectedElement.id, {
      neuronCount: value === '' ? 1 : parseFloat(value)
    });
  }, [selectedElement, onElementSettingsChange]);

  const handleEdgeColorChange = useCallback((newColor) => {
    if (!selectedElement) return;
    
    setEdgeColor(newColor);
    
    onElementSettingsChange?.(selectedElement.id, {
      color: newColor
    });
  }, [selectedElement, onElementSettingsChange]);

  const handleAddGenerator = useCallback(() => {
    if (!selectedElement) return;
    
    const defaultType = 'DeltaSynapse';
    const newPanel = {
      id: Date.now(),
      edgeType: defaultType,
      edgeParams: getDefaultEdgeParams(defaultType),
      isCollapsed: false
    };
    
    const updatedPanels = [...edgePanels, newPanel];
    setEdgePanels(updatedPanels);
    
    onElementSettingsChange?.(selectedElement.id, {
      edgePanels: updatedPanels
    });
  }, [selectedElement, edgePanels, onElementSettingsChange]);

  const handleRemovePanel = useCallback((panelId) => {
    if (!selectedElement) return;
    
    const updatedPanels = edgePanels.filter(panel => panel.id !== panelId);
    setEdgePanels(updatedPanels);
    
    onElementSettingsChange?.(selectedElement.id, {
      edgePanels: updatedPanels
    });
  }, [selectedElement, edgePanels, onElementSettingsChange]);

  const handlePanelChange = useCallback((panelId, changes) => {
    if (!selectedElement) return;
    
    const updatedPanels = edgePanels.map(panel => {
      if (panel.id === panelId) {
        // Если меняется тип синапса, добавляем параметры по умолчанию
        if (changes.edgeType) {
          return {
            ...panel,
            ...changes,
            edgeParams: {
              ...getDefaultEdgeParams(changes.edgeType),
              ...panel.edgeParams
            }
          };
        }
        return { ...panel, ...changes };
      }
      return panel;
    });
    
    setEdgePanels(updatedPanels);
    
    onElementSettingsChange?.(selectedElement.id, {
      edgePanels: updatedPanels
    });
  }, [selectedElement, edgePanels, onElementSettingsChange]);

  // Добавляем обработчики для панелей проекций в популяции
  const handleAddPopulationEdgePanel = useCallback(() => {
    if (!selectedElement) return;
    
    const defaultType = 'DeltaSynapse';
    const newPanel = {
      id: Date.now(),
      edgeType: defaultType,
      edgeParams: getDefaultEdgeParams(defaultType),
      isCollapsed: false
    };
    
    const updatedPanels = [...populationEdgePanels, newPanel];
    setPopulationEdgePanels(updatedPanels);
    
    onElementSettingsChange?.(selectedElement.id, {
      populationEdgePanels: updatedPanels
    });
  }, [selectedElement, populationEdgePanels, onElementSettingsChange]);

  const handleRemovePopulationEdgePanel = useCallback((panelId) => {
    if (!selectedElement) return;
    
    const updatedPanels = populationEdgePanels.filter(panel => panel.id !== panelId);
    setPopulationEdgePanels(updatedPanels);
    
    onElementSettingsChange?.(selectedElement.id, {
      populationEdgePanels: updatedPanels
    });
  }, [selectedElement, populationEdgePanels, onElementSettingsChange]);

  const handlePopulationEdgePanelChange = useCallback((panelId, changes) => {
    if (!selectedElement) return;
    
    const updatedPanels = populationEdgePanels.map(panel => {
      if (panel.id === panelId) {
        // Если меняется тип синапса, добавляем параметры по умолчанию
        if (changes.edgeType) {
          return {
            ...panel,
            ...changes,
            edgeParams: {
              ...getDefaultEdgeParams(changes.edgeType),
              ...panel.edgeParams
            }
          };
        }
        return { ...panel, ...changes };
      }
      return panel;
    });
    
    setPopulationEdgePanels(updatedPanels);
    
    onElementSettingsChange?.(selectedElement.id, {
      populationEdgePanels: updatedPanels
    });
  }, [selectedElement, populationEdgePanels, onElementSettingsChange]);

  // Добавляем массив предустановленных цветов
  const presetColors = [
    '#FFFFFF', // белый
    '#FF0000', // красный
    '#00FF00', // зеленый
    '#0000FF', // синий
    '#FFFF00', // желтый
    '#FF00FF', // пурпурный
    '#00FFFF', // голубой
    '#808080', // серый
    '#FFA500', // оранжевый
    '#800080', // фиолетовый
    '#008000', // темно-зеленый
    '#800000', // темно-красный
    '#000080', // темно-синий
    '#FFD700', // золотой
    '#A52A2A', // коричневый
  ];

  // Memoize element type display
  const elementTypeDisplay = useMemo(() => {
    if (!selectedElement) {
      return '';
    }
    
    const typeMap = {
      'edge': 'Projection',
      'population': 'Population',
      'input': 'Input',
      'output': 'Output',
      'group': 'Group'
    };
    
    return typeMap[selectedElement.type] || selectedElement.type;
  }, [selectedElement]);

  const handleMouseDown = (e) => {
    setIsResizing(true);
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    const newWidth = document.body.clientWidth - e.clientX;
    const minWidth = 300; // Minimum panel width
    setPanelWidth(Math.max(minWidth, newWidth));
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    // Save panel width after resizing
    if (onSaveSettings) {
      onSaveSettings({ isPanelCollapsed, panelWidth });
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, panelWidth, isPanelCollapsed]); // Добавляем зависимости panelWidth и isPanelCollapsed

  // Effect to set initial width and state on load
  useEffect(() => {
    setPanelWidth(initialPanelWidth);
    setIsPanelCollapsed(initialPanelCollapsed);
  }, [initialPanelWidth, initialPanelCollapsed]);

  const handleToggleCollapse = () => {
    const newCollapsedState = !isPanelCollapsed;
    setIsPanelCollapsed(newCollapsedState);
    // Save collapsed/expanded state
    if (onSaveSettings) {
      onSaveSettings({ isPanelCollapsed: newCollapsedState, panelWidth });
    }
  };

  const handlePresetColorClick = (color) => {
    setPopulationColor(color);
    if (onElementSettingsChange && selectedElement) {
      onElementSettingsChange(selectedElement.id, { color });
    }
  };

  // Обработчик изменения состояния свернутости панели параметров нейрона
  const handleNeuronParamsCollapseChange = useCallback((newCollapsedState) => {
    setIsNeuronParamsCollapsed(newCollapsedState);
    if (selectedElement && onElementSettingsChange) {
      onElementSettingsChange(selectedElement.id, {
        isNeuronParamsCollapsed: newCollapsedState
      });
    }
  }, [selectedElement, onElementSettingsChange]);

  // Добавляем обработчик изменения типа синапса
  const handleEdgeTypeChange = useCallback((newType) => {
    if (!selectedElement) return;
    
    setEdgeType(newType);
    setEdgeParams({});
    
    // Инициализируем параметры по умолчанию для нового типа
    let defaultParams = {};
    switch (newType) {
      case 'DeltaSynapse':
        defaultParams = {
          weight_: 1.0,
          delay_: 0
        };
        break;
      case 'AdditiveSTDPDeltaSynapse':
        defaultParams = {
          weight_: 1.0,
          delay_: 0,
        };
        break;
      case 'SynapticResourceSTDPDeltaSynapse':
        defaultParams = {
          weight_: 1.0,
          delay_: 0,
        };
        break;
      default:
        defaultParams = {};
    }
    
    onElementSettingsChange?.(selectedElement.id, {
      edgeType: newType,
      edgeParams: {
        [newType]: defaultParams
      }
    });
  }, [selectedElement, onElementSettingsChange]);

  // Добавляем обработчик изменения параметров синапса
  const handleEdgeParamChange = useCallback((paramName, value) => {
    if (!selectedElement) return;
    
    const newParams = {
      ...edgeParams,
      [paramName]: value
    };
    
    setEdgeParams(newParams);
    
    onElementSettingsChange?.(selectedElement.id, {
      edgeParams: {
        [edgeType]: newParams
      }
    });
  }, [selectedElement, edgeParams, edgeType, onElementSettingsChange]);

  // Добавляем обработчик изменения состояния свернутости панели параметров синапса
  const handleEdgeParamsCollapseChange = useCallback((newCollapsedState) => {
    setIsEdgeParamsCollapsed(newCollapsedState);
    if (selectedElement && onElementSettingsChange) {
      onElementSettingsChange(selectedElement.id, {
        isEdgeParamsCollapsed: newCollapsedState
      });
    }
  }, [selectedElement, onElementSettingsChange]);

  const handleAddReverseProjection = useCallback(() => {
    if (!selectedElement) return;
    
    // Здесь будет логика добавления обратной проекции
    // TODO: Реализовать логику создания обратной проекции
    console.log('Add reverse projection clicked for population:', selectedElement.id);
  }, [selectedElement]);

  // Добавляем обработчик изменения метки для input/output
  const handleInputOutputLabelChange = useCallback((newValue) => {
    if (!selectedElement) return;
    
    const value = newValue.replace(/\s+/g, '');
    setInputOutputLabel(value);
    
    onElementSettingsChange?.(selectedElement.id, {
      label: value
    });
  }, [selectedElement, onElementSettingsChange]);

  // Добавляем обработчик изменения метки для group
  const handleGroupLabelChange = useCallback((newValue) => {
    if (!selectedElement) return;
    
    const value = newValue.replace(/\s+/g, '');
    setGroupLabel(value);
    
    onElementSettingsChange?.(selectedElement.id, {
      label: value
    });
  }, [selectedElement, onElementSettingsChange]);

  // Функция для получения дефолтного значения по типу
  const getDefaultValueByType = useCallback((type) => {
    switch (type) {
      case 'float':
        return '0.0';
      case 'int':
        return '0';
      case 'bool':
        return false;
      default:
        return '';
    }
  }, []);

  // Обработчик изменения типа параметра
  const handleParamTypeChange = useCallback((type) => {
    setNewParamType(type);
    setNewParamValue(getDefaultValueByType(type));
  }, [getDefaultValueByType]);

  // Обновляем обработчик показа формы добавления параметра
  const handleShowAddParamMenu = useCallback(() => {
    setShowAddParamMenu(true);
    setNewParamName('name_parameter'); // Устанавливаем дефолтное значение
    setNewParamValue(getDefaultValueByType(newParamType));
  }, [newParamType, getDefaultValueByType]);

  // Обновим обработчик изменения значения параметра
  const handleGlobalParamChange = useCallback((paramId, newValue) => {
    const param = globalParams.find(p => p.id === paramId);
    if (!param) return;

    // Для булевых значений преобразуем строки в булевы значения
    let finalValue = newValue;
    if (param.type === 'bool') {
      finalValue = typeof newValue === 'string' ? newValue === 'true' : Boolean(newValue);
    }

    const updatedParams = globalParams.map(p => 
      p.id === paramId ? { ...p, value: finalValue } : p
    );
    setGlobalParams(updatedParams);
    onElementSettingsChange?.('global', { globalParams: updatedParams });
  }, [globalParams, onElementSettingsChange]);

  // Обновим обработчик изменения значения в форме добавления
  const handleNewParamValueChange = useCallback((value) => {
    if (newParamType === 'bool') {
      // Преобразуем значение в булево
      const boolValue = typeof value === 'string' ? value === 'true' : Boolean(value);
      setNewParamValue(boolValue);
      return;
    }
    setNewParamValue(value);
  }, [newParamType]);

  // Обновим обработчик добавления нового параметра
  const handleAddGlobalParam = useCallback(() => {
    if (!newParamName.trim()) return;

    // Для булевых значений преобразуем в булево значение
    let finalValue = newParamValue;
    if (newParamType === 'bool') {
      finalValue = typeof newParamValue === 'string' ? newParamValue === 'true' : Boolean(newParamValue);
    }

    const newParam = {
      id: Date.now(),
      name: newParamName.trim(),
      type: newParamType,
      value: finalValue
    };

    const updatedParams = [...globalParams, newParam];
    setGlobalParams(updatedParams);
    
    onElementSettingsChange?.('global', {
      globalParams: updatedParams
    });

    setNewParamName('name_parameter');
    setNewParamValue(getDefaultValueByType(newParamType));
    setShowAddParamMenu(false);
  }, [globalParams, newParamName, newParamType, newParamValue, onElementSettingsChange, getDefaultValueByType]);

  // Добавляем обработчик удаления глобального параметра
  const handleRemoveGlobalParam = useCallback((paramId) => {
    const updatedParams = globalParams.filter(param => param.id !== paramId);
    setGlobalParams(updatedParams);
    
    onElementSettingsChange?.('global', {
      globalParams: updatedParams
    });
  }, [globalParams, onElementSettingsChange]);

  // Обработчик для выхода из родительской ноды
  const handleLeaveParent = useCallback(() => {
    if (!selectedElement || !selectedElement.data?.parent) return;
    
    // Получаем схему родителя
    const allNodes = window.reactFlowInstance ? window.reactFlowInstance.getNodes() : [];
    const parentNode = allNodes.find(node => node.id === selectedElement.data.parent);
    
    if (parentNode?.data?.subFlow) {
      // Создаем глубокую копию схемы родителя
      const deepCopySubFlow = (subFlow) => {
        if (!subFlow) return { nodes: [], edges: [], position: [0, 0], zoom: 1 };
        
        const idMap = new Map();
        
        const newNodes = subFlow.nodes ? subFlow.nodes.map(node => {
          const newNodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          idMap.set(node.id, newNodeId);
          
          return {
            ...node,
            id: newNodeId,
            data: {
              ...node.data,
              ...(node.type === 'groupNode' && { subFlow: deepCopySubFlow(node.data.subFlow) })
            }
          };
        }) : [];
        
        const newEdges = subFlow.edges ? subFlow.edges.map(edge => {
          const newEdgeId = `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const newSource = idMap.get(edge.source) || edge.source;
          const newTarget = idMap.get(edge.target) || edge.target;
          
          return {
            ...edge,
            id: newEdgeId,
            source: newSource,
            target: newTarget
          };
        }) : [];
        
        return {
          nodes: newNodes,
          edges: newEdges,
          position: subFlow.position || [0, 0],
          zoom: subFlow.zoom || 1
        };
      };

      // Обновляем ноду: убираем родителя и копируем его схему
      onElementSettingsChange?.(selectedElement.id, {
        parent: null,
        subFlow: deepCopySubFlow(parentNode.data.subFlow)
      });
    }
  }, [selectedElement, onElementSettingsChange]);

  // Обработчик для перехода к родительской ноде
  const handleGoToParent = useCallback(() => {
    if (!selectedElement || !selectedElement.data?.parent) return;
    
    const parentId = selectedElement.data.parent;
    
    // Выделяем родительскую ноду
    if (window.reactFlowInstance) {
      const allNodes = window.reactFlowInstance.getNodes();
      const parentNode = allNodes.find(node => node.id === parentId);
      
      if (parentNode) {
        // Выделяем родительскую ноду
        window.reactFlowInstance.setNodes(nodes => 
          nodes.map(node => ({
            ...node,
            selected: node.id === parentId
          }))
        );
        
        // Центрируем канвас на родительской ноде
        const parentPosition = parentNode.position;
        const viewport = window.reactFlowInstance.getViewport();
        const centerX = parentPosition.x;
        const centerY = parentPosition.y;
        
        window.reactFlowInstance.setViewport({
          x: -centerX + window.innerWidth / 2,
          y: -centerY + window.innerHeight / 2,
          zoom: viewport.zoom
        });
      }
    }
  }, [selectedElement]);

  return (
    <>
      {/* Button for collapsing/expanding */}
      {isVisible && (
        <button className="settings-toggle-button" onClick={handleToggleCollapse}>
          {isPanelCollapsed ? '▲' : '▼'}
        </button>
      )}

      {/* Main settings panel */}
      {isVisible && (
        <div className={`settings-panel-wrapper ${isPanelCollapsed ? 'collapsed' : ''}`} style={{ width: isPanelCollapsed ? '0px' : panelWidth + 'px' }}>
          <div className="settings-panel-container" style={{ pointerEvents: isVisible && !isPanelCollapsed ? 'auto' : 'none' }} ref={panelRef}>
            <div className="settings-panel">
              <h2>Settings {elementTypeDisplay}</h2>
              {!selectedElement ? (
                <div className="global-params-content">
                  <h3 style={{ margin: '10px 0', fontSize: '1em', color: '#FFFFFF' }}>Global Parameters</h3>
                  
                  {/* Список существующих параметров */}
                  {globalParams.map((param) => (
                    <div key={param.id} className="global-param-item" style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ 
                          color: '#888', 
                          fontSize: '0.8em', 
                          padding: '2px 6px', 
                          backgroundColor: '#333', 
                          borderRadius: '4px',
                          minWidth: '45px',
                          textAlign: 'center'
                        }}>
                          {param.type}
                        </span>
                        <input
                          type="text"
                          value={param.name}
                          disabled
                          className="settings-panel-input"
                          style={{ flex: 1 }}
                        />
                        <div style={{ width: '120px', display: 'flex' }}>
                          {param.type === 'bool' ? (
                            <div className="checkbox-container" style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              width: 'auto'
                            }}>
                              <input
                                type="checkbox"
                                checked={param.value === true}
                                onChange={(e) => handleGlobalParamChange(param.id, e.target.checked)}
                                className="settings-panel-input"
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  minWidth: '16px',
                                  margin: '0',
                                  padding: '0',
                                  appearance: 'none',
                                  WebkitAppearance: 'none',
                                  MozAppearance: 'none',
                                  backgroundColor: param.value ? '#29CCB1' : 'transparent',
                                  border: '1px solid #666',
                                  borderRadius: '3px',
                                  cursor: 'pointer',
                                  position: 'relative',
                                  boxSizing: 'border-box',
                                  flexShrink: 0
                                }}
                              />
                              <span style={{ 
                                color: '#888',
                                fontSize: '0.9em',
                                userSelect: 'none'
                              }}>
                                {param.value === true ? 'true' : 'false'}
                              </span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={param.value}
                              onChange={(e) => handleGlobalParamChange(param.id, e.target.value)}
                              className="settings-panel-input"
                              style={{ width: '100%' }}
                            />
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveGlobalParam(param.id)}
                          className="delete-button"
                          style={{
                            padding: '0',
                            backgroundColor: 'transparent',
                            color: '#ff4444',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            transition: 'background-color 0.2s',
                            lineHeight: '1'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 68, 68, 0.1)'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Форма добавления нового параметра */}
                  {showAddParamMenu ? (
                    <div className="add-param-form" style={{ marginTop: '10px', padding: '10px', border: '1px solid #444', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                        <select
                          value={newParamType}
                          onChange={(e) => handleParamTypeChange(e.target.value)}
                          className="settings-panel-input"
                          style={{ width: '100px' }}
                        >
                          <option value="float">float</option>
                          <option value="int">int</option>
                          <option value="bool">bool</option>
                        </select>
                        <input
                          type="text"
                          value={newParamName}
                          onChange={(e) => setNewParamName(e.target.value)}
                          placeholder="Parameter name"
                          className="settings-panel-input"
                          style={{ flex: 1 }}
                        />
                        <div style={{ width: '120px', display: 'flex' }}>
                          {newParamType === 'bool' ? (
                            <div className="checkbox-container" style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              width: 'auto'
                            }}>
                              <input
                                type="checkbox"
                                checked={newParamValue === true}
                                onChange={(e) => handleNewParamValueChange(e.target.checked)}
                                className="settings-panel-input"
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  minWidth: '16px',
                                  margin: '0',
                                  padding: '0',
                                  appearance: 'none',
                                  WebkitAppearance: 'none',
                                  MozAppearance: 'none',
                                  backgroundColor: newParamValue ? '#29CCB1' : 'transparent',
                                  border: '1px solid #666',
                                  borderRadius: '3px',
                                  cursor: 'pointer',
                                  position: 'relative',
                                  boxSizing: 'border-box',
                                  flexShrink: 0
                                }}
                              />
                              <span style={{ 
                                color: '#888',
                                fontSize: '0.9em',
                                userSelect: 'none'
                              }}>
                                {newParamValue === true ? 'true' : 'false'}
                              </span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={newParamValue}
                              onChange={(e) => handleNewParamValueChange(e.target.value)}
                              placeholder={newParamType === 'float' ? '0.0' : '0'}
                              className="settings-panel-input"
                              style={{ width: '100%' }}
                            />
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => {
                            setShowAddParamMenu(false);
                            setNewParamName('');
                            setNewParamValue('');
                          }}
                          className="settings-panel-button"
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#666',
                            color: 'white',
                            border: '1px solid #666',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddGlobalParam}
                          className="settings-panel-button"
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#4a4a4a',
                            color: 'white',
                            border: '1px solid #666',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                      <button
                        onClick={handleShowAddParamMenu}
                        className="settings-panel-button"
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#4a4a4a',
                          color: 'white',
                          border: '1px solid #666',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9em'
                        }}
                      >
                        Add parameter
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="element-settings">
                  <div style={{ color: '#888', fontSize: '0.8em', height: '30px' }}>
                    <span className="setting-label">ID: {selectedElement.id}</span>
                  </div>

                  {selectedElement.type && <div className="settings-section-separator"></div>}

                  {selectedElement.type === 'population' && (
                    <div className="population-settings-content">
                      <div className="setting-item">
                        <span className="setting-label">Name:</span>
                        <input
                          type="text"
                          value={populationLabel}
                          onChange={(e) => handlePopulationLabelChange(e.target.value)}
                          placeholder="Enter population name (no spaces allowed)"
                          className="settings-panel-input"
                        />
                      </div>
                      <div className="setting-item">
                        <span className="setting-label">Color:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                          <input
                            type="color"
                            value={populationColor}
                            onChange={(e) => handlePopulationColorChange(e.target.value)}
                            className="settings-panel-color-input"
                          />
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '4px' }}>(</span>
                            {presetColors.map((color) => (
                              <div
                                key={color}
                                onClick={() => handlePopulationColorChange(color)}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  backgroundColor: color,
                                  border: '1px solid #ccc',
                                  cursor: 'pointer',
                                  margin: '0 2px',
                                }}
                                title={color}
                              />
                            ))}
                            <span style={{ marginLeft: '4px' }}>)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="settings-section-separator"></div>
                      <h3 style={{ margin: '10px 0', fontSize: '1em', color: '#FFFFFF' }}>Neuron</h3>
                      <div className="setting-item">
                        <span className="setting-label">Neuron type:</span>
                        <select
                          value={neuronType}
                          onChange={(e) => handleNeuronTypeChange(e.target.value)}
                          className="settings-panel-input"
                        >
                          <option value="BLIFATNeuron">BLIFATNeuron</option>
                          <option value="SynapticResourceSTDPNeuron">SynapticResourceSTDPNeuron</option>
                          <option value="AltAILIF">AltAILIF</option>
                        </select>
                      </div>
                      <div className="setting-item">
                        <span className="setting-label">Neuron pcs:</span>
                        <input
                          type="text"
                          value={neuronCount}
                          onChange={(e) => handleNeuronCountChange(e.target.value)}
                          className="settings-panel-input"
                          placeholder="Enter number of neurons"
                        />
                      </div>
                      <div className="settings-section-separator"></div>
                      <NeuronParamsPanel
                        neuronType={neuronType}
                        params={neuronParams}
                        onChange={handleNeuronParamChange}
                        isCollapsed={isNeuronParamsCollapsed}
                        onCollapseChange={handleNeuronParamsCollapseChange}
                      />
                      
                      {(populationEdgePanels.length > 0 || true) && (
                        <div className="settings-section-separator"></div>
                      )}
                      
                      {populationEdgePanels.map((panel, index) => (
                        <div key={panel.id}>
                          <div className="edge-panel-header" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            margin: '10px 0'
                          }}>
                            <h3 style={{ 
                              margin: '0', 
                              fontSize: '1em', 
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '16px'
                            }}>
                              Reverse projection #{index + 1}
                            </h3>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '16px' 
                            }}>
                              {populationEdgePanels.length > 0 && (
                                <button
                                  onClick={() => handleRemovePopulationEdgePanel(panel.id)}
                                  className="delete-button"
                                  style={{
                                    padding: '0',
                                    backgroundColor: 'transparent',
                                    color: '#ff4444',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '4px',
                                    transition: 'background-color 0.2s',
                                    lineHeight: '1'
                                  }}
                                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 68, 68, 0.1)'}
                                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  
                                </button>
                              )}
                              <button
                                onClick={() => handlePopulationEdgePanelChange(panel.id, { isCollapsed: !panel.isCollapsed })}
                                className="collapse-button"
                                style={{
                                  padding: '0',
                                  backgroundColor: 'transparent',
                                  color: '#888',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '4px',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(136, 136, 136, 0.1)'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                {panel.isCollapsed ? '▲' : '▼'}
                              </button>
                            </div>
                          </div>
                          <EdgeParamsPanel
                            edgeType={panel.edgeType}
                            params={panel.edgeParams}
                            onChange={(paramName, value) => {
                              const newParams = { ...panel.edgeParams, [paramName]: value };
                              handlePopulationEdgePanelChange(panel.id, { edgeParams: newParams });
                            }}
                            isCollapsed={panel.isCollapsed}
                            onCollapseChange={(newCollapsed) => {
                              handlePopulationEdgePanelChange(panel.id, { isCollapsed: newCollapsed });
                            }}
                            onEdgeTypeChange={(newType) => {
                              handlePopulationEdgePanelChange(panel.id, { edgeType: newType });
                            }}
                          />
                          {index < populationEdgePanels.length - 1 && <div className="settings-section-separator"></div>}
                        </div>
                      ))}
                      
                      {populationEdgePanels.length > 0 && (
                        <div className="settings-section-separator"></div>
                      )}
                      
                      <div className="setting-item" style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                        <button 
                          onClick={handleAddPopulationEdgePanel}
                          className="settings-panel-button"
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#4a4a4a',
                            color: 'white',
                            border: '1px solid #666',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9em'
                          }}
                        >
                          Add reverse projection
                        </button>
                      </div>
                    </div>
                  )}

                  {(selectedElement.type === 'input' || selectedElement.type === 'output') && (
                    <div className="input-output-settings-content">
                      <div className="setting-item">
                        <span className="setting-label">Name:</span>
                        <input
                          type="text"
                          value={inputOutputLabel}
                          onChange={(e) => handleInputOutputLabelChange(e.target.value)}
                          placeholder="Enter name (no spaces allowed)"
                          className="settings-panel-input"
                        />
                      </div>
                    </div>
                  )}

                  {selectedElement.type === 'group' && (
                    <div className="group-settings-content">
                      <div className="setting-item">
                        <span className="setting-label">Name:</span>
                        <input
                          type="text"
                          value={groupLabel}
                          onChange={(e) => handleGroupLabelChange(e.target.value)}
                          placeholder="Enter group name (no spaces allowed)"
                          className="settings-panel-input"
                        />
                      </div>
                      
                      {/* Информация о родительской ноде */}
                      {selectedElement.data?.parent && (
                        <>
                          <div className="settings-section-separator"></div>
                          <div className="setting-item">
                            <span className="setting-label">Parent:</span>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '10px',
                              color: '#888',
                              fontSize: '0.9em'
                            }}>
                              <span>{selectedElement.data.parent}</span>
                              <button
                                onClick={handleGoToParent}
                                className="settings-panel-button"
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#4a4a4a',
                                  color: 'white',
                                  border: '1px solid #666',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.8em'
                                }}
                              >
                                Go to parent
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {/* Кнопки управления родительством */}
                      <div className="settings-section-separator"></div>
                      <div className="setting-item" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        {selectedElement.data?.parent ? (
                          <button
                            onClick={handleLeaveParent}
                            className="settings-panel-button"
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#ff9800',
                              color: 'white',
                              border: '1px solid #ff9800',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.9em'
                            }}
                          >
                            Leave parent
                          </button>
                        ) : (
                          <div style={{ 
                            color: '#888', 
                            fontSize: '0.9em', 
                            fontStyle: 'italic',
                            textAlign: 'center'
                          }}>
                            This group has no parent
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedElement.type === 'edge' && (
                    <div className="edge-settings-content">
                      <div className="setting-item">
                        <span className="setting-label">Color:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                          <input
                            type="color"
                            value={edgeColor}
                            onChange={(e) => handleEdgeColorChange(e.target.value)}
                            className="settings-panel-color-input"
                          />
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '4px' }}>(</span>
                            {presetColors.map((color) => (
                              <div
                                key={color}
                                onClick={() => handleEdgeColorChange(color)}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  backgroundColor: color,
                                  border: '1px solid #ccc',
                                  cursor: 'pointer',
                                  margin: '0 2px',
                                }}
                                title={color}
                              />
                            ))}
                            <span style={{ marginLeft: '4px' }}>)</span>
                          </div>
                        </div>
                      </div>
                      <div className="settings-section-separator"></div>
                      
                      {edgePanels.map((panel, index) => (
                        <div key={panel.id}>
                          <div className="edge-panel-header" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            margin: '10px 0'
                          }}>
                            <h3 style={{ 
                              margin: '0', 
                              fontSize: '1em', 
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '16px'
                            }}>
                              Projection parameters #{index + 1}
                            </h3>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '16px' 
                            }}>
                              {edgePanels.length > 1 && (
                                <button
                                  onClick={() => handleRemovePanel(panel.id)}
                                  className="delete-button"
                                  style={{
                                    padding: '0',
                                    backgroundColor: 'transparent',
                                    color: '#ff4444',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '4px',
                                    transition: 'background-color 0.2s',
                                    lineHeight: '1'
                                  }}
                                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 68, 68, 0.1)'}
                                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  
                                </button>
                              )}
                              <button
                                onClick={() => handlePanelChange(panel.id, { isCollapsed: !panel.isCollapsed })}
                                className="collapse-button"
                                style={{
                                  padding: '0',
                                  backgroundColor: 'transparent',
                                  color: '#888',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '4px',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(136, 136, 136, 0.1)'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                {panel.isCollapsed ? '▲' : '▼'}
                              </button>
                            </div>
                          </div>
                          <EdgeParamsPanel
                            edgeType={panel.edgeType}
                            params={panel.edgeParams}
                            onChange={(paramName, value) => {
                              const newParams = { ...panel.edgeParams, [paramName]: value };
                              handlePanelChange(panel.id, { edgeParams: newParams });
                            }}
                            isCollapsed={panel.isCollapsed}
                            onCollapseChange={(newCollapsed) => {
                              handlePanelChange(panel.id, { isCollapsed: newCollapsed });
                            }}
                            onEdgeTypeChange={(newType) => {
                              handlePanelChange(panel.id, { edgeType: newType });
                            }}
                          />
                          {index < edgePanels.length - 1 && <div className="settings-section-separator"></div>}
                        </div>
                      ))}
                      
                      <div className="settings-section-separator"></div>
                      <div className="setting-item" style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                        <button 
                          onClick={handleAddGenerator}
                          className="settings-panel-button"
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#4a4a4a',
                            color: 'white',
                            border: '1px solid #666',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9em'
                          }}
                        >
                          Add projection generator
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Resize handle visible only when panel is expanded */}
            {!isPanelCollapsed && (
              <div
                className="resize-handle"
                onMouseDown={handleMouseDown}
              ></div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(SettingsPanel); // Memoize the entire component 