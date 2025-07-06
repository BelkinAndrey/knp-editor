import React from 'react';
import { getBezierPath } from 'reactflow';

function CustomConnectionLine({ fromX, fromY, toX, toY, connectionLineStyle }) {
  const [edgePath] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: "top",
    targetX: toX,
    targetY: toY,
    targetPosition: "bottom",
  });

  return (
    <g>
      <path
        fill="none"
        strokeWidth={1.5}
        style={connectionLineStyle}
        d={edgePath}
      />
      <circle cx={toX} cy={toY} r={3} fill="black" stroke="black" strokeWidth={1.5} />
    </g>
  );
}

export default CustomConnectionLine; 