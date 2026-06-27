import './ScoreCircle.css';

/**
 * ScoreCircle — Circular score visualization
 *
 * Responsibility: Renders an SVG circle with an animated stroke that
 * fills proportionally to the score percentage.
 *
 * @param {number} score  - Match score 0-100
 * @param {string} color  - 'success' | 'info' | 'warning' | 'danger'
 * @param {string} label  - Human-readable score label
 */
function ScoreCircle({ score, color, label }) {
  const SIZE   = 160;
  const RADIUS = 62;
  const STROKE = 10;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  const colorMap = {
    success: { stroke: '#22c55e', bg: '#f0fdf4', text: '#15803d' },
    info:    { stroke: '#3b82f6', bg: '#eff6ff', text: '#1e40af' },
    warning: { stroke: '#f59e0b', bg: '#fffbeb', text: '#92400e' },
    danger:  { stroke: '#ef4444', bg: '#fef2f2', text: '#b91c1c' },
  };

  const colors = colorMap[color] || colorMap.info;

  return (
    <div className="score-circle-wrap" aria-label={`Match score: ${score}% — ${label}`}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="score-circle__svg"
        role="img"
        aria-hidden="true"
      >
        {/* Background track */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={colors.bg}
          strokeWidth={STROKE + 2}
        />

        {/* Score arc */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          className="score-circle__arc"
        />

        {/* Score number */}
        <text
          x={SIZE / 2}
          y={SIZE / 2 - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          className="score-circle__number"
          fill={colors.text}
        >
          {score}%
        </text>

        {/* Label below number */}
        <text
          x={SIZE / 2}
          y={SIZE / 2 + 20}
          textAnchor="middle"
          dominantBaseline="middle"
          className="score-circle__label"
          fill={colors.stroke}
        >
          {label}
        </text>
      </svg>
    </div>
  );
}

export default ScoreCircle;
