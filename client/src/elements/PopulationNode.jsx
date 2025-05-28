import React from 'react';
import { Handle, Position } from 'reactflow';

const PopulationNode = ({ data, selected }) => {
  return (
    <div style={{ 
      width: '80px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '5px'
    }}>
      <div style={{ 
        fontWeight: 300,
        width: '80px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: '0.9em',
        textAlign: 'center',
        marginBottom: '2px'
      }}>
        {data.label || 'no name'}
      </div>
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
        borderColor: selected ? 'var(--accent-color)' : 'var(--border-color)',
        position: 'relative'
      }}>
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#555', width: 10, height: 10, borderRadius: '2px' }}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: '#555', width: 10, height: 10, borderRadius: '2px' }}
        />
      </div>
    </div>
  );
};

export default PopulationNode;
