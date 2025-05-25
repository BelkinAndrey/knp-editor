import React from 'react';
import './ContextMenu.css';

const ContextMenu = ({ x, y, onClose, onCreateNode, onMouseLeave }) => {
  const handleCreateNode = (nodeType) => (e) => {
    e.stopPropagation();
    onCreateNode({ x, y, nodeType });
    onClose();
  };

  return (
    <div 
      className="context-menu"
      style={{ 
        position: 'fixed',
        left: x,
        top: y,
      }}
      onMouseLeave={onMouseLeave}
    >
      <button 
        className="context-menu-item"
        onClick={handleCreateNode('inputNode')}
      >
        Создать входную ноду
      </button>
      <button 
        className="context-menu-item"
        onClick={handleCreateNode('outputNode')}
      >
        Создать выходную ноду
      </button>
      <button 
        className="context-menu-item"
        onClick={handleCreateNode('populationNode')}
      >
        Создать ноду популяции
      </button>
    </div>
  );
};

export default ContextMenu; 