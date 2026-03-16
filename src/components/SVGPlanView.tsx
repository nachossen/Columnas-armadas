'use client';

import type { ColumnInputs } from '@/types';

interface SVGPlanViewProps {
  inputs: ColumnInputs;
}

export default function SVGPlanView({ inputs }: SVGPlanViewProps) {
  const { profile, h_sep } = inputs;
  const svgW = 380;
  const svgH = 260;
  const cx = svgW / 2;
  const cy = svgH / 2;

  // Escala: max dimension = 280px
  const maxDim = Math.max(profile.h, h_sep + 2 * profile.b, 200);
  const scale = 200 / maxDim; // px/mm

  const h_px = profile.h * scale;      // altura del perfil
  const b_px = profile.b * scale;      // ancho del ala
  const tw_px = Math.max(profile.tw * scale, 2); // espesor de alma
  const tf_px = Math.max(profile.tf * scale, 2); // espesor de ala
  const sep_px = h_sep * scale;         // separación back-to-back
  const ys_px = profile.ys * 10 * scale; // distancia centroide-alma en px

  // Centros de los dos perfiles:
  // perfil izquierdo: cara exterior del alma en cx - sep_px/2
  // perfil derecho: cara exterior del alma en cx + sep_px/2
  const left_alma_x = cx - sep_px / 2;   // cara exterior del alma izq
  const right_alma_x = cx + sep_px / 2;   // cara exterior del alma der

  // UPN izquierdo (alas hacia la izquierda, boca abierta hacia la derecha)
  const left_cx = left_alma_x - ys_px;    // centroide izq

  // UPN derecho (alas hacia la derecha, boca abierta hacia la izquierda)
  const right_cx = right_alma_x + ys_px;  // centroide der

  const top_y = cy - h_px / 2;
  const bot_y = cy + h_px / 2;

  // Colores blueprint
  const steel = '#93c5fd';
  const dim = '#f59e0b';
  const axis = '#34d399';
  const bg = '#0f172a';
  const grid = 'rgba(59,130,246,0.08)';

  // Path para UPN izquierdo (abierto hacia la derecha)
  // Contorno: ala superior → alma → ala inferior
  const leftProfile = `
    M ${left_alma_x} ${top_y}
    L ${left_alma_x - b_px} ${top_y}
    L ${left_alma_x - b_px} ${top_y + tf_px}
    L ${left_alma_x - tw_px} ${top_y + tf_px}
    L ${left_alma_x - tw_px} ${bot_y - tf_px}
    L ${left_alma_x - b_px} ${bot_y - tf_px}
    L ${left_alma_x - b_px} ${bot_y}
    L ${left_alma_x} ${bot_y}
    Z
  `;

  // Path para UPN derecho (abierto hacia la izquierda) — espejado
  const rightProfile = `
    M ${right_alma_x} ${top_y}
    L ${right_alma_x + b_px} ${top_y}
    L ${right_alma_x + b_px} ${top_y + tf_px}
    L ${right_alma_x + tw_px} ${top_y + tf_px}
    L ${right_alma_x + tw_px} ${bot_y - tf_px}
    L ${right_alma_x + b_px} ${bot_y - tf_px}
    L ${right_alma_x + b_px} ${bot_y}
    L ${right_alma_x} ${bot_y}
    Z
  `;

  // Cotas
  const dimY = bot_y + 22;
  const dimY2 = bot_y + 40;

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs text-slate-400 font-semibold tracking-wider uppercase mb-1">
        Vista en Planta — Sección Transversal
      </div>
      <svg
        width={svgW}
        height={svgH + 60}
        viewBox={`0 0 ${svgW} ${svgH + 60}`}
        style={{ background: bg, borderRadius: 4 }}
      >
        {/* Grid */}
        <defs>
          <pattern id="grid-p" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke={grid} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={svgW} height={svgH + 60} fill={bg} />
        <rect width={svgW} height={svgH + 60} fill="url(#grid-p)" />

        {/* Eje centroidal vertical */}
        <line x1={cx} y1={8} x2={cx} y2={svgH + 50}
          stroke={axis} strokeWidth="0.7" strokeDasharray="6,4" opacity="0.7" />
        {/* Eje centroidal horizontal */}
        <line x1={10} y1={cy} x2={svgW - 10} y2={cy}
          stroke={axis} strokeWidth="0.7" strokeDasharray="6,4" opacity="0.7" />

        {/* Perfiles UPN */}
        <path d={leftProfile} fill={steel} fillOpacity="0.15" stroke={steel} strokeWidth="1.5" />
        <path d={rightProfile} fill={steel} fillOpacity="0.15" stroke={steel} strokeWidth="1.5" />

        {/* Puntos centroidales */}
        <circle cx={left_cx} cy={cy} r="3" fill={axis} />
        <circle cx={right_cx} cy={cy} r="3" fill={axis} />
        <circle cx={cx} cy={cy} r="4" fill={dim} />

        {/* Etiquetas de perfiles */}
        <text x={left_alma_x - b_px / 2} y={top_y - 6} textAnchor="middle"
          fill={steel} fontSize="9" fontFamily="JetBrains Mono, monospace">
          {profile.designation}
        </text>
        <text x={right_alma_x + b_px / 2} y={top_y - 6} textAnchor="middle"
          fill={steel} fontSize="9" fontFamily="JetBrains Mono, monospace">
          {profile.designation}
        </text>

        {/* Cota separación back-to-back */}
        <line x1={left_alma_x} y1={dimY} x2={right_alma_x} y2={dimY}
          stroke={dim} strokeWidth="1" markerEnd="url(#arr)" markerStart="url(#arr)" />
        <text x={cx} y={dimY - 4} textAnchor="middle"
          fill={dim} fontSize="9" fontFamily="JetBrains Mono, monospace">
          h_sep = {h_sep} mm
        </text>

        {/* Cota altura de perfil */}
        <line x1={left_alma_x - b_px - 12} y1={top_y} x2={left_alma_x - b_px - 12} y2={bot_y}
          stroke={dim} strokeWidth="1" />
        <line x1={left_alma_x - b_px - 15} y1={top_y} x2={left_alma_x - b_px - 9} y2={top_y}
          stroke={dim} strokeWidth="1" />
        <line x1={left_alma_x - b_px - 15} y1={bot_y} x2={left_alma_x - b_px - 9} y2={bot_y}
          stroke={dim} strokeWidth="1" />
        <text
          x={left_alma_x - b_px - 14} y={cy}
          textAnchor="middle"
          fill={dim} fontSize="8" fontFamily="JetBrains Mono, monospace"
          transform={`rotate(-90, ${left_alma_x - b_px - 14}, ${cy})`}
        >
          h={profile.h}mm
        </text>

        {/* Etiqueta centroide compuesto */}
        <text x={cx + 6} y={cy - 6} fill={dim} fontSize="8" fontFamily="JetBrains Mono, monospace">
          CG
        </text>

        {/* Eje X-X y Y-Y labels */}
        <text x={svgW - 14} y={cy - 4} fill={axis} fontSize="9" fontFamily="JetBrains Mono, monospace">x</text>
        <text x={cx + 4} y={16} fill={axis} fontSize="9" fontFamily="JetBrains Mono, monospace">y</text>
      </svg>
    </div>
  );
}
