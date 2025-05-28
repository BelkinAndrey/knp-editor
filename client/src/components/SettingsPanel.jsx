import React, { useState, useEffect, useRef, useMemo } from 'react';
import './SettingsPanel.css'; // Import styles for the settings panel and button

const SettingsPanel = ({ selectedElement, isVisible, onToggleVisibility, initialPanelCollapsed = false, initialPanelWidth = 300, onSaveSettings, onElementSettingsChange }) => {
  const [panelWidth, setPanelWidth] = useState(initialPanelWidth); // Initial panel width from props
  const [isResizing, setIsResizing] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(initialPanelCollapsed); // Collapsed/expanded state
  const panelRef = useRef(null);
  const [populationLabel, setPopulationLabel] = useState(''); // State for population label input
  const [populationColor, setPopulationColor] = useState('#000000'); // Добавляем состояние для цвета
  
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

  // Memoize panel content
  const panelContent = useMemo(() => {
    if (!selectedElement) {
      return <p>Select an element to view settings</p>;
    }

    return (
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
                onChange={(e) => {
                  const newValue = e.target.value.replace(/\s+/g, ''); // Удаляем все пробелы
                  setPopulationLabel(newValue);
                  // Вызываем функцию для сохранения изменения в схеме
                  if (onElementSettingsChange && selectedElement) {
                    onElementSettingsChange(selectedElement.id, { label: newValue });
                  }
                }}
                placeholder="Enter population name (no spaces allowed)"
                className="settings-panel-input"
              />
            </div>
            <div className="setting-item">
              <span className="setting-label">Color:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="color"
                  value={populationColor}
                  onChange={(e) => {
                    const newColor = e.target.value;
                    setPopulationColor(newColor);
                    if (onElementSettingsChange && selectedElement) {
                      onElementSettingsChange(selectedElement.id, { color: newColor });
                    }
                  }}
                  className="settings-panel-color-input"
                />
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '4px' }}>(</span>
                  {presetColors.map((color, index) => (
                    <div
                      key={color}
                      onClick={() => handlePresetColorClick(color)}
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
          </div>
        )}
      </div>
    );
  }, [selectedElement, populationLabel, populationColor]);

  // Effect to set initial populationLabel and color state when selectedElement changes
  useEffect(() => {
    if (selectedElement && selectedElement.type === 'population') {
      setPopulationLabel(selectedElement.data?.label || '');
      setPopulationColor(selectedElement.data?.color || '#000000'); // Устанавливаем начальный цвет
    } else {
      setPopulationLabel('');
      setPopulationColor('#000000');
    }
  }, [selectedElement]);

  // Add effect to track prop changes
  useEffect(() => {
  }, [selectedElement, isVisible, initialPanelCollapsed, initialPanelWidth]);

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
              {panelContent}
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