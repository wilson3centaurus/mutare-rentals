"use client";

// ── Shared helpers ──────────────────────────────────────────────────────────

type SliceData = { label: string; value: number; color: string };

function describeDonutSlice(
  cx: number, cy: number, outerR: number, innerR: number,
  startDeg: number, endDeg: number,
) {
  const toRad = (d: number) => (d - 90) * (Math.PI / 180);
  const ox1 = cx + outerR * Math.cos(toRad(startDeg));
  const oy1 = cy + outerR * Math.sin(toRad(startDeg));
  const ox2 = cx + outerR * Math.cos(toRad(endDeg));
  const oy2 = cy + outerR * Math.sin(toRad(endDeg));
  const ix1 = cx + innerR * Math.cos(toRad(endDeg));
  const iy1 = cy + innerR * Math.sin(toRad(endDeg));
  const ix2 = cx + innerR * Math.cos(toRad(startDeg));
  const iy2 = cy + innerR * Math.sin(toRad(startDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${ox1.toFixed(2)} ${oy1.toFixed(2)} A ${outerR} ${outerR} 0 ${large} 1 ${ox2.toFixed(2)} ${oy2.toFixed(2)} L ${ix1.toFixed(2)} ${iy1.toFixed(2)} A ${innerR} ${innerR} 0 ${large} 0 ${ix2.toFixed(2)} ${iy2.toFixed(2)} Z`;
}

/** Pure utility — builds slice paths from data; no render-level mutation */
function buildSlices(
  data: SliceData[],
  cx: number, cy: number, outerR: number, innerR: number,
) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return data.reduce<Array<SliceData & { path: string; start: number }>>((acc, d) => {
    const start = acc.length ? acc[acc.length - 1].start + (acc[acc.length - 1].value / total) * 360 : 0;
    const end = start + (d.value / total) * 360 - 0.5;
    return [...acc, { ...d, start, path: describeDonutSlice(cx, cy, outerR, innerR, start, end) }];
  }, []);
}

function DonutChart({ data, title }: { data: SliceData[]; title: string }) {
  const cx = 72, cy = 72, outerR = 62, innerR = 36;
  const slices = buildSlices(data, cx, cy, outerR, innerR);

  return (
    <div>
      <p className="text-xs font-semibold text-zinc-300 mb-3 text-center">{title}</p>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 144 144" className="w-28 h-28 flex-shrink-0">
          {slices.map((s) => (
            <path key={s.label} d={s.path} fill={s.color} />
          ))}
          {/* centre label */}
          <text x={cx} y={cy - 4} textAnchor="middle" fill="#e4e4e7" fontSize={11} fontWeight="bold">
            {data.length}
          </text>
          <text x={cx} y={cy + 9} textAnchor="middle" fill="#71717a" fontSize={8}>
            factors
          </text>
        </svg>

        <div className="space-y-1.5 flex-1 min-w-0">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-1.5 text-[10px] text-zinc-400">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: d.color }} />
              <span className="truncate">{d.label}</span>
              <span className="ml-auto text-zinc-500 pl-1">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BarChart({ data, title, prefix = "" }: { data: SliceData[]; title: string; prefix?: string }) {
  const max = Math.max(...data.map((d) => d.value));
  const barW = Math.min(32, Math.floor(200 / data.length) - 6);
  const gap = 6;
  const chartH = 90;
  const svgW = data.length * (barW + gap) + 16;

  return (
    <div>
      <p className="text-xs font-semibold text-zinc-300 mb-3 text-center">{title}</p>
      <svg viewBox={`0 0 ${svgW} ${chartH + 32}`} className="w-full">
        {/* grid lines */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={8} y1={chartH - f * chartH}
            x2={svgW - 4} y2={chartH - f * chartH}
            stroke="#27272a" strokeWidth={0.5}
          />
        ))}
        {data.map((d, i) => {
          const barH = Math.round((d.value / max) * chartH);
          const x = 8 + i * (barW + gap);
          const y = chartH - barH;
          return (
            <g key={d.label}>
              <rect x={x} y={y} width={barW} height={barH} rx={3} fill={d.color} opacity={0.88} />
              {/* value label */}
              <text
                x={x + barW / 2} y={y - 3}
                textAnchor="middle" fill="#a1a1aa" fontSize={8.5}
              >
                {prefix}{d.value}
              </text>
              {/* axis label — wrap long words */}
              <text
                x={x + barW / 2} y={chartH + 11}
                textAnchor="middle" fill="#71717a" fontSize={8}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Per-algorithm chart sets ────────────────────────────────────────────────

export function HedonicCharts() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5 pt-5 border-t border-zinc-800/60">
      <DonutChart
        title="Factor weight distribution"
        data={[
          { label: "Suburb location", value: 55, color: "#10b981" },
          { label: "Bedrooms",         value: 15, color: "#34d399" },
          { label: "Amenities",        value: 12, color: "#6ee7b7" },
          { label: "Bathrooms",        value: 8,  color: "#a7f3d0" },
          { label: "Size (m²)",        value: 6,  color: "#d1fae5" },
          { label: "Construction",     value: 4,  color: "#ecfdf5" },
        ]}
      />
      <BarChart
        title="2-bed house: avg. rent by suburb tier ($/mo)"
        prefix="$"
        data={[
          { label: "Tier 1",   value: 570, color: "#10b981" },
          { label: "Tier 2",   value: 302, color: "#34d399" },
          { label: "Tier 3",   value: 246, color: "#6ee7b7" },
          { label: "Room",     value: 65,  color: "#a7f3d0" },
        ]}
      />
    </div>
  );
}

export function ComparableSalesCharts() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5 pt-5 border-t border-zinc-800/60">
      <DonutChart
        title="Adjustment factor weights"
        data={[
          { label: "Suburb median", value: 58, color: "#3b82f6" },
          { label: "Bedrooms",      value: 14, color: "#60a5fa" },
          { label: "Size (m²)",     value: 12, color: "#93c5fd" },
          { label: "Bathrooms",     value: 8,  color: "#bfdbfe" },
          { label: "Construction",  value: 5,  color: "#dbeafe" },
          { label: "Amenities",     value: 3,  color: "#eff6ff" },
        ]}
      />
      <BarChart
        title="Property type multiplier (%)"
        data={[
          { label: "House",    value: 100, color: "#3b82f6" },
          { label: "T/house",  value: 92,  color: "#60a5fa" },
          { label: "Flat",     value: 82,  color: "#93c5fd" },
          { label: "Cottage",  value: 72,  color: "#bfdbfe" },
          { label: "Room",     value: 22,  color: "#dbeafe" },
        ]}
      />
    </div>
  );
}

export function CostApproachCharts() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5 pt-5 border-t border-zinc-800/60">
      <DonutChart
        title="Asset value breakdown"
        data={[
          { label: "Construction", value: 62, color: "#a855f7" },
          { label: "Land value",   value: 22, color: "#c084fc" },
          { label: "Amenities",    value: 11, color: "#d8b4fe" },
          { label: "Fittings",     value: 5,  color: "#ede9fe" },
        ]}
      />
      <BarChart
        title="Construction replacement cost per m² ($)"
        prefix="$"
        data={[
          { label: "Stone",  value: 420, color: "#a855f7" },
          { label: "Brick",  value: 360, color: "#c084fc" },
          { label: "Mixed",  value: 290, color: "#d8b4fe" },
          { label: "Wood",   value: 210, color: "#e9d5ff" },
          { label: "Metal",  value: 180, color: "#f3e8ff" },
        ]}
      />
    </div>
  );
}
