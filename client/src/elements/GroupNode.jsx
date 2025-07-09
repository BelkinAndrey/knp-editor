import React from 'react';
import { Handle, Position } from 'reactflow';

const GroupNode = ({ data, selected }) => {
  return (
    <div style={{
      padding: '10px',
      borderRadius: '10px',
      border: selected ? '3px solid var(--accent-color)' : '1px solid var(--border-color)', // Используем border вместо borderColor
      backgroundColor: '#303030', // Темно-серый фон
      minWidth: '200px',
      minHeight: '100px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: selected ? '0 0 0 3px var(--accent-color)' : '0 2px 4px rgba(0, 0, 0, 0.1)', // Добавляем boxShadow
    }}>
      <div style={{
        background: 'var(--node-header-bg, #444)', // Fallback for header background
        padding: '5px 10px',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        marginTop: '-10px', // Adjust to align with parent border
        marginLeft: '-10px',
        marginRight: '-10px',
        marginBottom: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
        fontWeight: 'bold',
      }}>
        <div>{data.label || 'Group'}</div>
        <span style={{ cursor: 'pointer' }}>...</span> {/* Placeholder for icon/menu */}
      </div>
    </div>
  );
}

export default GroupNode; 