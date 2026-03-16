'use client';

import { UPN_CATALOG } from '@/data/upn_catalog';
import type { ColumnInputs } from '@/types';

interface SidebarProps {
  inputs: ColumnInputs;
  onChange: (inputs: ColumnInputs) => void;
  onCalculate: () => void;
}

const TIPOLOGIAS = [
  { id: 'empresillada', label: 'Empresillada (UPN)', active: true },
  { id: 'celosia_simple', label: 'Celosía Simple', active: false },
  { id: 'celosia_doble', label: 'Celosía Doble', active: false },
  { id: 'perfiles_contacto', label: 'Perfiles en Contacto', active: false },
  { id: 'chapas_continuas', label: 'Chapas de Continuidad', active: false },
];

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

function InputRow({
  label,
  unit,
  children,
}: {
  label: string;
  unit?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1 mb-1">
      <label className="text-xs text-slate-400 w-28 shrink-0 leading-tight">{label}</label>
      <div className="flex-1 relative">
        {children}
      </div>
      {unit && (
        <span className="text-xs text-slate-500 w-10 text-right mono shrink-0">{unit}</span>
      )}
    </div>
  );
}

export default function Sidebar({ inputs, onChange, onCalculate }: SidebarProps) {
  const selectedProfile = inputs.profile;

  const set = <K extends keyof ColumnInputs>(key: K, value: ColumnInputs[K]) =>
    onChange({ ...inputs, [key]: value });

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="px-3 py-3 border-b border-slate-800 bg-slate-950">
        <div className="text-xs text-blue-400 font-semibold tracking-wider uppercase">
          CIRSOC 301-2018 / AISC 360-16
        </div>
        <div className="text-sm font-bold text-white mt-0.5">
          Columnas Armadas
        </div>
        <div className="text-xs text-slate-500 mono mt-0.5">v1.0 · Fase 1: Empresilladas</div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">

        {/* Tipología */}
        <div>
          <SectionLabel>Tipología</SectionLabel>
          <div className="space-y-0.5">
            {TIPOLOGIAS.map((t) => (
              <button
                key={t.id}
                disabled={!t.active}
                onClick={() => t.active && set('tipologia', t.id as ColumnInputs['tipologia'])}
                className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                  inputs.tipologia === t.id && t.active
                    ? 'bg-blue-600 text-white'
                    : t.active
                    ? 'text-slate-300 hover:bg-slate-800 cursor-pointer'
                    : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                {inputs.tipologia === t.id && t.active ? '▶ ' : t.active ? '○ ' : '· '}
                {t.label}
                {!t.active && <span className="ml-1 text-slate-700">(próx.)</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Perfil UPN */}
        <div>
          <SectionLabel>Perfil UPN</SectionLabel>
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
                <option key={p.designation} value={p.designation}>
                  {p.designation}
                </option>
              ))}
            </select>
          </InputRow>
          {/* Propiedades del perfil seleccionado */}
          <div className="bg-slate-800/50 rounded p-2 mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
            {[
              ['h', `${selectedProfile.h} mm`],
              ['b', `${selectedProfile.b} mm`],
              ['A', `${selectedProfile.A} cm²`],
              ['Iy', `${selectedProfile.Iy} cm⁴`],
              ['Iz', `${selectedProfile.Iz} cm⁴`],
              ['iy', `${selectedProfile.iy} cm`],
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

        {/* Geometría */}
        <div>
          <SectionLabel>Geometría</SectionLabel>
          <InputRow label="Longitud L" unit="m">
            <input
              type="number"
              className="input-blueprint"
              value={inputs.L}
              min={0.1}
              step={0.1}
              onChange={(e) => set('L', parseFloat(e.target.value) || 0)}
            />
          </InputRow>
          <InputRow label="Sep. back-to-back" unit="mm">
            <input
              type="number"
              className="input-blueprint"
              value={inputs.h_sep}
              min={0}
              step={10}
              onChange={(e) => set('h_sep', parseFloat(e.target.value) || 0)}
            />
          </InputRow>
          <InputRow label="Sep. presillas a" unit="mm">
            <input
              type="number"
              className="input-blueprint"
              value={inputs.a}
              min={10}
              step={10}
              onChange={(e) => set('a', parseFloat(e.target.value) || 0)}
            />
          </InputRow>
          <InputRow label="Factor K">
            <select
              className="input-blueprint"
              value={inputs.K}
              onChange={(e) => set('K', parseFloat(e.target.value))}
            >
              {K_PRESETS.map((kp) => (
                <option key={kp.value} value={kp.value}>
                  {kp.label}
                </option>
              ))}
            </select>
          </InputRow>
          <InputRow label="Conexión">
            <select
              className="input-blueprint"
              value={inputs.conexion}
              onChange={(e) => set('conexion', e.target.value as ColumnInputs['conexion'])}
            >
              <option value="bulones">Bulones (snug-tight)</option>
              <option value="soldadura">Soldadura</option>
            </select>
          </InputRow>
        </div>

        {/* Material */}
        <div>
          <SectionLabel>Material</SectionLabel>
          <InputRow label="Fy" unit="MPa">
            <input
              type="number"
              className="input-blueprint"
              value={inputs.Fy}
              min={100}
              step={5}
              onChange={(e) => set('Fy', parseFloat(e.target.value) || 0)}
            />
          </InputRow>
          <InputRow label="Fu" unit="MPa">
            <input
              type="number"
              className="input-blueprint"
              value={inputs.Fu}
              min={100}
              step={5}
              onChange={(e) => set('Fu', parseFloat(e.target.value) || 0)}
            />
          </InputRow>
          <InputRow label="E" unit="MPa">
            <input
              type="number"
              className="input-blueprint mono"
              value={inputs.E}
              readOnly
              style={{ color: '#64748b' }}
            />
          </InputRow>
        </div>

        {/* Cargas */}
        <div>
          <SectionLabel>Cargas (LRFD)</SectionLabel>
          <InputRow label="Pu (axil)" unit="kN">
            <input
              type="number"
              className="input-blueprint"
              value={inputs.Pu}
              min={0}
              step={10}
              onChange={(e) => set('Pu', parseFloat(e.target.value) || 0)}
            />
          </InputRow>
          <InputRow label="Vu (cortante)" unit="kN">
            <input
              type="number"
              className="input-blueprint"
              value={inputs.Vu}
              min={0}
              step={1}
              onChange={(e) => set('Vu', parseFloat(e.target.value) || 0)}
            />
          </InputRow>
          <InputRow label="Mu (momento)" unit="kNm">
            <input
              type="number"
              className="input-blueprint"
              value={inputs.Mu}
              min={0}
              step={1}
              onChange={(e) => set('Mu', parseFloat(e.target.value) || 0)}
            />
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
