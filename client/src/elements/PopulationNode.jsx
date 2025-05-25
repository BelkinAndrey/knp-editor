import React from 'react';
import { Handle, Position } from 'reactflow';

const PopulationNode = ({ data }) => {
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
      background: 'var(--bg-secondary)'
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
