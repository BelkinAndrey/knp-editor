export const getPointOnCircle = (center, radius, point) => {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) {
    return { x: center.x, y: center.y - radius };
  }

  const ratio = radius / dist;
  return {
    x: center.x + dx * ratio,
    y: center.y + dy * ratio,
  };
};

export const getEdgeParams = (source, target) => {
  const sourceCenter = {
    x: source.positionAbsolute.x + source.width / 2,
    y: source.positionAbsolute.y + source.height / 2,
  };
  const targetCenter = {
    x: target.positionAbsolute.x + target.width / 2,
    y: target.positionAbsolute.y + target.height / 2,
  };

  const sourceRadius = source.type === 'populationNode' ? source.width / 2 : 0;
  const targetRadius = target.type === 'populationNode' ? target.width / 2 : 0;

  const sourceIntersection = getPointOnCircle(sourceCenter, sourceRadius, targetCenter);
  const targetIntersection = getPointOnCircle(targetCenter, targetRadius, sourceCenter);

  return {
    sx: sourceIntersection.x,
    sy: sourceIntersection.y,
    tx: targetIntersection.x,
    ty: targetIntersection.y,
    sourcePos: "top", // Placeholder, actual position doesn't matter for custom edge
    targetPos: "bottom", // Placeholder
  };
}; 