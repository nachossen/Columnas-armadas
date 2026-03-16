'use client';

import type { ColumnInputs, LacingResults } from '@/types';

interface SVGLateralViewProps {
  inputs: ColumnInputs;
  lacing?: LacingResults;
}

export default function SVGLateralView({ inputs, lacing }: SVGLateralViewProps) {
  const { L, a, h_sep, profile, tipologia, celosia_tipo } = inputs;
  const isCelosia = tipologia === 'celosia';
  const svgW = 200;
  const svgH = 320;

  // Escala vertical: columna ocupa 260px
  const colH_px = 260;
  const scale = colH_px / (L * 1000); // px/mm

  const marginTop = 24;
  const marginLeft = 40;
  const colW_px = Math.max((h_sep + 2 * profile.tw) * scale * 3, 40);
  const colCx = marginLeft + colW_px / 2;

  const colTop = marginTop;
  const colBot = marginTop + colH_px;
  const halfW = colW_px / 2;

  const a_px = a * scale;
  const n_panels = Math.max(1, Math.floor((L * 1000) / a));

  const steel = '#93c5fd';
  const dim = '#f59e0b';
  const batten_color = '#60a5fa';
  const lace_color = '#a78bfa'; // purple for lacing diagonals
  const bg = '#0f172a';
  const grid = 'rgba(59,130,246,0.08)';
  const axis = '#34d399';

  // ── Battenned: horizontal plates ──
  const battenH_px = Math.max(4, 6);
  const battenW_px = colW_px + 4;
  const n_battens = Math.max(0, Math.floor((L * 1000) / a) - 1);
  const battens: number[] = [];
  for (let i = 1; i <= n_battens; i++) {
    battens.push(colTop + i * a_px);
  }

  // ── Laced: diagonal bars ──
  // Each panel goes from y_top to y_top + a_px, alternating left→right and right→left
  // For double lacing: both diagonals in each panel
  const lacingLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  if (isCelosia) {
    const xLeft = colCx - halfW;
    const xRight = colCx + halfW;
    for (let i = 0; i < n_panels; i++) {
      const yTop = colTop + i * a_px;
      const yBot = Math.min(colTop + (i + 1) * a_px, colBot);
      if (celosia_tipo === 'doble') {
        // Both diagonals
        lacingLines.push({ x1: xLeft, y1: yTop, x2: xRight, y2: yBot });
        lacingLines.push({ x1: xRight, y1: yTop, x2: xLeft, y2: yBot });
      } else {
        // Alternating: even panels go left-to-right, odd panels go right-to-left
        if (i % 2 === 0) {
          lacingLines.push({ x1: xLeft, y1: yTop, x2: xRight, y2: yBot });
        } else {
          lacingLines.push({ x1: xRight, y1: yTop, x2: xLeft, y2: yBot });
        }
      }
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs text-slate-400 font-semibold tracking-wider uppercase mb-1">
        Vista Lateral — {isCelosia ? `Celosía ${celosia_tipo ?? 'simple'}` : 'Empresillada'}
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

        {/* BARRAS DE CELOSÍA — diagonales */}
        {isCelosia && lacingLines.map((ln, i) => (
          <line
            key={i}
            x1={ln.x1} y1={ln.y1}
            x2={ln.x2} y2={ln.y2}
            stroke={lace_color}
            strokeWidth="1.5"
            opacity="0.85"
          />
        ))}

        {/* PRESILLAS — placas horizontales (sólo para empresillada) */}
        {!isCelosia && battens.map((by, i) => (
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

        {/* Placa base y tope */}
        <rect x={colCx - battenW_px / 2} y={colTop - battenH_px}
          width={battenW_px} height={battenH_px}
          fill={isCelosia ? lace_color : batten_color} fillOpacity="0.7"
          stroke={isCelosia ? lace_color : batten_color} strokeWidth="1" />
        <rect x={colCx - battenW_px / 2} y={colBot}
          width={battenW_px} height={battenH_px}
          fill={isCelosia ? lace_color : batten_color} fillOpacity="0.7"
          stroke={isCelosia ? lace_color : batten_color} strokeWidth="1" />

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

        {/* Cota 'a' (primer panel) */}
        {a_px > 10 && (
          <>
            <line x1={colCx - halfW - 12} y1={colTop} x2={colCx - halfW - 12} y2={colTop + a_px}
              stroke={dim} strokeWidth="0.8" strokeDasharray="2,2" />
            <line x1={colCx - halfW - 15} y1={colTop} x2={colCx - halfW - 9} y2={colTop}
              stroke={dim} strokeWidth="1" />
            <line x1={colCx - halfW - 15} y1={colTop + a_px} x2={colCx - halfW - 9} y2={colTop + a_px}
              stroke={dim} strokeWidth="1" />
            <text
              x={colCx - halfW - 18}
              y={(colTop + colTop + a_px) / 2 + 3}
              textAnchor="middle"
              fill={dim} fontSize="8" fontFamily="JetBrains Mono, monospace"
              transform={`rotate(-90, ${colCx - halfW - 18}, ${(colTop + colTop + a_px) / 2})`}
            >
              a={a}mm
            </text>
          </>
        )}

        {/* Ángulo θ para celosía */}
        {isCelosia && lacing && (
          <text x={colCx} y={colBot + 12} textAnchor="middle"
            fill={lace_color} fontSize="8" fontFamily="JetBrains Mono, monospace">
            θ={lacing.theta_deg.toFixed(1)}° · ld={lacing.l_d.toFixed(0)}mm
          </text>
        )}

        {/* Etiqueta para empresillada */}
        {!isCelosia && (
          <text x={colCx} y={colBot + 20} textAnchor="middle"
            fill="#64748b" fontSize="8" fontFamily="JetBrains Mono, monospace">
            {n_battens} presillas intermedias
          </text>
        )}

        {/* Condición de borde */}
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
