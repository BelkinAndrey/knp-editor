import React, { useState, useEffect, useRef } from 'react';
import './SettingsPanel.css'; // Импорт стилей для панели настроек и кнопки

const SettingsPanel = ({ selectedElement, isVisible, onToggleVisibility }) => {
  const [panelWidth, setPanelWidth] = useState(300); // Начальная ширина панели
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsResizing(true);
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    const newWidth = document.body.clientWidth - e.clientX;
    // Ограничьте ширину, если это необходимо (например, мин/макс ширина)
    const minWidth = 300; // Минимальная ширина панели
    setPanelWidth(Math.max(minWidth, newWidth));
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]); // Переподключайте эффекты только при изменении состояния isResizing

  return (
    <div className="settings-panel-container" style={{ width: panelWidth + 'px' }} ref={panelRef}>
      <button className="settings-toggle-button" onClick={onToggleVisibility}>
        {isVisible ? '▼' : '▲'}
      </button>
      {isVisible && (
        <div className="settings-panel">
          <h2>Settings</h2>
          {selectedElement ? (
            // If element is selected, display its settings
            <>
              <p>Selected element type: {selectedElement.type}</p>
              {selectedElement.type === 'node' && (
                <div>
                  <p>Node ID: {selectedElement.id}</p>
                  {/* Add fields for editing node settings */}
                </div>
              )}
              {selectedElement.type === 'edge' && (
                <div>
                  <p>Edge ID: {selectedElement.id}</p>
                  {/* Add fields for editing edge settings */}
                </div>
              )}
            </>
          ) : (
            // If no element is selected, display message
            <p>Select a node or edge to view settings.</p>
          )}
        </div>
      )}
      {/* Ручка изменения размера */}
      <div
        className="resize-handle"
        onMouseDown={handleMouseDown}
      ></div>
    </div>
  );
};

export default SettingsPanel; 