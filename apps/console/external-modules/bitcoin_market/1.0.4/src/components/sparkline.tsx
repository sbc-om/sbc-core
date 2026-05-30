export function Sparkline({
  points,
  stroke = "#f59e0b",
  fill = "rgba(245, 158, 11, 0.16)",
  className,
}: {
  points: number[];
  stroke?: string;
  fill?: string;
  className?: string;
}) {
  if (points.length === 0) {
    return <div className={className} />;
  }

  const width = 100;
  const height = 36;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coordinates = points.map((point, index) => {
    const x = (index / Math.max(points.length - 1, 1)) * width;
    const y = height - ((point - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const areaPoints = [`0,${height}`, ...coordinates, `${width},${height}`].join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="none" aria-hidden="true">
      <polygon points={areaPoints} fill={fill} />
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={coordinates.join(" ")}
      />
    </svg>
  );
}