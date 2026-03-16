'use client';

// ============================================================
// PANTALLA DE SELECCIÓN DE TIPOLOGÍA
// Menú principal del sistema — 5 grupos CIRSOC 301-2018
// ============================================================

import SVGSchematic from './SVGSchematic';
import type { TipologiaColumna } from '@/types';

interface TipologiaSelectorProps {
  onSelect: (tipologia: TipologiaColumna) => void;
  currentTipologia?: TipologiaColumna;
}

interface TipologiaCard {
  id: TipologiaColumna;
  grupo: string;
  nombre: string;
  articulo: string;
  descripcion: string;
  perfiles: string;
  active: boolean;
}

const TIPOLOGIAS: TipologiaCard[] = [
  {
    id: 'empresillada',
    grupo: 'Grupo V',
    nombre: 'Empresillada',
    articulo: 'CIRSOC 301-2018 §E.6.2',
    descripcion: 'Dos perfiles UPN enfrentados, unidos por placas de presilla transversales a intervalos regulares.',
    perfiles: '2 × UPN 80–400',
    active: true,
  },
  {
    id: 'celosia',
    grupo: 'Grupo IV',
    nombre: 'Celosía',
    articulo: 'CIRSOC 301-2018 §E.6.3',
    descripcion: 'Dos perfiles UPN conectados por barras diagonales de ángulo (celosía simple o doble).',
    perfiles: '2 × UPN + 2L (barras)',
    active: true,
  },
  {
    id: 'perfiles_contacto',
    grupo: 'Grupo I',
    nombre: 'En Contacto',
    articulo: 'CIRSOC 301-2018 §E.6.1',
    descripcion: 'Dos ángulos iguales espalda-espalda en contacto, conectados por platina intermedia.',
    perfiles: '2L (doble ángulo)',
    active: true,
  },
  {
    id: 'cajón',
    grupo: 'Grupo III',
    nombre: 'Cajón',
    articulo: 'CIRSOC 301-2018 §E.6.4',
    descripcion: 'Dos perfiles UPN con chapas de cubierta superior e inferior formando sección cajón cerrada.',
    perfiles: '2 × UPN + chapas',
    active: true,
  },
  {
    id: 'chapas_continuas',
    grupo: 'Grupo II',
    nombre: 'Chapas Continuas',
    articulo: 'CIRSOC 301-2018 §E.6.5',
    descripcion: 'Dos perfiles UPN separados con chapas continuas en los flancos laterales.',
    perfiles: '2 × UPN + chapas lat.',
    active: true,
  },
];

export default function TipologiaSelector({ onSelect, currentTipologia }: TipologiaSelectorProps) {
  return (
    <div className="min-h-screen bg-slate-950 bg-grid flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-400 font-semibold tracking-widest uppercase">
              CIRSOC 301-2018 / AISC 360-16
            </div>
            <div className="text-2xl font-black text-white mt-0.5">
              Sistema Integral de Cálculo
            </div>
            <div className="text-sm text-slate-400 mt-0.5">
              Columnas Armadas — Verificación LRFD
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-600 mono">v1.1</div>
            <div className="text-xs text-slate-600 mono">φc = 0.85 (CIRSOC)</div>
            <div className="text-xs text-slate-600 mono">E = 200,000 MPa</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="max-w-6xl w-full">
          <h2 className="text-center text-lg font-bold text-slate-300 mb-2">
            Seleccione la tipología de columna a calcular
          </h2>
          <p className="text-center text-xs text-slate-500 mb-10 mono">
            Cada tipología tiene su motor de cálculo, memoria con fórmulas LaTeX y visualización 2D
          </p>

          {/* Cards grid */}
          <div className="grid grid-cols-5 gap-4">
            {TIPOLOGIAS.map((t) => {
              const isSelected = currentTipologia === t.id;
              const isActive = t.active;

              return (
                <button
                  key={t.id}
                  disabled={!isActive}
                  onClick={() => isActive && onSelect(t.id)}
                  className={`
                    relative flex flex-col rounded-lg border-2 overflow-hidden text-left
                    transition-all duration-200
                    ${isSelected
                      ? 'border-blue-400 bg-blue-950/50 shadow-lg shadow-blue-900/50'
                      : isActive
                      ? 'border-slate-700 bg-slate-900 hover:border-blue-500 hover:bg-slate-800 cursor-pointer hover:shadow-lg hover:shadow-blue-900/30'
                      : 'border-slate-800 bg-slate-900/50 cursor-not-allowed opacity-60'
                    }
                  `}
                >
                  {/* Badge estado */}
                  <div className="absolute top-2 right-2 z-10">
                    {isActive ? (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-green-900 text-green-400 border border-green-700 mono">
                        ✓ ACTIVO
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700 mono">
                        PRÓXIMO
                      </span>
                    )}
                  </div>

                  {/* Grupo badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded mono ${
                      isActive ? 'bg-blue-900 text-blue-300 border border-blue-700' : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}>
                      {t.grupo}
                    </span>
                  </div>

                  {/* SVG Schematic */}
                  <div className="flex justify-center pt-8 pb-2 px-3">
                    <SVGSchematic tipologia={t.id} width={150} height={100} active={isActive} />
                  </div>

                  {/* Info */}
                  <div className="px-3 pb-4 flex-1 flex flex-col">
                    <div className="text-sm font-black text-white mb-0.5">{t.nombre}</div>
                    <div className="text-xs text-blue-400 mono mb-2">{t.articulo}</div>
                    <div className="text-xs text-slate-400 leading-relaxed mb-3 flex-1">
                      {t.descripcion}
                    </div>
                    <div className="text-xs text-slate-500 mono border-t border-slate-700/50 pt-2">
                      {t.perfiles}
                    </div>
                  </div>

                  {/* CTA */}
                  {isActive && (
                    <div className={`px-3 pb-3`}>
                      <div className={`w-full py-2 rounded text-xs font-bold text-center tracking-wider uppercase transition-colors ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700 text-slate-300 group-hover:bg-blue-600 group-hover:text-white'
                      }`}>
                        {isSelected ? '▶ Seleccionada' : 'Seleccionar →'}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer info */}
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              ['Normativa', 'CIRSOC 301-2018 / AISC 360-16'],
              ['Método', 'LRFD — φc = 0.85'],
              ['Motor', '§E.3 Fcr + §E.6 esbeltez mod.'],
            ].map(([k, v]) => (
              <div key={k} className="bg-slate-900 border border-slate-800 rounded p-3 text-center">
                <div className="text-xs text-slate-500 uppercase tracking-wider">{k}</div>
                <div className="text-xs text-slate-300 mono mt-1 font-semibold">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
