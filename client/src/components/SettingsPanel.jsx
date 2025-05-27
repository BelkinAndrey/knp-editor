import React, { useState, useEffect, useRef, useMemo } from 'react';
import './SettingsPanel.css'; // Импорт стилей для панели настроек и кнопки

const SettingsPanel = ({ selectedElement, isVisible, onToggleVisibility, initialPanelCollapsed = false, initialPanelWidth = 300, onSaveSettings }) => {
  const [panelWidth, setPanelWidth] = useState(initialPanelWidth); // Начальная ширина панели из пропсов
  const [isResizing, setIsResizing] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(initialPanelCollapsed); // Состояние свернуто/развернуто
  const panelRef = useRef(null);

  // Мемоизируем отображение типа элемента
  const elementTypeDisplay = useMemo(() => {
    if (!selectedElement) {
      return '';
    }
    
    const typeMap = {
      'edge': 'Edge',
      'population': 'Population',
      'input': 'Input',
      'output': 'Output'
    };
    
    return typeMap[selectedElement.type] || selectedElement.type;
  }, [selectedElement]);

  // Мемоизируем содержимое панели
  const panelContent = useMemo(() => {
    if (!selectedElement) {
      return <p>Выберите элемент для просмотра настроек</p>;
    }

    return (
      <div className="element-settings">
        <div className="setting-item">
          <span className="setting-label">Тип элемента:</span>
          <span className="setting-value">{elementTypeDisplay}</span>
        </div>
        <div className="setting-item">
          <span className="setting-label">ID:</span>
          <span className="setting-value">{selectedElement.id}</span>
        </div>
        {selectedElement.type === 'edge' && (
          <div className="edge-settings">
            <div className="setting-item">
              <span className="setting-label">Источник:</span>
              <span className="setting-value">{selectedElement.source}</span>
            </div>
            <div className="setting-item">
              <span className="setting-label">Цель:</span>
              <span className="setting-value">{selectedElement.target}</span>
            </div>
          </div>
        )}
        {selectedElement.type === 'population' && (
          <div className="population-settings">
            <div className="setting-item">
              <span className="setting-label">Метка:</span>
              <span className="setting-value">{selectedElement.data?.label || 'Популяция'}</span>
            </div>
          </div>
        )}
        {selectedElement.type === 'input' && (
          <div className="input-settings">
            <div className="setting-item">
              <span className="setting-label">Метка:</span>
              <span className="setting-value">{selectedElement.data?.label || 'Вход'}</span>
            </div>
          </div>
        )}
        {selectedElement.type === 'output' && (
          <div className="output-settings">
            <div className="setting-item">
              <span className="setting-label">Метка:</span>
              <span className="setting-value">{selectedElement.data?.label || 'Выход'}</span>
            </div>
          </div>
        )}
      </div>
    );
  }, [selectedElement, elementTypeDisplay]);

  // Добавим эффект для отслеживания изменений пропсов
  useEffect(() => {
  }, [selectedElement, isVisible, initialPanelCollapsed, initialPanelWidth]);

  const handleMouseDown = (e) => {
    setIsResizing(true);
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    const newWidth = document.body.clientWidth - e.clientX;
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
              <h2>Настройки</h2>
              {panelContent}
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

export default React.memo(SettingsPanel); // Мемоизируем весь компонент 