import React from 'react';
import { Handle, Position } from 'reactflow';

const GroupNode = ({ data, selected }) => {
  // Получаем список input и output нод из subFlow (только ноды на корневом уровне группы)
  const inputNodes = data.subFlow?.nodes?.filter(node => 
    node.type === 'inputNode' && !node.parentNode
  ) || [];
  const outputNodes = data.subFlow?.nodes?.filter(node => 
    node.type === 'outputNode' && !node.parentNode
  ) || [];

  // Вычисляем общее количество портов для определения высоты ноды
  const totalPorts = Math.max(inputNodes.length, outputNodes.length, 1);

  return (
    <div style={{
      borderRadius: '10px',
      border: '1px solid var(--border-color)',
      backgroundColor: '#303030',
      minWidth: '200px',
      minHeight: `${Math.max(100, 30 + totalPorts * 35)}px`,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: selected ? '0 0 0 3px var(--accent-color)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
      borderColor: selected ? 'var(--accent-color)' : 'var(--border-color)',
    }}>
      {/* Заголовок ноды */}
      <div style={{
        background: 'var(--node-header-bg, #444)',
        padding: '8px 12px',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div>{data.label || 'Group'}</div>
        <span style={{ cursor: 'pointer' }}>+</span>
      </div>

      {/* Тело ноды с портами */}
      <div style={{
        flex: 1,
        padding: '8px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}>
        {/* Входные порты (слева) - от input нод */}
        {inputNodes.map((inputNode, index) => (
          <div
            key={`input-row-${inputNode.id}-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '4px 8px',
              minHeight: '28px',
              backgroundColor: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
              position: 'relative',
            }}
          >
            <Handle
              type="target"
              position={Position.Left}
              id={`input-${inputNode.id}`}
              style={{
                background: '#C4841D',
                width: 10,
                height: 10,
                borderRadius: '2px',
                border: '1px solid var(--border-color)',
                left: '-5px',
                top: '50%',
                transform: 'translateY(-50%)',
                position: 'absolute',
              }}
            />
            <div style={{
              fontSize: '12px',
              color: 'var(--text-color)',
              padding: '2px 8px',
              borderRadius: '3px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
              marginLeft: '8px',
              textAlign: 'left',
            }}>
              {inputNode.data?.label || 'Input'}
            </div>
          </div>
        ))}

        {/* Выходные порты (справа) - от output нод */}
        {outputNodes.map((outputNode, index) => (
          <div
            key={`output-row-${outputNode.id}-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '4px 8px',
              minHeight: '28px',
              backgroundColor: (inputNodes.length + index) % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
              position: 'relative',
            }}
          >
            <div style={{
              fontSize: '12px',
              color: 'var(--text-color)',
              padding: '2px 8px',
              borderRadius: '3px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
              textAlign: 'right',
            }}>
              {outputNode.data?.label || 'Output'}
            </div>
            <Handle
              type="source"
              position={Position.Right}
              id={`output-${outputNode.id}`}
              style={{
                background: '#C4841D',
                width: 10,
                height: 10,
                borderRadius: '2px',
                border: '1px solid var(--border-color)',
                right: '-5px',
                top: '50%',
                transform: 'translateY(-50%)',
                position: 'absolute',
              }}
            />
          </div>
        ))}

        {/* Пустое состояние, если нет портов */}
        {inputNodes.length === 0 && outputNodes.length === 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 8px',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontStyle: 'italic',
          }}>
            Добавьте input или output ноды
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupNode; 