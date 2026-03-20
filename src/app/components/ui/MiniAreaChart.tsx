interface Series {
  dataKey: string;
  stroke: string;
  fill?: string;
  fillOpacity?: number;
  dashed?: boolean;
}

interface DataPoint {
  [key: string]: string | number;
}

interface MiniAreaChartProps {
  data: DataPoint[];
  xKey: string;
  series: Series[];
  height?: number;
  yAxisWidth?: number;
}

function formatNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(n);
}

export function MiniAreaChart({ data, xKey, series, height = 200, yAxisWidth = 44 }: MiniAreaChartProps) {
  const padTop = 8;
  const padBottom = 28;
  const padRight = 12;
  const innerW = 100; // percentage-based via viewBox
  const totalH = height;
  const innerH = totalH - padTop - padBottom;

  // Collect all numeric values across all series
  const allVals: number[] = [];
  data.forEach((d) =>
    series.forEach((s) => {
      const v = Number(d[s.dataKey]);
      if (!isNaN(v)) allVals.push(v);
    })
  );
  const minVal = 0;
  const maxVal = Math.max(...allVals, 1);

  const viewW = 400;
  const plotX0 = yAxisWidth;
  const plotW = viewW - plotX0 - padRight;
  const plotY0 = padTop;

  const xPos = (i: number) => plotX0 + (i / (data.length - 1)) * plotW;
  const yPos = (v: number) => plotY0 + innerH - ((v - minVal) / (maxVal - minVal)) * innerH;

  const buildPath = (s: Series) => {
    const pts = data.map((d, i) => `${xPos(i)},${yPos(Number(d[s.dataKey]))}`);
    return `M ${pts.join(" L ")}`;
  };

  const buildArea = (s: Series) => {
    const pts = data.map((d, i) => `${xPos(i)},${yPos(Number(d[s.dataKey]))}`);
    const bottom = yPos(minVal);
    return `M ${xPos(0)},${bottom} L ${pts.join(" L ")} L ${xPos(data.length - 1)},${bottom} Z`;
  };

  // Y-axis tick values
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => minVal + t * (maxVal - minVal));

  return (
    <svg
      viewBox={`0 0 ${viewW} ${totalH}`}
      width="100%"
      height={totalH}
      style={{ overflow: "visible" }}
    >
      {/* Grid lines */}
      {yTicks.map((tv, i) => (
        <line
          key={`grid-${i}`}
          x1={plotX0}
          y1={yPos(tv)}
          x2={plotX0 + plotW}
          y2={yPos(tv)}
          stroke="#f1f5f9"
          strokeWidth={1}
        />
      ))}

      {/* Y-axis labels */}
      {yTicks.map((tv, i) => (
        <text
          key={`ylabel-${i}`}
          x={plotX0 - 6}
          y={yPos(tv) + 4}
          textAnchor="end"
          fontSize={10}
          fill="#94a3b8"
        >
          {formatNum(tv)}
        </text>
      ))}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={`xlabel-${i}`}
          x={xPos(i)}
          y={totalH - 4}
          textAnchor="middle"
          fontSize={10}
          fill="#94a3b8"
        >
          {String(d[xKey])}
        </text>
      ))}

      {/* Series: fill areas first, then lines on top */}
      {series.map((s) =>
        s.fill && s.fill !== "none" ? (
          <path
            key={`fill-${s.dataKey}`}
            d={buildArea(s)}
            fill={s.fill}
            fillOpacity={s.fillOpacity ?? 0.1}
            stroke="none"
          />
        ) : null
      )}
      {series.map((s) => (
        <path
          key={`line-${s.dataKey}`}
          d={buildPath(s)}
          fill="none"
          stroke={s.stroke}
          strokeWidth={2}
          strokeDasharray={s.dashed ? "4 2" : undefined}
        />
      ))}
    </svg>
  );
}
