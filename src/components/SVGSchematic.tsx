'use client';

// ============================================================
// SVG ESQUEMÁTICOS DE SECCIÓN TRANSVERSAL
// Mini dibujos técnicos para el menú de selección de tipología
// ============================================================

import type { TipologiaColumna } from '@/types';

interface SVGSchematicProps {
  tipologia: TipologiaColumna;
  width?: number;
  height?: number;
  active?: boolean;
}

export default function SVGSchematic({
  tipologia,
  width = 160,
  height = 110,
  active = true,
}: SVGSchematicProps) {
  const bg = '#0a1628';
  const steel = active ? '#93c5fd' : '#475569';
  const plate = active ? '#60a5fa' : '#334155';
  const lace = active ? '#a78bfa' : '#475569';
  const dim = active ? '#f59e0b' : '#475569';
  const axis = active ? '#34d399' : '#334155';
  const grid = active ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.02)';

  const cx = width / 2;
  const cy = height / 2;

  // ── Componentes reutilizables ──────────────────────────────

  // UPN (canal C): x=posición del alma exterior, dir= +1 (alas izq) | -1 (alas der)
  const UPN = (x: number, y: number, h: number, b: number, tw: number, tf: number, dir: number) => {
    // dir=+1: alas hacia la derecha; dir=-1: alas hacia la izquierda
    const almaX = x;
    const alaX = x + dir * b;
    return (
      <path
        d={`
          M ${almaX} ${y}
          L ${alaX} ${y}
          L ${alaX} ${y + tf}
          L ${almaX + dir * tw} ${y + tf}
          L ${almaX + dir * tw} ${y + h - tf}
          L ${alaX} ${y + h - tf}
          L ${alaX} ${y + h}
          L ${almaX} ${y + h}
          Z
        `}
        fill={steel}
        fillOpacity="0.15"
        stroke={steel}
        strokeWidth="1.2"
      />
    );
  };

  // Ángulo L: esquina en (x,y), legs going right and up
  const Angulo = (x: number, y: number, a: number, t: number, mirrorX = false) => {
    const mx = mirrorX ? -1 : 1;
    return (
      <path
        d={`
          M ${x} ${y}
          L ${x + mx * a} ${y}
          L ${x + mx * a} ${y - t}
          L ${x + mx * t} ${y - t}
          L ${x + mx * t} ${y - a}
          L ${x} ${y - a}
          Z
        `}
        fill={steel}
        fillOpacity="0.15"
        stroke={steel}
        strokeWidth="1.2"
      />
    );
  };

  const renderContent = () => {
    switch (tipologia) {

      // ── Grupo V: Empresillada ──────────────────────────────
      case 'empresillada': {
        const h = 48, b = 16, tw = 3, tf = 3;
        const sep = 22;
        const xL = cx - sep / 2;
        const xR = cx + sep / 2;
        const yTop = cy - h / 2;
        // Presilla
        const presH = 4, presW = sep + b * 2;
        return (
          <g>
            {/* eje central */}
            <line x1={cx} y1={yTop - 8} x2={cx} y2={yTop + h + 8} stroke={axis} strokeWidth="0.6" strokeDasharray="5,3" opacity="0.7" />
            {/* UPN izq (alas izq) */}
            {UPN(xL, yTop, h, b, tw, tf, -1)}
            {/* UPN der (alas der) */}
            {UPN(xR, yTop, h, b, tw, tf, +1)}
            {/* Presilla superior */}
            <rect x={cx - presW / 2} y={yTop - presH} width={presW} height={presH} fill={plate} fillOpacity="0.6" stroke={plate} strokeWidth="1" />
            {/* Presilla inferior */}
            <rect x={cx - presW / 2} y={yTop + h} width={presW} height={presH} fill={plate} fillOpacity="0.6" stroke={plate} strokeWidth="1" />
            {/* Presilla intermedia */}
            <rect x={cx - presW / 2} y={cy - presH / 2} width={presW} height={presH} fill={plate} fillOpacity="0.4" stroke={plate} strokeWidth="0.8" />
            {/* Etiqueta */}
            <text x={cx} y={yTop + h + 20} textAnchor="middle" fill={dim} fontSize="7" fontFamily="monospace">2×UPN + presillas</text>
          </g>
        );
      }

      // ── Grupo IV: Celosía ──────────────────────────────────
      case 'celosia': {
        const h = 48, b = 16, tw = 3, tf = 3;
        const sep = 22;
        const xL = cx - sep / 2;
        const xR = cx + sep / 2;
        const yTop = cy - h / 2;
        return (
          <g>
            <line x1={cx} y1={yTop - 8} x2={cx} y2={yTop + h + 8} stroke={axis} strokeWidth="0.6" strokeDasharray="5,3" opacity="0.7" />
            {UPN(xL, yTop, h, b, tw, tf, -1)}
            {UPN(xR, yTop, h, b, tw, tf, +1)}
            {/* Barra diagonal (en vista de planta no se ven, mostrar en elevación) */}
            {/* Aquí mostramos un mini-SVG de elevación alternativo */}
            {/* Cordones: líneas verticales */}
            <line x1={xL - b + 2} y1={yTop} x2={xL - b + 2} y2={yTop + h} stroke={lace} strokeWidth="0.7" strokeDasharray="3,2" opacity="0.5" />
            <line x1={xR + b - 2} y1={yTop} x2={xR + b - 2} y2={yTop + h} stroke={lace} strokeWidth="0.7" strokeDasharray="3,2" opacity="0.5" />
            {/* Barras diagonales (vista lateral esquemática) */}
            <line x1={xL - b / 2} y1={yTop} x2={xR + b / 2} y2={cy} stroke={lace} strokeWidth="1.5" opacity="0.85" />
            <line x1={xR + b / 2} y1={cy} x2={xL - b / 2} y2={yTop + h} stroke={lace} strokeWidth="1.5" opacity="0.85" />
            <text x={cx} y={yTop + h + 20} textAnchor="middle" fill={dim} fontSize="7" fontFamily="monospace">2×UPN + barras diag.</text>
          </g>
        );
      }

      // ── Grupo I: Perfiles en Contacto ──────────────────────
      case 'perfiles_contacto': {
        const a = 28, t = 4;
        const gap = 3; // platina intermedia
        const yBot = cy + a / 2;
        return (
          <g>
            <line x1={cx} y1={cy - a / 2 - 10} x2={cx} y2={cy + a / 2 + 10} stroke={axis} strokeWidth="0.6" strokeDasharray="5,3" opacity="0.7" />
            <line x1={cx - a - 10} y1={cy} x2={cx + a + 10} y2={cy} stroke={axis} strokeWidth="0.6" strokeDasharray="5,3" opacity="0.7" />
            {/* Platina central (en contacto) */}
            <rect x={cx - gap / 2} y={yBot - a} width={gap} height={a} fill={plate} fillOpacity="0.7" stroke={plate} strokeWidth="0.8" />
            {/* Ángulo izquierdo (L normal) */}
            {Angulo(cx - gap / 2, yBot, a, t, false)}
            {/* Ángulo derecho (espejo) */}
            {Angulo(cx + gap / 2, yBot, a, t, true)}
            {/* Puntos centroidales */}
            <circle cx={cx - gap / 2 - a * 0.3} cy={cy + 5} r="2" fill={axis} />
            <circle cx={cx + gap / 2 + a * 0.3} cy={cy + 5} r="2" fill={axis} />
            <text x={cx} y={yBot + 16} textAnchor="middle" fill={dim} fontSize="7" fontFamily="monospace">2L espalda-espalda</text>
          </g>
        );
      }

      // ── Grupo III: Cajón ───────────────────────────────────
      case 'cajón': {
        const h = 44, b = 14, tw = 3, tf = 3;
        const sep = 20;
        const xL = cx - sep / 2;
        const xR = cx + sep / 2;
        const yTop = cy - h / 2;
        const tChapa = 4;
        const bTotal = sep + 2 * tw;
        return (
          <g>
            <line x1={cx} y1={yTop - 8} x2={cx} y2={yTop + h + 8} stroke={axis} strokeWidth="0.6" strokeDasharray="5,3" opacity="0.7" />
            {/* Chapas superior e inferior */}
            <rect x={cx - bTotal / 2 - b} y={yTop - tChapa} width={bTotal + 2 * b} height={tChapa} fill={plate} fillOpacity="0.6" stroke={plate} strokeWidth="1" />
            <rect x={cx - bTotal / 2 - b} y={yTop + h} width={bTotal + 2 * b} height={tChapa} fill={plate} fillOpacity="0.6" stroke={plate} strokeWidth="1" />
            {/* UPN izq */}
            {UPN(xL, yTop, h, b, tw, tf, -1)}
            {/* UPN der */}
            {UPN(xR, yTop, h, b, tw, tf, +1)}
            {/* Sombra interior de la sección cajón */}
            <rect x={xL} y={yTop} width={sep} height={h} fill="none" stroke={plate} strokeWidth="0.5" strokeDasharray="4,3" opacity="0.4" />
            <text x={cx} y={yTop + h + tChapa + 16} textAnchor="middle" fill={dim} fontSize="7" fontFamily="monospace">2×UPN + chapas</text>
          </g>
        );
      }

      // ── Grupo II: Chapas Continuas ─────────────────────────
      case 'chapas_continuas': {
        const h = 44, b = 14, tw = 3, tf = 3;
        const sep = 20;
        const xL = cx - sep / 2;
        const xR = cx + sep / 2;
        const yTop = cy - h / 2;
        const tChapa = 4;
        return (
          <g>
            <line x1={cx} y1={yTop - 8} x2={cx} y2={yTop + h + 8} stroke={axis} strokeWidth="0.6" strokeDasharray="5,3" opacity="0.7" />
            {/* Chapas laterales (cubren los flancos) */}
            <rect x={cx - sep / 2 - b - tChapa} y={yTop} width={tChapa} height={h} fill={plate} fillOpacity="0.65" stroke={plate} strokeWidth="1" />
            <rect x={cx + sep / 2 + b} y={yTop} width={tChapa} height={h} fill={plate} fillOpacity="0.65" stroke={plate} strokeWidth="1" />
            {/* UPN izq */}
            {UPN(xL, yTop, h, b, tw, tf, -1)}
            {/* UPN der */}
            {UPN(xR, yTop, h, b, tw, tf, +1)}
            <text x={cx} y={yTop + h + 16} textAnchor="middle" fill={dim} fontSize="7" fontFamily="monospace">2×UPN + chapas lat.</text>
          </g>
        );
      }

      default:
        return null;
    }
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ background: bg, borderRadius: 6 }}
    >
      {/* Grid sutil */}
      <defs>
        <pattern id={`sgrid-${tipologia}`} width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke={grid} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill={bg} />
      <rect width={width} height={height} fill={`url(#sgrid-${tipologia})`} />
      {renderContent()}
    </svg>
  );
}
