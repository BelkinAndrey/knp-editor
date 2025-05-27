import React from 'react';
import './SettingsPanel.css'; // Импорт стилей для панели настроек и кнопки

const SettingsPanel = ({ selectedElement, isVisible, onToggleVisibility }) => {
  
  return (
    <div className="settings-panel-container">
      <button className="settings-toggle-button" onClick={onToggleVisibility}>
        {isVisible ? '▼' : '▲'}
      </button>
      {isVisible && (
        <div className="settings-panel">
          <h2>Настройки</h2>
          {selectedElement ? (
            // Если элемент выбран, отображаем его настройки
            <>
              <p>Выбран элемент типа: {selectedElement.type}</p>
              {selectedElement.type === 'node' && (
                <div>
                  <p>ID ноды: {selectedElement.id}</p>
                  {/* Добавьте поля для редактирования настроек ноды */}
                </div>
              )}
              {selectedElement.type === 'edge' && (
                <div>
                  <p>ID связи: {selectedElement.id}</p>
                  {/* Добавьте поля для редактирования настроек связи */}
                </div>
              )}
            </>
          ) : (
            // Если элемент не выбран, отображаем сообщение
            <p>Выберите ноду или связь для просмотра настроек.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingsPanel; 