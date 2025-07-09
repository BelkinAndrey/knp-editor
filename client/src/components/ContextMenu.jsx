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
        onClick={handleCreateNode('populationNode')}
        data-icon="⭘"
      >
        Population 
      </button>
      <button 
        className="context-menu-item"
        onClick={handleCreateNode('inputNode')}
        data-icon="⇥"
      >
        Input 
      </button>
      <button 
        className="context-menu-item"
        onClick={handleCreateNode('outputNode')}
        data-icon="↦"
      >
        Output 
      </button>
      <button 
        className="context-menu-item"
        onClick={handleCreateNode('groupNode')}
        data-icon="⠿"
      >
        Group
      </button>
    </div>
  );
};

export default ContextMenu; 