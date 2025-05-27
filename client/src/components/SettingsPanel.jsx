import React, { useState, useEffect, useRef } from 'react';
import './SettingsPanel.css'; // Импорт стилей для панели настроек и кнопки

const SettingsPanel = ({ selectedElement, isVisible, onToggleVisibility, initialPanelCollapsed = false, initialPanelWidth = 300, onSaveSettings }) => {
  const [panelWidth, setPanelWidth] = useState(initialPanelWidth); // Начальная ширина панели из пропсов
  const [isResizing, setIsResizing] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(initialPanelCollapsed); // Состояние свернуто/развернуто
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
    // Сохраняем ширину панели после изменения размера
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

  // Эффект для установки начальной ширины и состояния при загрузке
  useEffect(() => {
    setPanelWidth(initialPanelWidth);
    setIsPanelCollapsed(initialPanelCollapsed);
  }, [initialPanelWidth, initialPanelCollapsed]);

  const handleToggleCollapse = () => {
    const newCollapsedState = !isPanelCollapsed;
    setIsPanelCollapsed(newCollapsedState);
    // Сохраняем состояние свернуто/развернуто
    if (onSaveSettings) {
      onSaveSettings({ isPanelCollapsed: newCollapsedState, panelWidth });
    }
  };

  return (
    <>
      {/* Кнопка для сворачивания/разворачивания */}
      {isVisible && (
        <button className="settings-toggle-button" onClick={handleToggleCollapse}>
          {isPanelCollapsed ? '▲' : '▼'}
        </button>
      )}

      {/* Основная панель настроек */}
      {isVisible && (
        <div className={`settings-panel-wrapper ${isPanelCollapsed ? 'collapsed' : ''}`} style={{ width: isPanelCollapsed ? '0px' : panelWidth + 'px' }}>
          <div className="settings-panel-container" style={{ pointerEvents: isVisible && !isPanelCollapsed ? 'auto' : 'none' }} ref={panelRef}>
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
            {/* Ручка изменения размера видна только когда панель развернута */}
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

export default SettingsPanel; 