'use client';

import type { ColumnInputs } from '@/types';

interface SVGLateralViewProps {
  inputs: ColumnInputs;
}

export default function SVGLateralView({ inputs }: SVGLateralViewProps) {
  const { L, a, h_sep, profile } = inputs;
  const svgW = 200;
  const svgH = 320;

  // Escala vertical: columna ocupa 260px
  const colH_px = 260;
  const scale = colH_px / (L * 1000); // px/mm

  const marginTop = 24;
  const marginLeft = 40;
  const colW_px = Math.max((h_sep + 2 * profile.tw) * scale * 3, 40);
  const colCx = marginLeft + colW_px / 2;

  // Posición y dimensiones de la columna
  const colTop = marginTop;
  const colBot = marginTop + colH_px;
  const halfW = colW_px / 2;

  // Presillas: ubicadas cada 'a' mm desde el tope
  const a_px = a * scale;
  const n_battens = Math.max(0, Math.floor((L * 1000) / a) - 1);
  const battenH_px = Math.max(4, 6); // altura de presilla en px
  const battenW_px = colW_px + 4;

  const battens: number[] = [];
  for (let i = 1; i <= n_battens; i++) {
    battens.push(colTop + i * a_px);
  }

  const steel = '#93c5fd';
  const dim = '#f59e0b';
  const batten_color = '#60a5fa';
  const bg = '#0f172a';
  const grid = 'rgba(59,130,246,0.08)';
  const axis = '#34d399';

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs text-slate-400 font-semibold tracking-wider uppercase mb-1">
        Vista Lateral — Elevación
      </div>
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ background: bg, borderRadius: 4 }}
      >
        {/* Grid */}
        <defs>
          <pattern id="grid-l" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke={grid} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={svgW} height={svgH} fill={bg} />
        <rect width={svgW} height={svgH} fill="url(#grid-l)" />

        {/* Eje central */}
        <line x1={colCx} y1={colTop - 10} x2={colCx} y2={colBot + 10}
          stroke={axis} strokeWidth="0.7" strokeDasharray="6,3" opacity="0.6" />

        {/* Columna — dos almas verticales */}
        <rect
          x={colCx - halfW}
          y={colTop}
          width={Math.max(2, profile.tw * scale * 3)}
          height={colH_px}
          fill={steel} fillOpacity="0.2" stroke={steel} strokeWidth="1.5"
        />
        <rect
          x={colCx + halfW - Math.max(2, profile.tw * scale * 3)}
          y={colTop}
          width={Math.max(2, profile.tw * scale * 3)}
          height={colH_px}
          fill={steel} fillOpacity="0.2" stroke={steel} strokeWidth="1.5"
        />

        {/* Placas de presilla */}
        {battens.map((by, i) => (
          <rect
            key={i}
            x={colCx - battenW_px / 2}
            y={by - battenH_px / 2}
            width={battenW_px}
            height={battenH_px}
            fill={batten_color}
            fillOpacity="0.5"
            stroke={batten_color}
            strokeWidth="1"
          />
        ))}

        {/* Placa base y tope (presillas de extremo) */}
        <rect x={colCx - battenW_px / 2} y={colTop - battenH_px}
          width={battenW_px} height={battenH_px}
          fill={batten_color} fillOpacity="0.7" stroke={batten_color} strokeWidth="1" />
        <rect x={colCx - battenW_px / 2} y={colBot}
          width={battenW_px} height={battenH_px}
          fill={batten_color} fillOpacity="0.7" stroke={batten_color} strokeWidth="1" />

        {/* Cota L */}
        <line x1={colCx + halfW + 14} y1={colTop} x2={colCx + halfW + 14} y2={colBot}
          stroke={dim} strokeWidth="1" />
        <line x1={colCx + halfW + 11} y1={colTop} x2={colCx + halfW + 17} y2={colTop}
          stroke={dim} strokeWidth="1" />
        <line x1={colCx + halfW + 11} y1={colBot} x2={colCx + halfW + 17} y2={colBot}
          stroke={dim} strokeWidth="1" />
        <text
          x={colCx + halfW + 22}
          y={(colTop + colBot) / 2 + 4}
          fill={dim} fontSize="9" fontFamily="JetBrains Mono, monospace"
          transform={`rotate(90, ${colCx + halfW + 22}, ${(colTop + colBot) / 2})`}
        >
          L = {L.toFixed(1)} m
        </text>

        {/* Cota 'a' (primera separación) */}
        {battens.length > 0 && (
          <>
            <line x1={colCx - halfW - 12} y1={colTop} x2={colCx - halfW - 12} y2={battens[0]}
              stroke={dim} strokeWidth="0.8" strokeDasharray="2,2" />
            <line x1={colCx - halfW - 15} y1={colTop} x2={colCx - halfW - 9} y2={colTop}
              stroke={dim} strokeWidth="1" />
            <line x1={colCx - halfW - 15} y1={battens[0]} x2={colCx - halfW - 9} y2={battens[0]}
              stroke={dim} strokeWidth="1" />
            <text
              x={colCx - halfW - 18}
              y={(colTop + battens[0]) / 2 + 3}
              textAnchor="middle"
              fill={dim} fontSize="8" fontFamily="JetBrains Mono, monospace"
              transform={`rotate(-90, ${colCx - halfW - 18}, ${(colTop + battens[0]) / 2})`}
            >
              a={a}mm
            </text>
          </>
        )}

        {/* Etiquetas */}
        <text x={colCx} y={colBot + 20} textAnchor="middle"
          fill="#64748b" fontSize="8" fontFamily="JetBrains Mono, monospace">
          {n_battens} presillas intermedias
        </text>

        {/* Empotramientos (condición de borde) */}
        <line x1={colCx - 16} y1={colTop} x2={colCx + 16} y2={colTop}
          stroke="#94a3b8" strokeWidth="2" />
        <line x1={colCx - 16} y1={colBot} x2={colCx + 16} y2={colBot}
          stroke="#94a3b8" strokeWidth="2" />
        {[...Array(4)].map((_, i) => (
          <line key={i}
            x1={colCx - 16 + i * 10} y1={colTop - 6} x2={colCx - 16 + i * 10 - 6} y2={colTop}
            stroke="#94a3b8" strokeWidth="1" />
        ))}
        {[...Array(4)].map((_, i) => (
          <line key={i}
            x1={colCx - 16 + i * 10} y1={colBot} x2={colCx - 16 + i * 10 - 6} y2={colBot + 6}
            stroke="#94a3b8" strokeWidth="1" />
        ))}
      </svg>
    </div>
  );
}
