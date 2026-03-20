interface BarSeries {
  dataKey: string;
  fill: string;
  label?: string;
}

interface DataPoint {
  [key: string]: string | number;
}

interface MiniBarChartProps {
  data: DataPoint[];
  yKey: string;
  series: BarSeries[];
  height?: number;
  yAxisWidth?: number;
}

export function MiniBarChart({ data, yKey, series, height = 200, yAxisWidth = 68 }: MiniBarChartProps) {
  const padTop = 8;
  const padBottom = 8;
  const padRight = 12;
  const viewW = 400;
  const totalH = height;

  const plotX0 = yAxisWidth;
  const plotW = viewW - plotX0 - padRight;
  const plotY0 = padTop;
  const innerH = totalH - padTop - padBottom;

  const rowH = innerH / data.length;
  const barH = Math.min(10, rowH * 0.35);
  const barGap = 3;

  // max value across all series
  const allVals: number[] = [];
  data.forEach((d) =>
    series.forEach((s) => {
      const v = Number(d[s.dataKey]);
      if (!isNaN(v)) allVals.push(v);
    })
  );
  const maxVal = Math.max(...allVals, 1);

  const xScale = (v: number) => (v / maxVal) * plotW;

  // X-axis ticks (0, 25%, 50%, 75%, 100%)
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * maxVal);

  function formatNum(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
    return String(Math.round(n));
  }

  return (
    <svg viewBox={`0 0 ${viewW} ${totalH}`} width="100%" height={totalH}>
      {/* Vertical grid lines */}
      {xTicks.map((tv, i) => (
        <line
          key={`vgrid-${i}`}
          x1={plotX0 + xScale(tv)}
          y1={plotY0}
          x2={plotX0 + xScale(tv)}
          y2={plotY0 + innerH}
          stroke="#f1f5f9"
          strokeWidth={1}
        />
      ))}

      {/* X-axis tick labels (top) */}
      {xTicks.map((tv, i) => (
        <text
          key={`xtick-${i}`}
          x={plotX0 + xScale(tv)}
          y={plotY0 - 2}
          textAnchor="middle"
          fontSize={9}
          fill="#94a3b8"
        >
          {i === 0 ? "" : formatNum(tv)}
        </text>
      ))}

      {data.map((d, rowIdx) => {
        const rowMidY = plotY0 + rowIdx * rowH + rowH / 2;
        const totalBarsH = series.length * barH + (series.length - 1) * barGap;
        const barsStartY = rowMidY - totalBarsH / 2;

        return (
          <g key={`row-${rowIdx}`}>
            {/* Y-axis label */}
            <text
              x={plotX0 - 6}
              y={rowMidY + 4}
              textAnchor="end"
              fontSize={10}
              fill="#64748b"
            >
              {String(d[yKey])}
            </text>

            {/* Bars */}
            {series.map((s, si) => {
              const val = Number(d[s.dataKey]);
              const barY = barsStartY + si * (barH + barGap);
              const barW = xScale(val);
              return (
                <g key={`bar-${s.dataKey}-${rowIdx}`}>
                  {/* Background track */}
                  <rect
                    x={plotX0}
                    y={barY}
                    width={plotW}
                    height={barH}
                    fill="#f8fafc"
                    rx={2}
                  />
                  {/* Value bar */}
                  <rect
                    x={plotX0}
                    y={barY}
                    width={Math.max(barW, 0)}
                    height={barH}
                    fill={s.fill}
                    rx={2}
                  />
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
