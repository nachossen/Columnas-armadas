// ============================================================
// ESTRATEGIA: CHAPAS CONTINUAS (COVER PLATE COLUMN)
// Normativa: CIRSOC 301-2018 §E.6.5 / AISC 360-16
// Grupo II — Dos UPN + chapas continuas en los flancos laterales
// ============================================================

import type {
  ColumnInputs,
  CalculationResults,
  SectionProperties,
  SlendernessResults,
  StrengthResults,
  BattenResults,
  BoxResults,
  CalculationStep,
} from '@/types';
import type { IColumnStrategy } from './IColumnStrategy';

const PI = Math.PI;

export class CoverPlateColumnStrategy implements IColumnStrategy {
  readonly tipologia = 'chapas_continuas';
  readonly description = 'Columna con Chapas Continuas — 2×UPN + Chapas Laterales (CIRSOC 301 §E.6.5)';

  calculate(inputs: ColumnInputs): CalculationResults {
    const errors: string[] = [];
    const warnings: string[] = [];
    const steps: CalculationStep[] = [];

    const { profile, L, h_sep, K, Fy, E, Pu, Vu, t_cp } = inputs;

    if (L <= 0) errors.push('Longitud L debe ser mayor que cero');
    if (h_sep <= 0) errors.push('Separación h_sep debe ser mayor que cero');
    if (Fy <= 0) errors.push('Tensión de fluencia Fy debe ser mayor que cero');
    if (!t_cp || t_cp <= 0) errors.push('Espesor de chapas t_cp debe ser mayor que cero');

    if (errors.length > 0) return this._emptyResult(inputs, errors, warnings, steps);

    const tcp = t_cp!;

    // ─── PASO 1: Propiedades de la sección con chapas laterales ──
    // Configuración: 2 UPN enfrentados + 2 chapas LATERALES (en los flancos)
    //
    //   tcp→  ─────────────────
    //          │ UPN   UPN  │
    //         ─────────────────← tcp
    //
    // Las chapas tienen:
    //   alto = profile.h   [mm]  (misma altura que el UPN)
    //   ancho = tcp        [mm]
    //   Una a cada lado (izquierda y derecha)
    //   Centradas en el eje compuesto → distancia = h_sep/2 + profile.b  [mm]
    //
    // Posición centroide de cada chapa respecto al eje y-y compuesto:
    //   d_chapa_y = h_sep/2/10 + profile.b/10 + tcp/10/2  [cm]

    const tcp_cm = tcp / 10;
    const h_cm = profile.h / 10; // altura en cm

    // Área de cada chapa lateral
    const A_chapa_uno = tcp_cm * h_cm; // cm²
    const Ag = 2 * profile.A + 2 * A_chapa_uno; // cm²

    // Distancia del centroide de la chapa lateral al eje y-y compuesto
    const d_chapa_y = (h_sep / 2) / 10 + profile.b / 10 + tcp_cm / 2; // cm

    // Ix (eje fuerte — paralelo a chapas, x-x):
    //   UPN: suma directa Iy_UPN (ejes coincidentes con x-x)
    //   Chapas: centradas simétricamente → I_chapa_propia_x = tcp × h³/12
    const I_chapa_x = tcp_cm * h_cm * h_cm * h_cm / 12; // cm⁴ por chapa
    const Ix_total = 2 * profile.Iy + 2 * I_chapa_x; // cm⁴ (chapas sin Steiner, centroide en eje x)

    // Iy (eje débil — y-y):
    //   UPN: Steiner desde UPN centroid a axis y-y
    const d_UPN = (h_sep / 2) / 10 + profile.ys; // cm
    //   Chapas: propias (h×tcp³/12) + Steiner (d_chapa_y)
    const I_chapa_y_propia = h_cm * tcp_cm * tcp_cm * tcp_cm / 12; // cm⁴ (eje propio de chapa)
    const Iy_total = 2 * (profile.Iz + profile.A * d_UPN * d_UPN)
      + 2 * (I_chapa_y_propia + A_chapa_uno * d_chapa_y * d_chapa_y); // cm⁴

    const rx = Math.sqrt(Ix_total / Ag);
    const ry = Math.sqrt(Iy_total / Ag);
    const r_min = Math.min(rx, ry);
    const h_total = profile.h; // mm (mismo alto que UPN)

    const section: SectionProperties = {
      Ag, Ix_total, Iy_total, rx, ry, r_min, d: d_UPN, h_total,
    };

    steps.push({
      title: '1. Propiedades de la Sección con Chapas Laterales',
      article: 'CIRSOC 301-2018 §E.6.5 / Steiner',
      latex_formula:
        'A_g = 2A_{UPN} + 2\\,t_{cp}\\,h \\qquad I_x = 2I_{y,UPN} + 2\\,\\frac{t_{cp}\\,h^3}{12} \\qquad I_y = 2(I_{z,UPN} + A_{UPN}\\,d^2) + 2(I_{cp,y} + A_{cp}\\,d_{cp}^2)',
      latex_substitution:
        `A_g = 2 \\times ${profile.A.toFixed(2)} + 2 \\times ${tcp_cm.toFixed(2)} \\times ${h_cm.toFixed(2)} = ${Ag.toFixed(2)}\\,\\text{cm}^2 \\quad d_{UPN} = ${d_UPN.toFixed(3)}\\,\\text{cm} \\quad d_{cp} = ${d_chapa_y.toFixed(3)}\\,\\text{cm}`,
      result: `Ag=${Ag.toFixed(2)} cm² | Ix=${Ix_total.toFixed(1)} cm⁴ | Iy=${Iy_total.toFixed(1)} cm⁴ | rx=${rx.toFixed(3)} cm | ry=${ry.toFixed(3)} cm`,
      unit: 'cm², cm⁴, cm',
    });

    // ─── PASO 2: Esbeltez Global ──────────────────────────────
    const L_cm = L * 100;
    const KLr_x = (K * L_cm) / rx;
    const KLr_y = (K * L_cm) / ry;
    const KLr_o = Math.max(KLr_x, KLr_y);

    steps.push({
      title: '2. Esbeltez Global',
      article: 'CIRSOC 301-2018 §E.3',
      latex_formula: '\\left(\\frac{KL}{r}\\right)_o = \\max\\left(\\frac{KL}{r_x}, \\frac{KL}{r_y}\\right)',
      latex_substitution: `\\frac{KL}{r_x} = ${KLr_x.toFixed(2)} \\qquad \\frac{KL}{r_y} = ${KLr_y.toFixed(2)}`,
      result: `(KL/r)_o = ${KLr_o.toFixed(2)} → eje ${KLr_y > KLr_x ? 'y-y' : 'x-x'} gobierna`,
      unit: '',
    });

    // ─── PASO 3: Esbeltez Modificada ─────────────────────────
    // Chapas continuas soldadas: sin penalización (conexión continua)
    const ri = profile.iz;
    const a_ri = 0;
    const KLr_m = KLr_o;
    const limit_4_71 = 4.71 * Math.sqrt(E / Fy);
    const check_individual = true;
    const check_global = KLr_o <= 200;
    const check_modified = KLr_m <= 200;

    steps.push({
      title: '3. Esbeltez de Diseño — Chapas Continuas Soldadas',
      article: 'CIRSOC 301-2018 §E.6.5 — Conexión soldada continua',
      latex_formula: '\\left(\\frac{KL}{r}\\right)_m = \\left(\\frac{KL}{r}\\right)_o',
      latex_substitution: `\\left(\\frac{KL}{r}\\right)_m = ${KLr_m.toFixed(2)}`,
      result: `(KL/r)_m = ${KLr_m.toFixed(2)} | Límite 4.71√(E/Fy) = ${limit_4_71.toFixed(1)}`,
      unit: '',
    });

    const slenderness: SlendernessResults = {
      KLr_x, KLr_y, KLr_o, ri, a_ri, KLr_m,
      limit_4_71, limit_200: 200,
      check_individual, check_global, check_modified,
    };

    // ─── PASO 4–5: Fcr §E.3 ──────────────────────────────────
    const Fe = (PI * PI * E) / (KLr_m * KLr_m);
    let Fcr: number;
    let buckling_mode: 'inelastic' | 'elastic';
    if (KLr_m <= limit_4_71) {
      Fcr = Math.pow(0.658, Fy / Fe) * Fy;
      buckling_mode = 'inelastic';
    } else {
      Fcr = 0.877 * Fe;
      buckling_mode = 'elastic';
    }

    steps.push({
      title: '4. Tensión Elástica de Pandeo',
      article: 'CIRSOC 301-2018 §E.3',
      latex_formula: 'F_e = \\frac{\\pi^2 E}{(KL/r)^2}',
      latex_substitution: `F_e = ${Fe.toFixed(1)}\\,\\text{MPa}`,
      result: `Fe = ${Fe.toFixed(1)} MPa`,
      unit: 'MPa',
    });

    steps.push({
      title: `5. Tensión Crítica — Pandeo ${buckling_mode === 'inelastic' ? 'Inelástico' : 'Elástico'}`,
      article: 'CIRSOC 301-2018 §E.3',
      latex_formula: buckling_mode === 'inelastic' ? 'F_{cr} = 0.658^{F_y/F_e} F_y' : 'F_{cr} = 0.877 F_e',
      latex_substitution: `F_{cr} = ${Fcr.toFixed(2)}\\,\\text{MPa}`,
      result: `Fcr = ${Fcr.toFixed(2)} MPa`,
      unit: 'MPa',
    });

    // ─── PASO 6: Resistencia ──────────────────────────────────
    const Pn = Fcr * Ag * 0.1;
    const phi_c = 0.85;
    const phi_Pn = phi_c * Pn;
    const DCR = Pu / phi_Pn;
    const passes_strength = DCR <= 1.0;

    steps.push({
      title: '6. Resistencia Nominal y de Diseño',
      article: 'CIRSOC 301-2018 §E.3',
      latex_formula: 'P_n = F_{cr}\\,A_g \\qquad \\phi_c P_n = 0.85\\,P_n',
      latex_substitution: `P_n = ${Pn.toFixed(2)}\\,\\text{kN} \\quad \\phi_c P_n = ${phi_Pn.toFixed(2)}\\,\\text{kN}`,
      result: `Pn=${Pn.toFixed(2)} kN | φPn=${phi_Pn.toFixed(2)} kN | DCR=${DCR.toFixed(3)}`,
      unit: 'kN',
      passes: passes_strength,
    });

    steps.push({
      title: '7. Verificación a Compresión (LRFD)',
      article: 'CIRSOC 301-2018 §B.3.3',
      latex_formula: 'P_u \\leq \\phi_c P_n',
      latex_substitution: `${Pu.toFixed(1)} \\leq ${phi_Pn.toFixed(1)} \\qquad \\text{DCR} = ${DCR.toFixed(3)}`,
      result: `DCR = ${DCR.toFixed(3)} → ${passes_strength ? 'CUMPLE' : 'NO CUMPLE'}`,
      unit: '',
      passes: passes_strength,
    });

    const strength: StrengthResults = {
      Fe, Fcr, Pn, phi_Pn, phi_c, DCR, passes: passes_strength, buckling_mode,
    };

    const battens: BattenResults = {
      V_design: 0, h_0: h_sep, Vb: 0, Mb: 0, n_battens: 0, passes: true,
    };

    const box: BoxResults = {
      b_total: h_sep + 2 * profile.b + 2 * tcp,
      A_plates: 2 * A_chapa_uno,
      t_cp: tcp,
      passes: true,
    };

    const overallResult = passes_strength && check_global;

    return { inputs, section, slenderness, strength, battens, box, steps, errors, warnings, overallResult };
  }

  private _emptyResult(inputs: ColumnInputs, errors: string[], warnings: string[], steps: CalculationStep[]): CalculationResults {
    return {
      inputs,
      section: { Ag: 0, Ix_total: 0, Iy_total: 0, rx: 0, ry: 0, r_min: 0, d: 0, h_total: 0 },
      slenderness: { KLr_x: 0, KLr_y: 0, KLr_o: 0, ri: 0, a_ri: 0, KLr_m: 0, limit_4_71: 0, limit_200: 200, check_individual: false, check_global: false, check_modified: false },
      strength: { Fe: 0, Fcr: 0, Pn: 0, phi_Pn: 0, phi_c: 0.85, DCR: 0, passes: false, buckling_mode: 'inelastic' },
      battens: { V_design: 0, h_0: 0, Vb: 0, Mb: 0, n_battens: 0, passes: false },
      steps, errors, warnings, overallResult: false,
    };
  }
}
