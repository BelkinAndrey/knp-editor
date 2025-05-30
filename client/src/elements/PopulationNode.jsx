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
        width: '150px',
        height: '25px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: '1.4em',
        textAlign: 'center',
        color: data.color || 'var(--text-color)'
      }}>
        {data.label}
      </div>
      <div style={{ 
        padding: '8px',
        borderRadius: '50%',
        border: '2px solid var(--border-color)',
        width: '80px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        background: 'var(--bg-secondary)',
        boxShadow: selected ? '0 0 0 3px var(--accent-color)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
        borderColor: selected ? 'var(--accent-color)' : 'var(--border-color)',
        position: 'relative',
        '--population-dots-color': data.color || 'var(--text-color,rgb(103, 100, 100))'
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

        <svg width="80" height="80" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="4" r="2" fill="var(--population-dots-color)"/>
        <circle cx="20" cy="12" r="2" fill="var(--population-dots-color)"/>
        <circle cx="6" cy="12" r="2" fill="var(--population-dots-color)"/>
        <circle cx="34" cy="12" r="2" fill="var(--population-dots-color)"/>
        <circle cx="13" cy="8" r="2" fill="var(--population-dots-color)"/>
        <circle cx="27" cy="8" r="2" fill="var(--population-dots-color)"/>
        <circle cx="20" cy="20" r="2" fill="var(--population-dots-color)"/>
        <circle cx="6" cy="20" r="2" fill="var(--population-dots-color)"/>
        <circle cx="34" cy="20" r="2" fill="var(--population-dots-color)"/>
        <circle cx="13" cy="16" r="2" fill="var(--population-dots-color)"/>
        <circle cx="27" cy="16" r="2" fill="var(--population-dots-color)"/>
        <circle cx="20" cy="28" r="2" fill="var(--population-dots-color)"/>
        <circle cx="6" cy="28" r="2" fill="var(--population-dots-color)"/>
        <circle cx="34" cy="28" r="2" fill="var(--population-dots-color)"/>
        <circle cx="13" cy="24" r="2" fill="var(--population-dots-color)"/>
        <circle cx="27" cy="24" r="2" fill="var(--population-dots-color)"/>
        <circle cx="20" cy="36" r="2" fill="var(--population-dots-color)"/>
        <circle cx="13" cy="32" r="2" fill="var(--population-dots-color)"/>
        <circle cx="27" cy="32" r="2" fill="var(--population-dots-color)"/>
        </svg>
      </div>
      
    </div>
  );
};

export default PopulationNode;
