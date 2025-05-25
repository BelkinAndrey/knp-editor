import React from 'react';
import './ContextMenu.css';

const ContextMenu = ({ x, y, onClose, onCreateNode }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    onCreateNode({ x, y });
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
    >
      <button 
        className="context-menu-item"
        onClick={handleClick}
      >
        Создать ноду
      </button>
    </div>
  );
};

export default ContextMenu; 