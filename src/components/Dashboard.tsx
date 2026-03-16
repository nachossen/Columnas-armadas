'use client';

import type { CalculationResults } from '@/types';
import SVGPlanView from './SVGPlanView';
import SVGLateralView from './SVGLateralView';

interface DashboardProps {
  results: CalculationResults | null;
}

function DCRBar({ value, max = 1.0 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const color =
    value > 1.0 ? '#ef4444' : value > 0.85 ? '#f59e0b' : '#22c55e';
  return (
    <div className="w-full h-2 bg-slate-800 rounded overflow-hidden mt-1">
      <div
        className="h-full rounded transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function Badge({ passes, warning }: { passes?: boolean; warning?: boolean }) {
  if (warning) return <span className="badge-warn">ADVERTENCIA</span>;
  if (passes === undefined) return null;
  return passes ? (
    <span className="badge-pass">✓ CUMPLE</span>
  ) : (
    <span className="badge-fail">✗ NO CUMPLE</span>
  );
}

function VerifCard({
  title,
  subtitle,
  value,
  unit,
  capacity,
  capUnit,
  dcr,
  passes,
  warning,
}: {
  title: string;
  subtitle: string;
  value: string;
  unit: string;
  capacity?: string;
  capUnit?: string;
  dcr?: number;
  passes?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className={`bg-slate-900 border rounded p-3 ${
        passes === false
          ? 'border-red-900'
          : warning
          ? 'border-amber-900'
          : passes === true
          ? 'border-green-900'
          : 'border-slate-800'
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <div>
          <div className="text-xs font-bold text-white">{title}</div>
          <div className="text-xs text-slate-500">{subtitle}</div>
        </div>
        <Badge passes={passes} warning={warning} />
      </div>
      <div className="flex items-baseline gap-1 mt-2">
        <span className="mono text-lg font-bold text-blue-300">{value}</span>
        <span className="text-xs text-slate-500">{unit}</span>
      </div>
      {capacity && (
        <div className="text-xs text-slate-500 mono mt-0.5">
          Cap: {capacity} {capUnit}
        </div>
      )}
      {dcr !== undefined && (
        <>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-slate-500">DCR</span>
            <span
              className="mono text-xs font-bold"
              style={{
                color: dcr > 1 ? '#ef4444' : dcr > 0.85 ? '#f59e0b' : '#22c55e',
              }}
            >
              {dcr.toFixed(3)}
            </span>
          </div>
          <DCRBar value={dcr} />
        </>
      )}
    </div>
  );
}

function PropCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-slate-800/50 rounded px-2 py-1.5 flex justify-between items-center">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="mono text-xs text-slate-200">
        {value} <span className="text-slate-500">{unit}</span>
      </span>
    </div>
  );
}

export default function Dashboard({ results }: DashboardProps) {
  if (!results) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-600 bg-grid h-full">
        <div className="text-center">
          <div className="text-4xl mb-3 opacity-30">⊞</div>
          <div className="text-sm font-semibold text-slate-500">
            Configure los parámetros y presione <span className="text-blue-500">Calcular</span>
          </div>
          <div className="text-xs text-slate-600 mt-1 mono">
            CIRSOC 301-2018 §E.3 + §E.6
          </div>
        </div>
      </div>
    );
  }

  if (results.errors.length > 0) {
    return (
      <div className="flex-1 p-4 bg-grid h-full overflow-y-auto">
        <div className="bg-red-950 border border-red-800 rounded p-4 text-sm text-red-300">
          <div className="font-bold mb-2">⚠ Errores en los datos:</div>
          {results.errors.map((e, i) => (
            <div key={i} className="mono text-xs">• {e}</div>
          ))}
        </div>
      </div>
    );
  }

  const { section, slenderness, strength, battens, lacing, inputs } = results;
  const isCelosia = inputs.tipologia === 'celosia';

  return (
    <div className="flex-1 overflow-y-auto bg-grid p-4 space-y-4">
      {/* Resultado global */}
      <div
        className={`rounded-lg border-2 px-4 py-3 flex items-center justify-between ${
          results.overallResult
            ? 'border-green-700 bg-green-950/40'
            : 'border-red-700 bg-red-950/40'
        }`}
      >
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-widest">Resultado General</div>
          <div className="text-lg font-bold text-white mt-0.5">
            {inputs.profile.designation} · L={inputs.L}m · {inputs.h_sep}mm back-to-back
          </div>
          <div className="text-xs text-slate-500 mono">
            {isCelosia
              ? `Celosía ${inputs.celosia_tipo ?? 'simple'} · ${inputs.angulo_lacing?.designation ?? '—'} · `
              : ''}
            Fy={inputs.Fy}MPa · K={inputs.K} · a={inputs.a}mm ·{' '}
            {inputs.conexion === 'bulones' ? 'Bulones' : 'Soldadura'}
          </div>
        </div>
        <div className="text-2xl font-black tracking-wider">
          {results.overallResult ? (
            <span className="text-green-400">✓ CUMPLE</span>
          ) : (
            <span className="text-red-400">✗ NO CUMPLE</span>
          )}
        </div>
      </div>

      {/* Advertencias */}
      {results.warnings.length > 0 && (
        <div className="bg-amber-950/50 border border-amber-800 rounded p-3 text-xs text-amber-300">
          {results.warnings.map((w, i) => (
            <div key={i} className="mono">⚠ {w}</div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Propiedades de sección */}
        <div className="bg-slate-900 border border-slate-800 rounded p-3 col-span-2">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
            Propiedades de la Sección Compuesta
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            <PropCard label="Ag" value={section.Ag.toFixed(2)} unit="cm²" />
            <PropCard label="Ix" value={section.Ix_total.toFixed(0)} unit="cm⁴" />
            <PropCard label="Iy" value={section.Iy_total.toFixed(0)} unit="cm⁴" />
            <PropCard label="d" value={section.d.toFixed(3)} unit="cm" />
            <PropCard label="rx" value={section.rx.toFixed(3)} unit="cm" />
            <PropCard label="ry" value={section.ry.toFixed(3)} unit="cm" />
            <PropCard label="r_min" value={section.r_min.toFixed(3)} unit="cm" />
            <PropCard label="h_total" value={section.h_total.toFixed(0)} unit="mm" />
          </div>
        </div>

        {/* Verificaciones de esbeltez */}
        <VerifCard
          title="Esbeltez Global"
          subtitle="CIRSOC 301 §E.3"
          value={slenderness.KLr_o.toFixed(2)}
          unit=""
          capacity="200"
          capUnit="(límite)"
          dcr={slenderness.KLr_o / 200}
          passes={slenderness.check_global}
        />
        <VerifCard
          title="Esbeltez Modificada"
          subtitle={`CIRSOC 301 §E.6 — ${isCelosia ? 'Celosía' : 'Empresillada'}`}
          value={slenderness.KLr_m.toFixed(2)}
          unit=""
          capacity={slenderness.limit_4_71.toFixed(1)}
          capUnit="4.71√(E/Fy)"
          dcr={slenderness.KLr_m / slenderness.limit_200}
          passes={slenderness.check_modified}
        />
        <VerifCard
          title="Esbeltez Individual"
          subtitle="a/ri ≤ 0.75·(KL/r)_m"
          value={slenderness.a_ri.toFixed(2)}
          unit=""
          capacity={(0.75 * slenderness.KLr_m).toFixed(2)}
          capUnit="(límite)"
          dcr={slenderness.a_ri / (0.75 * slenderness.KLr_m)}
          passes={slenderness.check_individual}
          warning={!slenderness.check_individual}
        />
        <VerifCard
          title="Verificación Compresión"
          subtitle={`φcPn = 0.85×${strength.Pn.toFixed(1)} kN`}
          value={`${inputs.Pu.toFixed(1)}`}
          unit="kN (Pu)"
          capacity={strength.phi_Pn.toFixed(1)}
          capUnit="kN (φPn)"
          dcr={strength.DCR}
          passes={strength.passes}
        />
        <VerifCard
          title="Tensión Crítica"
          subtitle={`Pandeo ${strength.buckling_mode === 'inelastic' ? 'Inelástico' : 'Elástico'}`}
          value={strength.Fcr.toFixed(2)}
          unit="MPa"
          capacity={inputs.Fy.toString()}
          capUnit="MPa (Fy)"
        />

        {/* Presillas — sólo para empresillada */}
        {!isCelosia && (
          <VerifCard
            title="Corte en Presillas"
            subtitle="Vb por presilla — §E.6.2"
            value={battens.Vb.toFixed(3)}
            unit="kN"
            capacity={battens.Mb.toFixed(4)}
            capUnit="kNm (Mb)"
          />
        )}

        {/* Celosía — tarjetas específicas */}
        {isCelosia && lacing && (
          <>
            <VerifCard
              title="Barra de Celosía — Esbeltez"
              subtitle={`§E.6.3c · KL/r ≤ 140 · ${inputs.angulo_lacing?.designation}`}
              value={lacing.KLr_lacing.toFixed(2)}
              unit=""
              capacity="140"
              capUnit="(límite)"
              dcr={lacing.KLr_lacing / 140}
              passes={lacing.passes_slenderness}
              warning={!lacing.passes_slenderness}
            />
            <VerifCard
              title="Barra de Celosía — Compresión"
              subtitle={`φPn=${lacing.phi_Pn_lacing.toFixed(2)} kN · Nd=${lacing.N_d.toFixed(3)} kN`}
              value={lacing.N_d.toFixed(3)}
              unit="kN (Nd)"
              capacity={lacing.phi_Pn_lacing.toFixed(2)}
              capUnit="kN (φPn)"
              dcr={lacing.DCR_lacing}
              passes={lacing.passes_strength}
            />
          </>
        )}
      </div>

      {/* Detalle de esbelteces */}
      <div className="bg-slate-900 border border-slate-800 rounded p-3">
        <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
          Detalle de Esbelteces
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <PropCard label="KL/rx" value={slenderness.KLr_x.toFixed(2)} unit="" />
          <PropCard label="KL/ry" value={slenderness.KLr_y.toFixed(2)} unit="" />
          <PropCard label="(KL/r)_o" value={slenderness.KLr_o.toFixed(2)} unit="(gobierna)" />
          <PropCard label="ri (iz)" value={slenderness.ri.toFixed(3)} unit="cm" />
          <PropCard label="a/ri" value={slenderness.a_ri.toFixed(2)} unit="" />
          <PropCard label="(KL/r)_m" value={slenderness.KLr_m.toFixed(2)} unit="(modificada)" />
          <PropCard label="4.71√(E/Fy)" value={slenderness.limit_4_71.toFixed(2)} unit="" />
          <PropCard label="Fe" value={strength.Fe.toFixed(2)} unit="MPa" />
          <PropCard label="Fcr" value={strength.Fcr.toFixed(2)} unit="MPa" />
        </div>
      </div>

      {/* Detalles presillas — sólo empresillada */}
      {!isCelosia && (
        <div className="bg-slate-900 border border-slate-800 rounded p-3">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
            Diseño de Presillas
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <PropCard label="V_diseño" value={battens.V_design.toFixed(2)} unit="kN" />
            <PropCard label="h_0" value={battens.h_0.toFixed(0)} unit="mm" />
            <PropCard label="N° presillas" value={battens.n_battens.toString()} unit="intermedias" />
            <PropCard label="Vb" value={battens.Vb.toFixed(4)} unit="kN/presilla" />
            <PropCard label="Mb" value={battens.Mb.toFixed(5)} unit="kNm/presilla" />
          </div>
        </div>
      )}

      {/* Detalles celosía */}
      {isCelosia && lacing && (
        <div className="bg-slate-900 border border-slate-800 rounded p-3">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
            Diseño de Barras de Celosía
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <PropCard label="h_0" value={lacing.h_0.toFixed(0)} unit="mm" />
            <PropCard label="θ" value={lacing.theta_deg.toFixed(1)} unit="°" />
            <PropCard label="l_d" value={lacing.l_d.toFixed(1)} unit="mm" />
            <PropCard label="KL_barra" value={lacing.KL_lacing.toFixed(1)} unit="mm" />
            <PropCard label="r_min (iz)" value={lacing.r_lacing.toFixed(3)} unit="cm" />
            <PropCard label="KL/r barra" value={lacing.KLr_lacing.toFixed(2)} unit="≤ 140" />
            <PropCard label="N_d" value={lacing.N_d.toFixed(3)} unit="kN" />
            <PropCard label="φPn barra" value={lacing.phi_Pn_lacing.toFixed(2)} unit="kN" />
            <PropCard label="DCR barra" value={lacing.DCR_lacing.toFixed(3)} unit="" />
          </div>
        </div>
      )}

      {/* SVG visualizations */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded p-3 flex justify-center">
          <SVGPlanView inputs={inputs} />
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded p-3 flex justify-center">
          <SVGLateralView inputs={inputs} lacing={lacing} />
        </div>
      </div>
    </div>
  );
}
