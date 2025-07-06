import React from 'react';
import { BaseEdge, getBezierPath, useStore } from 'reactflow';
import { getEdgeParams } from '../utils/geometry';

function FloatingEdge({ id, source, target, markerEnd, style }) {
  const sourceNode = useStore((store) => store.nodeInternals.get(source));
  const targetNode = useStore((store) => store.nodeInternals.get(target));

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
    sourcePosition: "top", // These don't matter for a floating edge, but are required
    targetPosition: "bottom", // by getBezierPath
  });

  return <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />;
}

export default FloatingEdge; 