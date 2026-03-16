'use client';

import { UPN_CATALOG } from '@/data/upn_catalog';
import { ANGULOS_CATALOG } from '@/data/angulos_catalog';
import type { ColumnInputs, TipologiaColumna } from '@/types';

interface SidebarProps {
  inputs: ColumnInputs;
  onChange: (inputs: ColumnInputs) => void;
  onCalculate: () => void;
  onChangeTipologia: () => void;
}

const TIPOLOGIA_LABELS: Record<TipologiaColumna, { label: string; grupo: string; articulo: string }> = {
  empresillada:      { label: 'Empresillada',      grupo: 'Grupo V',   articulo: '§E.6.2' },
  celosia:           { label: 'Celosía',            grupo: 'Grupo IV',  articulo: '§E.6.3' },
  perfiles_contacto: { label: 'En Contacto',        grupo: 'Grupo I',   articulo: '§E.6.1' },
  cajón:             { label: 'Cajón',              grupo: 'Grupo III', articulo: '§E.6.4' },
  chapas_continuas:  { label: 'Chapas Continuas',   grupo: 'Grupo II',  articulo: '§E.6.5' },
};

const K_PRESETS = [
  { value: 0.5, label: '0.5 — Empotrado-Empotrado' },
  { value: 0.7, label: '0.7 — Empotrado-Articulado' },
  { value: 1.0, label: '1.0 — Articulado-Articulado' },
  { value: 1.2, label: '1.2 — Empotrado-Libre (recom.)' },
  { value: 2.0, label: '2.0 — Empotrado-Libre' },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="h-px flex-1 bg-slate-700" />
      <span className="text-xs font-semibold text-blue-400 tracking-widest uppercase">
        {children}
      </span>
      <div className="h-px flex-1 bg-slate-700" />
    </div>
  );
}

function InputRow({ label, unit, children }: { label: string; unit?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 mb-1">
      <label className="text-xs text-slate-400 w-28 shrink-0 leading-tight">{label}</label>
      <div className="flex-1 relative">{children}</div>
      {unit && <span className="text-xs text-slate-500 w-10 text-right mono shrink-0">{unit}</span>}
    </div>
  );
}

export default function Sidebar({ inputs, onChange, onCalculate, onChangeTipologia }: SidebarProps) {
  const selectedProfile = inputs.profile;
  const selectedAngulo = inputs.angulo_lacing ?? inputs.angulo_contacto ?? ANGULOS_CATALOG[9];
  const isCelosia = inputs.tipologia === 'celosia';
  const isContacto = inputs.tipologia === 'perfiles_contacto';
  const isCajon = inputs.tipologia === 'cajón';
  const isChapas = inputs.tipologia === 'chapas_continuas';
  const isAnguloBased = isCelosia || isContacto;
  const hasChapas = isCajon || isChapas;
  // Cajón and chapas: always welded; empresillada/celosía/contacto: user-selectable
  const isWeldedOnly = isCajon || isChapas;

  const tipInfo = TIPOLOGIA_LABELS[inputs.tipologia];

  const set = <K extends keyof ColumnInputs>(key: K, value: ColumnInputs[K]) =>
    onChange({ ...inputs, [key]: value });

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="px-3 py-3 border-b border-slate-800 bg-slate-950">
        <div className="text-xs text-blue-400 font-semibold tracking-wider uppercase">
          CIRSOC 301-2018 / AISC 360-16
        </div>
        <div className="text-sm font-bold text-white mt-0.5">Columnas Armadas</div>
        <div className="text-xs text-slate-500 mono mt-0.5">v1.2 · Sistema completo 5 grupos</div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">

        {/* Tipología activa */}
        <div>
          <SectionLabel>Tipología</SectionLabel>
          <div className="bg-blue-950/50 border border-blue-700 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="text-xs font-bold text-blue-300 mono">{tipInfo.grupo}</span>
                <span className="text-xs text-slate-500 mono ml-1">{tipInfo.articulo}</span>
              </div>
            </div>
            <div className="text-sm font-bold text-white">{tipInfo.label}</div>
            <button
              onClick={onChangeTipologia}
              className="mt-2 w-full text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded px-2 py-1 transition-colors"
            >
              ↩ Cambiar tipología
            </button>
          </div>
        </div>

        {/* Perfil UPN — visible para grupos que usan UPN (todos excepto contacto puro) */}
        {!isContacto && (
          <div>
            <SectionLabel>{isCelosia ? 'Cordones (UPN)' : isWeldedOnly ? 'Perfiles (UPN)' : 'Perfil UPN'}</SectionLabel>
            <InputRow label="Perfil">
              <select
                className="input-blueprint"
                value={selectedProfile.designation}
                onChange={(e) => {
                  const p = UPN_CATALOG.find(p => p.designation === e.target.value);
                  if (p) set('profile', p);
                }}
              >
                {UPN_CATALOG.map((p) => (
                  <option key={p.designation} value={p.designation}>{p.designation}</option>
                ))}
              </select>
            </InputRow>
            <div className="bg-slate-800/50 rounded p-2 mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
              {[
                ['h', `${selectedProfile.h} mm`],
                ['b', `${selectedProfile.b} mm`],
                ['A', `${selectedProfile.A} cm²`],
                ['Iy', `${selectedProfile.Iy} cm⁴`],
                ['Iz', `${selectedProfile.Iz} cm⁴`],
                ['iz', `${selectedProfile.iz} cm`],
                ['ys', `${selectedProfile.ys} cm`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-slate-500 text-xs mono">{k}</span>
                  <span className="text-slate-300 text-xs mono">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Perfil de ángulo — Grupo I (contacto) */}
        {isContacto && (
          <div>
            <SectionLabel>Doble Ángulo (2L)</SectionLabel>
            <InputRow label="Ángulo">
              <select
                className="input-blueprint"
                value={(inputs.angulo_contacto ?? ANGULOS_CATALOG[9]).designation}
                onChange={(e) => {
                  const ang = ANGULOS_CATALOG.find(p => p.designation === e.target.value);
                  if (ang) set('angulo_contacto', ang);
                }}
              >
                {ANGULOS_CATALOG.map((p) => (
                  <option key={p.designation} value={p.designation}>{p.designation}</option>
                ))}
              </select>
            </InputRow>
            <div className="bg-slate-800/50 rounded p-2 mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
              {[
                ['A', `${selectedAngulo.A} cm²`],
                ['Iy', `${selectedAngulo.Iy} cm⁴`],
                ['Iz', `${selectedAngulo.Iz} cm⁴`],
                ['iy', `${selectedAngulo.iy} cm`],
                ['iz (i_min)', `${selectedAngulo.iz} cm`],
                ['e', `${selectedAngulo.e} cm`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-slate-500 text-xs mono">{k}</span>
                  <span className="text-slate-300 text-xs mono">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Barra de Celosía — Grupo IV */}
        {isCelosia && (
          <div>
            <SectionLabel>Barra de Celosía</SectionLabel>
            <InputRow label="Tipo">
              <select
                className="input-blueprint"
                value={inputs.celosia_tipo ?? 'simple'}
                onChange={(e) => set('celosia_tipo', e.target.value as 'simple' | 'doble')}
              >
                <option value="simple">Simple (θ ≥ 60°)</option>
                <option value="doble">Doble / Cruz (θ ≥ 45°)</option>
              </select>
            </InputRow>
            <InputRow label="Ángulo">
              <select
                className="input-blueprint"
                value={(inputs.angulo_lacing ?? ANGULOS_CATALOG[9]).designation}
                onChange={(e) => {
                  const ang = ANGULOS_CATALOG.find(p => p.designation === e.target.value);
                  if (ang) set('angulo_lacing', ang);
                }}
              >
                {ANGULOS_CATALOG.map((p) => (
                  <option key={p.designation} value={p.designation}>{p.designation}</option>
                ))}
              </select>
            </InputRow>
            <div className="bg-slate-800/50 rounded p-2 mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
              {[
                ['A', `${selectedAngulo.A} cm²`],
                ['iz (i_min)', `${selectedAngulo.iz} cm`],
                ['e', `${selectedAngulo.e} cm`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-slate-500 text-xs mono">{k}</span>
                  <span className="text-slate-300 text-xs mono">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chapas — Grupos II y III */}
        {hasChapas && (
          <div>
            <SectionLabel>{isCajon ? 'Chapas de Cubierta' : 'Chapas Continuas'}</SectionLabel>
            <InputRow label="Espesor t_cp" unit="mm">
              <input
                type="number"
                className="input-blueprint"
                value={inputs.t_cp ?? 12}
                min={4}
                step={2}
                onChange={(e) => set('t_cp', parseFloat(e.target.value) || 0)}
              />
            </InputRow>
            <div className="text-xs text-slate-500 mt-1 px-1">
              {isCajon
                ? 'Chapa superior e inferior cerrando la sección cajón'
                : 'Chapas laterales continuas soldadas a las alas del UPN'}
            </div>
          </div>
        )}

        {/* Geometría */}
        <div>
          <SectionLabel>Geometría</SectionLabel>
          <InputRow label="Longitud L" unit="m">
            <input type="number" className="input-blueprint" value={inputs.L}
              min={0.1} step={0.1} onChange={(e) => set('L', parseFloat(e.target.value) || 0)} />
          </InputRow>
          <InputRow label="Sep. back-to-back" unit="mm">
            <input type="number" className="input-blueprint" value={inputs.h_sep}
              min={0} step={10} onChange={(e) => set('h_sep', parseFloat(e.target.value) || 0)} />
          </InputRow>
          {/* Panel/presillas — no aplica para cajón/chapas (continuo) */}
          {!isWeldedOnly && (
            <InputRow label={
              isCelosia ? 'Panel a (celosía)' :
              isContacto ? 'Sep. conectores a' :
              'Sep. presillas a'
            } unit="mm">
              <input type="number" className="input-blueprint" value={inputs.a}
                min={10} step={10} onChange={(e) => set('a', parseFloat(e.target.value) || 0)} />
            </InputRow>
          )}
          <InputRow label="Factor K">
            <select className="input-blueprint" value={inputs.K}
              onChange={(e) => set('K', parseFloat(e.target.value))}>
              {K_PRESETS.map((kp) => (
                <option key={kp.value} value={kp.value}>{kp.label}</option>
              ))}
            </select>
          </InputRow>
          {!isWeldedOnly && (
            <InputRow label="Conexión">
              <select className="input-blueprint" value={inputs.conexion}
                onChange={(e) => set('conexion', e.target.value as ColumnInputs['conexion'])}>
                <option value="bulones">Bulones (snug-tight)</option>
                <option value="soldadura">Soldadura</option>
              </select>
            </InputRow>
          )}
        </div>

        {/* Material */}
        <div>
          <SectionLabel>Material</SectionLabel>
          <InputRow label="Fy" unit="MPa">
            <input type="number" className="input-blueprint" value={inputs.Fy}
              min={100} step={5} onChange={(e) => set('Fy', parseFloat(e.target.value) || 0)} />
          </InputRow>
          <InputRow label="Fu" unit="MPa">
            <input type="number" className="input-blueprint" value={inputs.Fu}
              min={100} step={5} onChange={(e) => set('Fu', parseFloat(e.target.value) || 0)} />
          </InputRow>
          <InputRow label="E" unit="MPa">
            <input type="number" className="input-blueprint mono" value={inputs.E}
              readOnly style={{ color: '#64748b' }} />
          </InputRow>
        </div>

        {/* Cargas */}
        <div>
          <SectionLabel>Cargas (LRFD)</SectionLabel>
          <InputRow label="Pu (axil)" unit="kN">
            <input type="number" className="input-blueprint" value={inputs.Pu}
              min={0} step={10} onChange={(e) => set('Pu', parseFloat(e.target.value) || 0)} />
          </InputRow>
          <InputRow label="Vu (cortante)" unit="kN">
            <input type="number" className="input-blueprint" value={inputs.Vu}
              min={0} step={1} onChange={(e) => set('Vu', parseFloat(e.target.value) || 0)} />
          </InputRow>
          <InputRow label="Mu (momento)" unit="kNm">
            <input type="number" className="input-blueprint" value={inputs.Mu}
              min={0} step={1} onChange={(e) => set('Mu', parseFloat(e.target.value) || 0)} />
          </InputRow>
        </div>
      </div>

      {/* Botón Calcular */}
      <div className="px-3 py-3 border-t border-slate-800 bg-slate-950">
        <button
          onClick={onCalculate}
          className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm tracking-wider uppercase transition-colors"
        >
          ▶ Calcular
        </button>
        <div className="text-xs text-slate-600 text-center mt-1 mono">
          CIRSOC 301-2018 §E.3 + §E.6
        </div>
      </div>
    </aside>
  );
}
