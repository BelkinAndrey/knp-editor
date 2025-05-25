import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MongoDBModal.css';

const API_URL = 'http://localhost:3000/api/schemes';

const MongoDBModal = ({ isOpen, onClose, onLoadSchema, currentSchema }) => {
  const [schemas, setSchemas] = useState([]);
  const [newFileName, setNewFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSchemas();
    }
  }, [isOpen]);

  const fetchSchemas = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_URL);
      setSchemas(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке схем:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newFileName.trim()) {
      alert('Пожалуйста, введите название файла');
      return;
    }

    try {
      const response = await axios.post(API_URL, {
        name: newFileName,
        nodes: currentSchema.nodes,
        edges: currentSchema.edges
      });

      if (response.status === 200) {
        setNewFileName('');
        fetchSchemas();
      }
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      alert('Не удалось сохранить схему');
    }
  };

  const handleDelete = async (schemaId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту схему?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_URL}/${schemaId}`);
      if (response.status === 200) {
        fetchSchemas();
      }
    } catch (error) {
      console.error('Ошибка при удалении:', error);
      alert('Не удалось удалить схему');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Управление файлами</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="schemas-list">
            {isLoading ? (
              <p>Загрузка...</p>
            ) : schemas.length === 0 ? (
              <p>Нет сохраненных схем</p>
            ) : (
              schemas.map(schema => (
                <div key={schema._id} className="schema-item">
                  <div 
                    className="schema-info"
                    onClick={() => onLoadSchema({ nodes: schema.nodes, edges: schema.edges })}
                  >
                    <span className="schema-name">{schema.name}</span>
                    <span className="schema-date">
                      {new Date(schema.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(schema._id)}
                    aria-label="Удалить схему"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="save-section">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Введите название файла"
              className="filename-input"
            />
            <button 
              className="save-button"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MongoDBModal; 