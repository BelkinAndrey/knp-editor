import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

function GroupNode({ data }) {
  return (
    <div
      style={{
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        background: 'var(--bg-secondary)',
        minWidth: '150px',
        minHeight: '80px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}
    >
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

export default memo(GroupNode); 