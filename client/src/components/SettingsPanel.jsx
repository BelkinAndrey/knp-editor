import React, { useState, useEffect, useRef, useMemo } from 'react';
import './SettingsPanel.css'; // Import styles for the settings panel and button

const SettingsPanel = ({ selectedElement, isVisible, onToggleVisibility, initialPanelCollapsed = false, initialPanelWidth = 300, onSaveSettings }) => {
  const [panelWidth, setPanelWidth] = useState(initialPanelWidth); // Initial panel width from props
  const [isResizing, setIsResizing] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(initialPanelCollapsed); // Collapsed/expanded state
  const panelRef = useRef(null);

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
        <div className="setting-item" style={{ color: '#888', fontSize: '0.8em', height: '25px' }}>
          <span className="setting-label">ID: </span>
          <span className="setting-label">{selectedElement.id}</span>
        </div>
        {selectedElement.type === 'edge' && (
          <div className="edge-settings">
            <div className="setting-item">
              <span className="setting-label">Source:</span>
              <span className="setting-value">{selectedElement.source}</span>
            </div>
            <div className="setting-item">
              <span className="setting-label">Target:</span>
              <span className="setting-value">{selectedElement.target}</span>
            </div>
          </div>
        )}
        {selectedElement.type === 'population' && (
          <div className="population-settings">
            <div className="setting-item">
              <span className="setting-label">Label:</span>
              <span className="setting-value">{selectedElement.data?.label || 'Population'}</span>
            </div>
          </div>
        )}
        {selectedElement.type === 'input' && (
          <div className="input-settings">
            <div className="setting-item">
              <span className="setting-label">Label:</span>
              <span className="setting-value">{selectedElement.data?.label || 'Input'}</span>
            </div>
          </div>
        )}
        {selectedElement.type === 'output' && (
          <div className="output-settings">
            <div className="setting-item">
              <span className="setting-label">Label:</span>
              <span className="setting-value">{selectedElement.data?.label || 'Output'}</span>
            </div>
          </div>
        )}
      </div>
    );
  }, [selectedElement, elementTypeDisplay]);

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