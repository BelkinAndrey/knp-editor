import React from 'react';
import { Handle, Position } from 'reactflow';

const InputNode = ({ data, selected }) => {
  return (
    <div style={{ 
        padding: '10px 20px',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        backgroundColor: '#C4841D',
        minWidth: '150px',
        boxShadow: selected ? '0 0 0 3px var(--accent-color)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
        borderColor: selected ? 'var(--accent-color)' : 'var(--border-color)'
      }}>
      <div style={{ fontWeight: 300 }}>
        {data.label || 'Input'}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555', width: 10, height: 10, borderRadius: '2px' }}
      />
    </div>
  );
};

export default InputNode;
