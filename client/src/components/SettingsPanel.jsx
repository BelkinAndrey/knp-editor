import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './SettingsPanel.css'; // Import styles for the settings panel and button
import NeuronParamsPanel from './NeuronParamsPanel';
import EdgeParamsPanel from './EdgeParamsPanel';

const SettingsPanel = ({ selectedElement, isVisible, onToggleVisibility, initialPanelCollapsed = false, initialPanelWidth = 300, onSaveSettings, onElementSettingsChange }) => {
  const [panelWidth, setPanelWidth] = useState(initialPanelWidth); // Initial panel width from props
  const [isResizing, setIsResizing] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(initialPanelCollapsed); // Collapsed/expanded state
  const [isNeuronParamsCollapsed, setIsNeuronParamsCollapsed] = useState(false);
  const panelRef = useRef(null);
  const [populationLabel, setPopulationLabel] = useState(''); // State for population label input
  const [populationColor, setPopulationColor] = useState('#000000'); // Добавляем состояние для цвета
  const [edgeColor, setEdgeColor] = useState('#000000'); // Добавляем состояние для цвета проекции
  const [neuronType, setNeuronType] = useState('BLIFATNeuron'); // Новое состояние для типа нейрона
  const [neuronCount, setNeuronCount] = useState('1'); // Новое состояние для количества нейронов
  const [neuronParams, setNeuronParams] = useState({}); // Новое состояние для параметров нейрона
  const [edgeType, setEdgeType] = useState('BasicSynapse'); // Новое состояние для типа синапса
  const [edgeParams, setEdgeParams] = useState({}); // Новое состояние для параметров синапса
  const [isEdgeParamsCollapsed, setIsEdgeParamsCollapsed] = useState(false); // Состояние для сворачивания панели параметров синапса
  
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
      setPopulationColor('#000000');
      setEdgeColor('#000000');
      setNeuronType('BLIFATNeuron');
      setNeuronCount('1');
      setNeuronParams({});
      setIsNeuronParamsCollapsed(false);
      setEdgeType('BasicSynapse');
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
    } else if (selectedElement.type === 'edge') {
      const elementData = selectedElement.data || {};
      const newColor = elementData.color || '#000000';
      const newEdgeType = elementData.edgeType || 'BasicSynapse';
      setIsEdgeParamsCollapsed(elementData.isEdgeParamsCollapsed || false);
      
      // Получаем параметры синапса для текущего типа
      let edgeTypeParams = {};
      
      if (elementData.edgeParams) {
        if (elementData.edgeParams[newEdgeType]) {
          edgeTypeParams = { ...elementData.edgeParams[newEdgeType] };
        } else {
          // Инициализируем значения по умолчанию в зависимости от типа
          switch (newEdgeType) {
            case 'DeltaSynapse':
              edgeTypeParams = {
                weight_: 1.0,
                delay_: 0
              };
              break;
            case 'AdditiveSTDPDeltaSynapse':
              edgeTypeParams = {
                weight_: 1.0,
                delay_: 0
              };
              break;
            case 'SynapticResourceSTDPDeltaSynapse':
              edgeTypeParams = {
                weight_: 1.0,
                delay_: 0
              };
              break;
            default:
              edgeTypeParams = {};
          }
        }
      }
      
      setEdgeColor(newColor);
      setEdgeType(newEdgeType);
      setEdgeParams(edgeTypeParams);

      // Если параметры были инициализированы значениями по умолчанию, обновляем их
      if (!elementData.edgeParams?.[newEdgeType]) {
        onElementSettingsChange?.(selectedElement.id, {
          edgeParams: {
            [newEdgeType]: edgeTypeParams
          }
        });
      }
    }
  }, [selectedElement?.id, onElementSettingsChange]);

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
    
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = parseInt(value) || 0;
      if (numValue > 0 || value === '') {
        setNeuronCount(value);
        
        onElementSettingsChange?.(selectedElement.id, {
          neuronCount: numValue || 1
        });
      }
    }
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
    
    onElementSettingsChange?.(selectedElement.id, {
      addGenerator: true
    });
  }, [selectedElement, onElementSettingsChange]);

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
      'output': 'Output'
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
              {selectedElement && (
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
                          onBlur={(e) => {
                            if (!e.target.value || parseInt(e.target.value) === 0) {
                              setNeuronCount('1');
                              if (selectedElement) {
                                onElementSettingsChange?.(selectedElement.id, { neuronCount: 1 });
                              }
                            }
                          }}
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
                      <div className="settings-section-separator"></div>
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
                      <div className="setting-item">
                        <span className="setting-label">Synapse type:</span>
                        <select
                          value={edgeType}
                          onChange={(e) => handleEdgeTypeChange(e.target.value)}
                          className="settings-panel-input"
                        >
                          <option value="DeltaSynapse">DeltaSynapse</option>
                          <option value="AdditiveSTDPDeltaSynapse">AdditiveSTDPDeltaSynapse</option>
                          <option value="SynapticResourceSTDPDeltaSynapse">SynapticResourceSTDPDeltaSynapse</option>
                        </select>
                      </div>
                      <div className="settings-section-separator"></div>
                      <EdgeParamsPanel
                        edgeType={edgeType}
                        params={edgeParams}
                        onChange={handleEdgeParamChange}
                        isCollapsed={isEdgeParamsCollapsed}
                        onCollapseChange={handleEdgeParamsCollapseChange}
                      />
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
                          Add generator
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