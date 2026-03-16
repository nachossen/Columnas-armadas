'use client';

import type { ColumnInputs } from '@/types';

interface SVGPlanViewProps {
  inputs: ColumnInputs;
}

const steel = '#93c5fd';
const steel2 = '#60a5fa';
const dim = '#f59e0b';
const axis = '#34d399';
const bg = '#0f172a';
const grid = 'rgba(59,130,246,0.08)';
const plate = '#a78bfa'; // violet for plates/chapas

export default function SVGPlanView({ inputs }: SVGPlanViewProps) {
  const { profile, h_sep, tipologia } = inputs;
  const svgW = 380;
  const svgH = 260;
  const cx = svgW / 2;
  const cy = svgH / 2;

  // ── Helpers ───────────────────────────────────────────────
  const maxDim = Math.max(profile.h, h_sep + 2 * profile.b, 200);
  const scale = 200 / maxDim; // px/mm

  const h_px = profile.h * scale;
  const b_px = profile.b * scale;
  const tw_px = Math.max(profile.tw * scale, 2);
  const tf_px = Math.max(profile.tf * scale, 2);
  const sep_px = h_sep * scale;
  const ys_px = profile.ys * 10 * scale;

  const left_alma_x = cx - sep_px / 2;
  const right_alma_x = cx + sep_px / 2;
  const left_cx = left_alma_x - ys_px;
  const right_cx = right_alma_x + ys_px;
  const top_y = cy - h_px / 2;
  const bot_y = cy + h_px / 2;

  // UPN path builders
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

  const dimY = bot_y + 22;

  // ── Render base background & grid ─────────────────────────
  function BgGrid() {
    return (
      <>
        <defs>
          <pattern id="grid-p" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke={grid} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={svgW} height={svgH + 60} fill={bg} />
        <rect width={svgW} height={svgH + 60} fill="url(#grid-p)" />
      </>
    );
  }

  // ── Axes ──────────────────────────────────────────────────
  function Axes() {
    return (
      <>
        <line x1={cx} y1={8} x2={cx} y2={svgH + 50}
          stroke={axis} strokeWidth="0.7" strokeDasharray="6,4" opacity="0.7" />
        <line x1={10} y1={cy} x2={svgW - 10} y2={cy}
          stroke={axis} strokeWidth="0.7" strokeDasharray="6,4" opacity="0.7" />
        <text x={svgW - 14} y={cy - 4} fill={axis} fontSize="9" fontFamily="monospace">x</text>
        <text x={cx + 4} y={16} fill={axis} fontSize="9" fontFamily="monospace">y</text>
      </>
    );
  }

  // ── Base UPN pair ─────────────────────────────────────────
  function UPNPair() {
    return (
      <>
        <path d={leftProfile} fill={steel} fillOpacity="0.15" stroke={steel} strokeWidth="1.5" />
        <path d={rightProfile} fill={steel} fillOpacity="0.15" stroke={steel} strokeWidth="1.5" />
        <circle cx={left_cx} cy={cy} r="3" fill={axis} />
        <circle cx={right_cx} cy={cy} r="3" fill={axis} />
        <circle cx={cx} cy={cy} r="4" fill={dim} />
        <text x={left_alma_x - b_px / 2} y={top_y - 6} textAnchor="middle"
          fill={steel} fontSize="9" fontFamily="monospace">{profile.designation}</text>
        <text x={right_alma_x + b_px / 2} y={top_y - 6} textAnchor="middle"
          fill={steel} fontSize="9" fontFamily="monospace">{profile.designation}</text>
        <text x={cx + 6} y={cy - 6} fill={dim} fontSize="8" fontFamily="monospace">CG</text>
      </>
    );
  }

  // ── Dim lines ─────────────────────────────────────────────
  function DimLines() {
    return (
      <>
        <line x1={left_alma_x} y1={dimY} x2={right_alma_x} y2={dimY}
          stroke={dim} strokeWidth="1" />
        <text x={cx} y={dimY - 4} textAnchor="middle"
          fill={dim} fontSize="9" fontFamily="monospace">h_sep = {h_sep} mm</text>
        <line x1={left_alma_x - b_px - 12} y1={top_y} x2={left_alma_x - b_px - 12} y2={bot_y}
          stroke={dim} strokeWidth="1" />
        <line x1={left_alma_x - b_px - 15} y1={top_y} x2={left_alma_x - b_px - 9} y2={top_y}
          stroke={dim} strokeWidth="1" />
        <line x1={left_alma_x - b_px - 15} y1={bot_y} x2={left_alma_x - b_px - 9} y2={bot_y}
          stroke={dim} strokeWidth="1" />
        <text x={left_alma_x - b_px - 14} y={cy} textAnchor="middle"
          fill={dim} fontSize="8" fontFamily="monospace"
          transform={`rotate(-90, ${left_alma_x - b_px - 14}, ${cy})`}>
          h={profile.h}mm
        </text>
      </>
    );
  }

  // ── Typology-specific elements ────────────────────────────

  // EMPRESILLADA: presilla (batten plate) at mid-height — drawn between the two UPN
  function EmpresilladadExtra() {
    const battenH = h_px * 0.5; // presilla aprox 50% of h
    const battenTop = cy - battenH / 2;
    const battenBot = cy + battenH / 2;
    return (
      <rect
        x={left_alma_x} y={battenTop}
        width={sep_px} height={battenH}
        fill={steel2} fillOpacity="0.25" stroke={steel2} strokeWidth="1.5" strokeDasharray="3,2"
      />
    );
  }

  // CELOSIA: diagonal bar between the two UPN
  function CelosiaExtra() {
    return (
      <line x1={left_alma_x} y1={top_y} x2={right_alma_x} y2={bot_y}
        stroke={steel2} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.8" />
    );
  }

  // CAJÓN: top and bottom plates
  function CajonExtra() {
    const tcp = inputs.t_cp ?? 12;
    const tcp_px = Math.max(tcp * scale, 3);
    const b_total_px = sep_px + 2 * Math.max(profile.tw * scale, 2);
    const plateLeft = cx - b_total_px / 2;
    return (
      <>
        {/* Top plate */}
        <rect x={plateLeft} y={top_y - tcp_px} width={b_total_px} height={tcp_px}
          fill={plate} fillOpacity="0.35" stroke={plate} strokeWidth="1.5" />
        {/* Bottom plate */}
        <rect x={plateLeft} y={bot_y} width={b_total_px} height={tcp_px}
          fill={plate} fillOpacity="0.35" stroke={plate} strokeWidth="1.5" />
        <text x={cx} y={top_y - tcp_px - 4} textAnchor="middle"
          fill={plate} fontSize="8" fontFamily="monospace">t_cp={tcp}mm</text>
      </>
    );
  }

  // CHAPAS CONTINUAS: lateral plates on each side
  function ChapasExtra() {
    const tcp = inputs.t_cp ?? 12;
    const tcp_px = Math.max(tcp * scale, 3);
    const leftPlateX = left_alma_x - b_px - tcp_px;
    const rightPlateX = right_alma_x + b_px;
    return (
      <>
        {/* Left plate */}
        <rect x={leftPlateX} y={top_y} width={tcp_px} height={h_px}
          fill={plate} fillOpacity="0.35" stroke={plate} strokeWidth="1.5" />
        {/* Right plate */}
        <rect x={rightPlateX} y={top_y} width={tcp_px} height={h_px}
          fill={plate} fillOpacity="0.35" stroke={plate} strokeWidth="1.5" />
        <text x={leftPlateX - 2} y={cy} textAnchor="end"
          fill={plate} fontSize="8" fontFamily="monospace"
          transform={`rotate(-90, ${leftPlateX - 2}, ${cy})`}>
          t_cp={tcp}mm
        </text>
      </>
    );
  }

  // PERFILES EN CONTACTO: 2 L-shapes back-to-back
  function ContactoView() {
    const ang = inputs.angulo_contacto;
    if (!ang) return <text x={cx} y={cy} textAnchor="middle" fill={steel} fontSize="10" fontFamily="monospace">Sin ángulo</text>;

    // Scale for angle section (use height of angle ≈ leg length a)
    const maxA = Math.max(ang.A * 10, 100); // rough mm scale
    const scA = 140 / maxA;
    const legA_px = Math.sqrt(ang.A) * 10 * scA; // rough leg length from area
    const t_px = Math.max(4, legA_px * 0.12); // rough thickness

    // Left angle (opens right) — legs go right and up
    const Lx = cx - 4; // gap of 4px (h_sep very small, typically 10mm)
    const Rx = cx + 4;
    const topA = cy - legA_px / 2;
    const botA = cy + legA_px / 2;

    // Left L: vertical leg going down from top, horizontal leg going left
    const leftL = `
      M ${Lx - t_px} ${topA}
      L ${Lx} ${topA}
      L ${Lx} ${botA - t_px}
      L ${Lx - legA_px + t_px} ${botA - t_px}
      L ${Lx - legA_px + t_px} ${botA}
      L ${Lx - t_px} ${botA}
      Z
    `;
    // Right L: mirror
    const rightL = `
      M ${Rx + t_px} ${topA}
      L ${Rx} ${topA}
      L ${Rx} ${botA - t_px}
      L ${Rx + legA_px - t_px} ${botA - t_px}
      L ${Rx + legA_px - t_px} ${botA}
      L ${Rx + t_px} ${botA}
      Z
    `;

    return (
      <>
        <path d={leftL} fill={steel} fillOpacity="0.2" stroke={steel} strokeWidth="1.5" />
        <path d={rightL} fill={steel} fillOpacity="0.2" stroke={steel} strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="4" fill={dim} />
        <text x={cx} y={topA - 8} textAnchor="middle"
          fill={steel} fontSize="9" fontFamily="monospace">2×{ang.designation}</text>
        <text x={cx + 6} y={cy - 6} fill={dim} fontSize="8" fontFamily="monospace">CG</text>
        {/* Axes */}
        <line x1={cx} y1={8} x2={cx} y2={svgH + 50}
          stroke={axis} strokeWidth="0.7" strokeDasharray="6,4" opacity="0.7" />
        <line x1={10} y1={cy} x2={svgW - 10} y2={cy}
          stroke={axis} strokeWidth="0.7" strokeDasharray="6,4" opacity="0.7" />
        <text x={svgW - 14} y={cy - 4} fill={axis} fontSize="9" fontFamily="monospace">x</text>
        <text x={cx + 4} y={16} fill={axis} fontSize="9" fontFamily="monospace">y</text>
        <text x={cx} y={botA + 26} textAnchor="middle"
          fill={dim} fontSize="9" fontFamily="monospace">h_sep = {h_sep} mm</text>
      </>
    );
  }

  const isContacto = tipologia === 'perfiles_contacto';

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
        <BgGrid />

        {isContacto ? (
          <ContactoView />
        ) : (
          <>
            <Axes />
            <UPNPair />
            {tipologia === 'empresillada' && <EmpresilladadExtra />}
            {tipologia === 'celosia' && <CelosiaExtra />}
            {tipologia === 'cajón' && <CajonExtra />}
            {tipologia === 'chapas_continuas' && <ChapasExtra />}
            <DimLines />
          </>
        )}
      </svg>
    </div>
  );
}
