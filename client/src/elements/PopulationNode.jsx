import React from 'react';
import { Handle, Position } from 'reactflow';

const PopulationNode = ({ data, selected }) => {
  return (
    <div style={{ 
      padding: '20px',
      borderRadius: '50%',
      border: '1px solid var(--border-color)',
      width: '80px',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      background: 'var(--bg-secondary)',
      boxShadow: selected ? '0 0 0 3px var(--accent-color)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
      borderColor: selected ? 'var(--accent-color)' : 'var(--border-color)'
    }}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
      />
      <div style={{ fontWeight: 'bold' }}>
        {data.label || 'Популяция'}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
      />
    </div>
  );
};

export default PopulationNode;
