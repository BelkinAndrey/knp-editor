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
      <div
        style={{
          background: 'var(--bg-secondary)',
          padding: '5px',
          borderRadius: '3px',
          marginBottom: '5px',
          color: 'var(--text-color)',
          fontWeight: 'bold',
          textAlign: 'center',
          width: 'calc(100% - 10px)'
        }}
      >
        {data.label || 'Group'}
      </div>
    </div>
  );
}

export default GroupNode; 