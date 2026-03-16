// ============================================================
// ESTRATEGIA: COLUMNA DE CELOSÍA (LACED COLUMN)
// Normativa: CIRSOC 301-2018 §E.6.3 / AISC 360-16 §E6.3
// Grupo IV — Dos UPN con barras diagonales de ángulo
// ============================================================

import type {
  ColumnInputs,
  CalculationResults,
  SectionProperties,
  SlendernessResults,
  StrengthResults,
  BattenResults,
  LacingResults,
  CalculationStep,
} from '@/types';
import type { IColumnStrategy } from './IColumnStrategy';

const PI = Math.PI;

export class LacedColumnStrategy implements IColumnStrategy {
  readonly tipologia = 'celosia';
  readonly description = 'Columna de Celosía con perfiles UPN y barras de ángulo (CIRSOC 301 §E.6.3)';

  calculate(inputs: ColumnInputs): CalculationResults {
    const errors: string[] = [];
    const warnings: string[] = [];
    const steps: CalculationStep[] = [];

    const { profile, L, h_sep, a, K, Fy, E, Pu, Vu, conexion, celosia_tipo, angulo_lacing } = inputs;

    // ─── Validaciones básicas ────────────────────────────────
    if (L <= 0) errors.push('Longitud L debe ser mayor que cero');
    if (h_sep <= 0) errors.push('Separación h_sep debe ser mayor que cero');
    if (a <= 0) errors.push('Panel "a" debe ser mayor que cero');
    if (Fy <= 0) errors.push('Tensión de fluencia Fy debe ser mayor que cero');
    if (Pu < 0) errors.push('Carga Pu no puede ser negativa');
    if (!angulo_lacing) errors.push('Debe seleccionar un perfil de ángulo para las barras de celosía');

    if (errors.length > 0) {
      return this._emptyResult(inputs, errors, warnings, steps);
    }

    const angulo = angulo_lacing!;
    const tipo = celosia_tipo ?? 'simple';

    // ─── PASO 1: Propiedades de la sección compuesta ─────────
    // Igual que Columna Empresillada:
    //   Ix_comp = 2 × Iy_perfil  (ejes coincidentes — eje paralelo a celosía)
    //   Iy_comp = 2 × (Iz_perfil + A_perfil × d²)  (Steiner — eje de separación)
    //   d = h_sep/2 [mm→cm] + ys [cm]

    const Ag = 2 * profile.A; // cm²
    const Ix_total = 2 * profile.Iy; // cm⁴
    const d = (h_sep / 2) / 10 + profile.ys; // cm
    const Iy_total = 2 * (profile.Iz + profile.A * d * d); // cm⁴
    const rx = Math.sqrt(Ix_total / Ag); // cm
    const ry = Math.sqrt(Iy_total / Ag); // cm
    const r_min = Math.min(rx, ry); // cm
    const h_total = h_sep + 2 * profile.tw; // mm

    const section: SectionProperties = {
      Ag, Ix_total, Iy_total, rx, ry, r_min, d, h_total,
    };

    steps.push({
      title: '1. Propiedades de la Sección Compuesta',
      article: 'CIRSOC 301-2018 §E.6.1 / Steiner',
      latex_formula:
        'A_g = 2 A_{UPN} \\qquad I_{x} = 2\\,I_{y,UPN} \\qquad I_{y} = 2\\left(I_{z,UPN} + A_{UPN}\\,d^2\\right)',
      latex_substitution:
        `A_g = 2 \\times ${profile.A.toFixed(2)} = ${Ag.toFixed(2)}\\,\\text{cm}^2 \\qquad d = \\frac{${(h_sep/2).toFixed(1)}}{10} + ${profile.ys.toFixed(2)} = ${d.toFixed(3)}\\,\\text{cm}`,
      result: `Ag=${Ag.toFixed(2)} cm² | Ix=${Ix_total.toFixed(1)} cm⁴ | Iy=${Iy_total.toFixed(1)} cm⁴ | rx=${rx.toFixed(2)} cm | ry=${ry.toFixed(2)} cm`,
      unit: 'cm², cm⁴, cm',
    });

    // ─── PASO 2: Esbeltez Global ──────────────────────────────
    const L_cm = L * 100; // m → cm
    const KLr_x = (K * L_cm) / rx;
    const KLr_y = (K * L_cm) / ry;
    const KLr_o = Math.max(KLr_x, KLr_y);

    steps.push({
      title: '2. Esbeltez Global',
      article: 'CIRSOC 301-2018 §E.3',
      latex_formula: '\\left(\\frac{KL}{r}\\right)_o = \\max\\left(\\frac{KL}{r_x}, \\frac{KL}{r_y}\\right)',
      latex_substitution:
        `\\frac{KL}{r_x} = \\frac{${K}\\times${(L*100).toFixed(0)}}{${rx.toFixed(2)}} = ${KLr_x.toFixed(2)} \\qquad \\frac{KL}{r_y} = \\frac{${K}\\times${(L*100).toFixed(0)}}{${ry.toFixed(2)}} = ${KLr_y.toFixed(2)}`,
      result: `(KL/r)_o = ${KLr_o.toFixed(2)} → eje ${KLr_y > KLr_x ? 'y-y' : 'x-x'} gobierna`,
      unit: 'adimensional',
    });

    // ─── PASO 3: Esbeltez Individual entre paneles ────────────
    const ri = profile.iz; // cm
    const a_cm = a / 10; // mm → cm
    const a_ri = a_cm / ri;

    steps.push({
      title: '3. Esbeltez Individual entre Paneles de Celosía',
      article: 'CIRSOC 301-2018 §E.6.2a',
      latex_formula: '\\frac{a}{r_i} \\leq 0.75 \\left(\\frac{KL}{r}\\right)_m',
      latex_substitution:
        `\\frac{a}{r_i} = \\frac{${a.toFixed(0)}\\,\\text{mm}/10}{${ri.toFixed(2)}\\,\\text{cm}} = ${a_ri.toFixed(2)}`,
      result: `a/ri = ${a_ri.toFixed(2)}`,
      unit: 'adimensional',
    });

    // ─── PASO 4: Esbeltez Modificada §E.6 ────────────────────
    let KLr_m: number;
    let latex_formula_m: string;
    let latex_sub_m: string;

    if (conexion === 'bulones') {
      KLr_m = Math.sqrt(KLr_o * KLr_o + a_ri * a_ri);
      latex_formula_m =
        '\\left(\\frac{KL}{r}\\right)_m = \\sqrt{\\left(\\frac{KL}{r}\\right)_o^2 + \\left(\\frac{a}{r_i}\\right)^2}';
      latex_sub_m =
        `\\left(\\frac{KL}{r}\\right)_m = \\sqrt{${KLr_o.toFixed(2)}^2 + ${a_ri.toFixed(2)}^2} = \\sqrt{${(KLr_o*KLr_o).toFixed(1)} + ${(a_ri*a_ri).toFixed(1)}} = ${KLr_m.toFixed(2)}`;
    } else {
      const h_0_mod = h_sep + 2 * profile.ys * 10; // mm
      const alpha = h_0_mod / (2 * (h_sep + 2 * profile.tw));
      const coef = 0.82 * (alpha * alpha) / (1 + alpha * alpha);
      KLr_m = Math.sqrt(KLr_o * KLr_o + coef * a_ri * a_ri);
      latex_formula_m =
        '\\left(\\frac{KL}{r}\\right)_m = \\sqrt{\\left(\\frac{KL}{r}\\right)_o^2 + \\frac{0.82\\,\\alpha^2}{1+\\alpha^2}\\left(\\frac{a}{r_{ib}}\\right)^2}';
      latex_sub_m =
        `\\alpha=${alpha.toFixed(3)} \\quad \\text{coef}=${coef.toFixed(4)} \\quad (KL/r)_m = ${KLr_m.toFixed(2)}`;
    }

    const limit_4_71 = 4.71 * Math.sqrt(E / Fy);
    const check_individual = a_ri <= 0.75 * KLr_m;
    const check_global = KLr_o <= 200;
    const check_modified = KLr_m <= 200;

    if (!check_individual) {
      warnings.push(
        `Verificación a/ri: ${a_ri.toFixed(2)} > 0.75×(KL/r)_m=${(0.75*KLr_m).toFixed(2)}. Reducir panel de celosía.`
      );
    }
    if (KLr_m > 200) {
      warnings.push(`Esbeltez modificada ${KLr_m.toFixed(1)} > 200. Sección insuficiente.`);
    }

    steps.push({
      title: '4. Esbeltez Modificada (Columna de Celosía)',
      article: `CIRSOC 301-2018 §E.6 / AISC 360-16 Ec. E6-1${conexion === 'soldadura' ? 'b' : ''}`,
      latex_formula: latex_formula_m,
      latex_substitution: latex_sub_m,
      result: `(KL/r)_m = ${KLr_m.toFixed(2)}  |  Límite 4.71√(E/Fy) = ${limit_4_71.toFixed(1)}`,
      unit: 'adimensional',
      passes: check_individual,
    });

    steps.push({
      title: '4a. Verificación Esbeltez Individual (Requisito §E.6.2a)',
      article: 'CIRSOC 301-2018 §E.6.2a',
      latex_formula: '\\frac{a}{r_i} \\leq 0.75 \\left(\\frac{KL}{r}\\right)_m',
      latex_substitution:
        `${a_ri.toFixed(2)} \\leq 0.75 \\times ${KLr_m.toFixed(2)} = ${(0.75*KLr_m).toFixed(2)}`,
      result: `${a_ri.toFixed(2)} ${check_individual ? '≤' : '>'} ${(0.75*KLr_m).toFixed(2)}`,
      unit: '',
      passes: check_individual,
      warning: !check_individual,
    });

    const slenderness: SlendernessResults = {
      KLr_x, KLr_y, KLr_o, ri, a_ri, KLr_m,
      limit_4_71, limit_200: 200,
      check_individual, check_global, check_modified,
    };

    // ─── PASO 5: Tensión Crítica Fcr (§E.3) — sección compuesta ─
    const Fe = (PI * PI * E) / (KLr_m * KLr_m); // MPa
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
      title: '5. Tensión Elástica de Pandeo de Euler',
      article: 'CIRSOC 301-2018 §E.3',
      latex_formula: 'F_e = \\frac{\\pi^2 E}{\\left(KL/r\\right)_m^2}',
      latex_substitution:
        `F_e = \\frac{\\pi^2 \\times ${E.toLocaleString()}}{${KLr_m.toFixed(2)}^2} = ${Fe.toFixed(1)}\\,\\text{MPa}`,
      result: `Fe = ${Fe.toFixed(1)} MPa`,
      unit: 'MPa',
    });

    if (buckling_mode === 'inelastic') {
      steps.push({
        title: '6. Tensión Crítica — Pandeo Inelástico',
        article: `CIRSOC 301-2018 §E.3 [${KLr_m.toFixed(1)} ≤ 4.71√(E/Fy)=${limit_4_71.toFixed(1)}]`,
        latex_formula: 'F_{cr} = \\left[0.658^{F_y/F_e}\\right] F_y',
        latex_substitution:
          `F_{cr} = 0.658^{${Fy}/${Fe.toFixed(1)}} \\times ${Fy} = ${Fcr.toFixed(2)}\\,\\text{MPa}`,
        result: `Fcr = ${Fcr.toFixed(2)} MPa (Pandeo Inelástico)`,
        unit: 'MPa',
      });
    } else {
      steps.push({
        title: '6. Tensión Crítica — Pandeo Elástico',
        article: `CIRSOC 301-2018 §E.3 [${KLr_m.toFixed(1)} > 4.71√(E/Fy)=${limit_4_71.toFixed(1)}]`,
        latex_formula: 'F_{cr} = 0.877\\,F_e',
        latex_substitution:
          `F_{cr} = 0.877 \\times ${Fe.toFixed(1)} = ${Fcr.toFixed(2)}\\,\\text{MPa}`,
        result: `Fcr = ${Fcr.toFixed(2)} MPa (Pandeo Elástico)`,
        unit: 'MPa',
      });
    }

    // ─── PASO 6: Resistencia Nominal y de Diseño ─────────────
    const Pn = Fcr * Ag * 0.1; // kN  (Fcr[MPa] × Ag[cm²] × 0.1 = kN)
    const phi_c = 0.85;
    const phi_Pn = phi_c * Pn;
    const DCR = Pu / phi_Pn;
    const passes_strength = DCR <= 1.0;

    steps.push({
      title: '7. Resistencia Nominal a Compresión',
      article: 'CIRSOC 301-2018 §E.3',
      latex_formula: 'P_n = F_{cr}\\,A_g \\qquad \\phi_c P_n = 0.85\\,P_n',
      latex_substitution:
        `P_n = ${Fcr.toFixed(2)} \\times ${Ag.toFixed(2)} \\times 0.1 = ${Pn.toFixed(1)}\\,\\text{kN} \\qquad \\phi_c P_n = 0.85 \\times ${Pn.toFixed(1)} = ${phi_Pn.toFixed(1)}\\,\\text{kN}`,
      result: `Pn=${Pn.toFixed(1)} kN | φPn=${phi_Pn.toFixed(1)} kN`,
      unit: 'kN',
    });

    steps.push({
      title: '8. Verificación a Compresión (LRFD)',
      article: 'CIRSOC 301-2018 §B.3.3',
      latex_formula: 'P_u \\leq \\phi_c P_n \\qquad \\text{DCR} = \\frac{P_u}{\\phi_c P_n} \\leq 1.0',
      latex_substitution:
        `${Pu.toFixed(1)}\\,\\text{kN} \\leq ${phi_Pn.toFixed(1)}\\,\\text{kN} \\qquad \\text{DCR} = \\frac{${Pu.toFixed(1)}}{${phi_Pn.toFixed(1)}} = ${DCR.toFixed(3)}`,
      result: `DCR = ${DCR.toFixed(3)} → ${passes_strength ? 'CUMPLE' : 'NO CUMPLE'}`,
      unit: '',
      passes: passes_strength,
    });

    const strength: StrengthResults = {
      Fe, Fcr, Pn, phi_Pn, phi_c, DCR, passes: passes_strength, buckling_mode,
    };

    // ─── PASO 7 (relleno — presillas no aplica para celosía) ──
    // Devolvemos estructura con h_0 para uso en SVG
    const h_0_sv = h_sep + 2 * profile.ys * 10; // mm
    const battens: BattenResults = {
      V_design: 0, h_0: h_0_sv, Vb: 0, Mb: 0, n_battens: 0, passes: true,
    };

    // ─── PASO 8: Geometría de Barras de Celosía ───────────────
    // h_0 = distancia entre líneas de centroide de los cordones (UPN)
    //     = h_sep (back-to-back) + 2 × ys × 10  [mm]
    // θ   = ángulo de inclinación desde horizontal = atan(h_0 / a)
    // l_d = longitud de la barra diagonal = sqrt(a² + h_0²)
    const h_0 = h_sep + 2 * profile.ys * 10; // mm
    const theta = Math.atan2(h_0, a); // rad
    const theta_deg = theta * (180 / PI); // °

    // Verificación de ángulo mínimo (CIRSOC §E.6.3b)
    const theta_min = tipo === 'simple' ? 60 : 45; // °
    if (theta_deg < theta_min) {
      warnings.push(
        `Ángulo de celosía θ=${theta_deg.toFixed(1)}° < ${theta_min}° mínimo para celosía ${tipo}. Reducir panel "a".`
      );
    }

    const l_d = Math.sqrt(a * a + h_0 * h_0); // mm

    steps.push({
      title: '9. Geometría de las Barras de Celosía',
      article: 'CIRSOC 301-2018 §E.6.3b / AISC 360-16 §E6.3b',
      latex_formula:
        'h_0 = h_{sep} + 2\\,y_s \\cdot 10 \\qquad \\theta = \\arctan\\!\\left(\\frac{h_0}{a}\\right) \\qquad l_d = \\sqrt{a^2 + h_0^2}',
      latex_substitution:
        `h_0 = ${h_sep} + 2 \\times ${profile.ys} \\times 10 = ${h_0.toFixed(0)}\\,\\text{mm} \\quad \\theta = ${theta_deg.toFixed(1)}^\\circ \\quad l_d = \\sqrt{${a}^2 + ${h_0.toFixed(0)}^2} = ${l_d.toFixed(1)}\\,\\text{mm}`,
      result: `h_0=${h_0.toFixed(0)} mm | θ=${theta_deg.toFixed(1)}° | l_d=${l_d.toFixed(1)} mm`,
      unit: 'mm, °',
      passes: theta_deg >= theta_min,
      warning: theta_deg < theta_min,
    });

    // ─── PASO 9: Fuerza en Barras de Celosía ─────────────────
    // Corte de diseño = max(2%Pu, Vu)  [AISC §C2.2]
    // Cada plano de celosía (hay 2) toma la mitad del corte
    // La componente diagonal lleva: N_d = (V_design/2) / sin(θ)
    const V_design_lacing = Math.max(0.02 * Pu, Vu); // kN
    const N_d = (V_design_lacing / 2) / Math.sin(theta); // kN

    steps.push({
      title: '10. Fuerza Axial en Barra de Celosía',
      article: 'CIRSOC 301-2018 §E.6.3c / AISC 360-16 §E6.3c',
      latex_formula:
        'V_{diseño} = \\max(0.02\\,P_u,\\,V_u) \\qquad N_d = \\frac{V_{diseño}/2}{\\sin\\theta}',
      latex_substitution:
        `V_{diseño} = \\max(0.02 \\times ${Pu.toFixed(1)},\\,${Vu.toFixed(1)}) = ${V_design_lacing.toFixed(2)}\\,\\text{kN} \\qquad N_d = \\frac{${(V_design_lacing/2).toFixed(3)}}{\\sin(${theta_deg.toFixed(1)}^\\circ)} = \\frac{${(V_design_lacing/2).toFixed(3)}}{${Math.sin(theta).toFixed(4)}} = ${N_d.toFixed(3)}\\,\\text{kN}`,
      result: `N_d = ${N_d.toFixed(3)} kN`,
      unit: 'kN',
    });

    // ─── PASO 10: Esbeltez de Barras de Celosía ──────────────
    // Longitud efectiva:
    //   Celosía simple: KL = l_d  (full length)
    //   Celosía doble: KL = 0.7 × l_d (connected at crossing)
    const KL_lacing = tipo === 'doble' ? 0.7 * l_d : l_d; // mm
    const r_lacing = angulo.iz; // cm
    // KLr_lacing: KL_lacing [mm] / (r_lacing [cm] × 10 [mm/cm]) = dimensionless
    const KLr_lacing = KL_lacing / (r_lacing * 10);
    const limit_lacing = 140;
    const passes_slend = KLr_lacing <= limit_lacing;

    if (!passes_slend) {
      warnings.push(
        `Esbeltez de barra de celosía KL/r=${KLr_lacing.toFixed(1)} > 140. Cambiar a perfil mayor.`
      );
    }

    steps.push({
      title: '11. Esbeltez de la Barra de Celosía',
      article: 'CIRSOC 301-2018 §E.6.3c / AISC 360-16 §E6.3c — l/r ≤ 140',
      latex_formula:
        tipo === 'doble'
          ? '\\frac{KL}{r}_{\\text{barra}} = \\frac{0.7\\,l_d}{r_{\\min}} \\leq 140'
          : '\\frac{KL}{r}_{\\text{barra}} = \\frac{l_d}{r_{\\min}} \\leq 140',
      latex_substitution:
        `\\frac{KL}{r} = \\frac{${KL_lacing.toFixed(1)}\\,\\text{mm}}{${r_lacing.toFixed(3)}\\,\\text{cm} \\times 10} = \\frac{${KL_lacing.toFixed(1)}}{${(r_lacing*10).toFixed(2)}} = ${KLr_lacing.toFixed(2)}`,
      result: `KL/r = ${KLr_lacing.toFixed(2)} ${passes_slend ? '≤' : '>'} 140`,
      unit: 'adimensional',
      passes: passes_slend,
      warning: !passes_slend,
    });

    // ─── PASO 11: Resistencia de Barras de Celosía ───────────
    const Fe_lacing = (PI * PI * E) / (KLr_lacing * KLr_lacing); // MPa
    const limit_lacing_fcr = 4.71 * Math.sqrt(E / Fy);
    let Fcr_lacing: number;
    if (KLr_lacing <= limit_lacing_fcr) {
      Fcr_lacing = Math.pow(0.658, Fy / Fe_lacing) * Fy;
    } else {
      Fcr_lacing = 0.877 * Fe_lacing;
    }
    const Pn_lacing = Fcr_lacing * angulo.A * 0.1; // kN
    const phi_Pn_lacing = 0.85 * Pn_lacing;
    const DCR_lacing = N_d / phi_Pn_lacing;
    const passes_strength_lacing = DCR_lacing <= 1.0;

    steps.push({
      title: '12. Resistencia de la Barra de Celosía',
      article: 'CIRSOC 301-2018 §E.3',
      latex_formula:
        'F_{e,b} = \\frac{\\pi^2 E}{(KL/r)^2} \\qquad P_{n,b} = F_{cr,b}\\,A_b \\qquad \\text{DCR} = \\frac{N_d}{\\phi_c P_{n,b}}',
      latex_substitution:
        `F_{e,b} = ${Fe_lacing.toFixed(1)}\\,\\text{MPa} \\quad F_{cr,b} = ${Fcr_lacing.toFixed(2)}\\,\\text{MPa} \\quad P_{n,b} = ${Fcr_lacing.toFixed(2)} \\times ${angulo.A.toFixed(2)} \\times 0.1 = ${Pn_lacing.toFixed(2)}\\,\\text{kN} \\quad \\phi P_{n,b} = ${phi_Pn_lacing.toFixed(2)}\\,\\text{kN}`,
      result: `DCR = ${N_d.toFixed(3)} / ${phi_Pn_lacing.toFixed(2)} = ${DCR_lacing.toFixed(3)} → ${passes_strength_lacing ? 'CUMPLE' : 'NO CUMPLE'}`,
      unit: '',
      passes: passes_strength_lacing,
    });

    const lacing: LacingResults = {
      h_0,
      theta_deg,
      l_d,
      KL_lacing,
      r_lacing,
      KLr_lacing,
      N_d,
      Fe_lacing,
      Fcr_lacing,
      Pn_lacing,
      phi_Pn_lacing,
      DCR_lacing,
      passes_slenderness: passes_slend,
      passes_strength: passes_strength_lacing,
      passes: passes_slend && passes_strength_lacing,
    };

    const overallResult =
      passes_strength &&
      check_individual &&
      check_modified &&
      check_global &&
      passes_slend &&
      passes_strength_lacing;

    return {
      inputs,
      section,
      slenderness,
      strength,
      battens,
      lacing,
      steps,
      errors,
      warnings,
      overallResult,
    };
  }

  private _emptyResult(
    inputs: ColumnInputs,
    errors: string[],
    warnings: string[],
    steps: CalculationStep[]
  ): CalculationResults {
    return {
      inputs,
      section: { Ag: 0, Ix_total: 0, Iy_total: 0, rx: 0, ry: 0, r_min: 0, d: 0, h_total: 0 },
      slenderness: {
        KLr_x: 0, KLr_y: 0, KLr_o: 0, ri: 0, a_ri: 0, KLr_m: 0,
        limit_4_71: 0, limit_200: 200,
        check_individual: false, check_global: false, check_modified: false,
      },
      strength: { Fe: 0, Fcr: 0, Pn: 0, phi_Pn: 0, phi_c: 0.85, DCR: 0, passes: false, buckling_mode: 'inelastic' },
      battens: { V_design: 0, h_0: 0, Vb: 0, Mb: 0, n_battens: 0, passes: false },
      lacing: undefined,
      steps,
      errors,
      warnings,
      overallResult: false,
    };
  }
}
