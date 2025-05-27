import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MongoDBModal.css';

const API_URL = 'http://localhost:3000/api/schemes';

const MongoDBModal = ({ isOpen, onClose, onLoadSchema, currentSchema }) => {
  const [schemas, setSchemas] = useState([]);
  const [newFileName, setNewFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date not specified';
      }
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${hours}:${minutes}:${seconds} -- ${day}.${month}.${year}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date not specified';
    }
  };

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
      console.error('Error loading schemas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newFileName.trim()) {
      alert('Please enter a file name');
      return;
    }

    try {
      const response = await axios.post(API_URL, {
        name: newFileName,
        nodes: currentSchema.nodes,
        edges: currentSchema.edges,
        zoom: currentSchema.zoom,
        position: currentSchema.position,
        isPanelCollapsed: currentSchema.isPanelCollapsed,
        panelWidth: currentSchema.panelWidth
      });

      setNewFileName('');
      fetchSchemas();
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
      alert(`Failed to save schema: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (schemaId) => {
    try {
      console.log('Deleting schema with ID:', schemaId);
      const response = await axios.delete(`${API_URL}/${schemaId}`);
      if (response.status === 200) {
        console.log('Schema successfully deleted');
        fetchSchemas();
      }
    } catch (error) {
      console.error('Error deleting:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        url: `${API_URL}/${schemaId}`
      });
      alert('Failed to delete schema');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>File Management</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="schemas-list">
            {isLoading ? (
              <p>Loading...</p>
            ) : schemas.length === 0 ? (
              <p>No saved schemas</p>
            ) : (
              schemas.map(schema => (
                <div key={schema._id} className="schema-item">
                  <div 
                    className="schema-info"
                    onClick={() => {
                      try {
                        const schemaData = {
                          nodes: Array.isArray(schema.nodes) ? schema.nodes.map(node => {
                            let label = node.data?.label;
                            if (label && typeof label === 'object' && 'props' in label) {
                              label = label.props?.children || 'Default Node';
                            }
                            
                            return {
                              ...node,
                              id: String(node.id),
                              type: String(node.type || 'default'),
                              data: {
                                ...node.data,
                                label: label
                              }
                            };
                          }) : [],
                          edges: Array.isArray(schema.edges) ? schema.edges.map(edge => ({
                            ...edge,
                            id: String(edge.id),
                            source: String(edge.source),
                            target: String(edge.target)
                          })) : []
                        };
                        
                        // Include zoom and position if they exist in the fetched schema
                        if (schema.zoom !== undefined) {
                          schemaData.zoom = schema.zoom;
                        }
                        if (schema.position !== undefined) {
                          schemaData.position = schema.position;
                        }

                        // Include panel settings if they exist in the fetched schema
                        if (schema.isPanelCollapsed !== undefined) {
                          schemaData.isPanelCollapsed = schema.isPanelCollapsed;
                        }
                        if (schema.panelWidth !== undefined) {
                          schemaData.panelWidth = schema.panelWidth;
                        }

                        onLoadSchema(schemaData);
                        onClose();
                      } catch (error) {
                        console.error('Error loading schema:', error);
                        alert('Failed to load schema');
                      }
                    }}
                  >
                    <span className="schema-name">{schema.name}</span>
                    <span className="schema-date">
                      {formatDate(schema.createdAt)}
                    </span>
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(schema._id)}
                    aria-label="Delete schema"
                  >
                    
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
              placeholder="Enter file name"
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