// ============================================================
// ESTRATEGIA: COLUMNA EMPRESILLADA (BATTENED COLUMN)
// Normativa: CIRSOC 301-2018 §E.6 / AISC 360-16 §E6
// ============================================================

import type {
  ColumnInputs,
  CalculationResults,
  SectionProperties,
  SlendernessResults,
  StrengthResults,
  BattenResults,
  CalculationStep,
} from '@/types';
import type { IColumnStrategy } from './IColumnStrategy';

export class BattenedColumnStrategy implements IColumnStrategy {
  readonly tipologia = 'empresillada';
  readonly description = 'Columna Empresillada con perfiles UPN (CIRSOC 301 §E.6)';

  calculate(inputs: ColumnInputs): CalculationResults {
    const errors: string[] = [];
    const warnings: string[] = [];
    const steps: CalculationStep[] = [];

    const { profile, L, h_sep, a, K, Fy, E, Pu, Vu, conexion } = inputs;

    // ─── Validaciones básicas ────────────────────────────────
    if (L <= 0) errors.push('Longitud L debe ser mayor que cero');
    if (h_sep <= 0) errors.push('Separación h_sep debe ser mayor que cero');
    if (a <= 0) errors.push('Separación entre presillas "a" debe ser mayor que cero');
    if (Fy <= 0) errors.push('Tensión de fluencia Fy debe ser mayor que cero');
    if (Pu < 0) errors.push('Carga Pu no puede ser negativa');

    if (errors.length > 0) {
      return this._emptyResult(inputs, errors, warnings, steps);
    }

    // ─── PASO 1: Propiedades de la sección compuesta ─────────
    // El eje x-x es PARALELO a las presillas (eje fuerte de los UPN individuales)
    // El eje y-y es PERPENDICULAR a las presillas (eje de separación)
    //
    // Para 2 UPN enfrentados (almas separadas):
    //   Ix_comp = 2 × Iy_perfil  (suma directa, ejes coincidentes)
    //   Iy_comp = 2 × (Iz_perfil + A_perfil × d²)  (Steiner)
    //   donde d = h_sep/2 [mm] / 10 [mm/cm] + ys [cm]
    //         (distancia entre centroide del UPN y centroide del conjunto)

    const Ag = 2 * profile.A; // cm²
    const Ix_total = 2 * profile.Iy; // cm⁴
    // d: distancia del centroide de cada UPN al centroide compuesto
    // h_sep es separación back-to-back en mm → h_sep/2 en mm → /10 en cm
    // ys es distancia centroide → cara exterior del alma en cm
    const d = (h_sep / 2) / 10 + profile.ys; // cm
    const Iy_total = 2 * (profile.Iz + profile.A * d * d); // cm⁴ (Steiner)
    const rx = Math.sqrt(Ix_total / Ag); // cm
    const ry = Math.sqrt(Iy_total / Ag); // cm
    const r_min = Math.min(rx, ry); // cm
    const h_total = h_sep + 2 * profile.tw; // mm (altura total incluyendo almas)

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
    const KLr_x = (K * L_cm) / rx; // adimensional
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

    // ─── PASO 3: Esbeltez Individual entre presillas ──────────
    // ri = radio de giro de cada UPN sobre su propio eje paralelo a las presillas
    // Para UPN enfrentados, el eje de las presillas es el eje z-z (débil) del UPN individual
    const ri = profile.iz; // cm
    const a_cm = a / 10; // mm → cm
    const a_ri = a_cm / ri; // adimensional

    steps.push({
      title: '3. Esbeltez Individual entre Presillas',
      article: 'CIRSOC 301-2018 §E.6.2a',
      latex_formula: '\\frac{a}{r_i} \\leq 0.75 \\left(\\frac{KL}{r}\\right)_m',
      latex_substitution:
        `\\frac{a}{r_i} = \\frac{${a.toFixed(0)}\\,\\text{mm}/10}{${ri.toFixed(2)}\\,\\text{cm}} = ${a_ri.toFixed(2)}`,
      result: `a/ri = ${a_ri.toFixed(2)}`,
      unit: 'adimensional',
    });

    // ─── PASO 4: Esbeltez Modificada §E.6 ────────────────────
    // Conexión con bulones (snug-tight): Eq. E6-1
    //   (KL/r)_m = sqrt[(KL/r)_o² + (a/ri)²]
    //
    // Conexión soldada: Eq. E6-2b
    //   (KL/r)_m = sqrt[(KL/r)_o² + (0.82×α²/(1+α²))×(a/r_ib)²]
    //   donde α = h_0 / (2 × h_sep) (razón de separación)
    //         r_ib = iz del perfil (radio de giro individual)

    let KLr_m: number;
    let latex_formula_m: string;
    let latex_sub_m: string;

    if (conexion === 'bulones') {
      // Ecuación E6-1 (AISC) / §E.6 CIRSOC — bullones
      KLr_m = Math.sqrt(KLr_o * KLr_o + a_ri * a_ri);
      latex_formula_m =
        '\\left(\\frac{KL}{r}\\right)_m = \\sqrt{\\left(\\frac{KL}{r}\\right)_o^2 + \\left(\\frac{a}{r_i}\\right)^2}';
      latex_sub_m =
        `\\left(\\frac{KL}{r}\\right)_m = \\sqrt{${KLr_o.toFixed(2)}^2 + ${a_ri.toFixed(2)}^2} = \\sqrt{${(KLr_o*KLr_o).toFixed(1)} + ${(a_ri*a_ri).toFixed(1)}} = ${KLr_m.toFixed(2)}`;
    } else {
      // Ecuación E6-2b (AISC) — soldadura
      const h_0 = h_sep + 2 * profile.ys * 10; // mm — distancia entre centros de conexión
      const alpha = h_0 / (2 * (h_sep + 2 * profile.tw));
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
        `Verificación a/ri: ${a_ri.toFixed(2)} > 0.75×(KL/r)_m=${(0.75*KLr_m).toFixed(2)}. Reducir separación entre presillas.`
      );
    }
    if (KLr_m > 200) {
      warnings.push(`Esbeltez modificada ${KLr_m.toFixed(1)} > 200. Sección insuficiente.`);
    }

    steps.push({
      title: '4. Esbeltez Modificada (Columna Empresillada)',
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

    // ─── PASO 5: Tensión Crítica Fcr (§E.3) ──────────────────
    const Fe = (Math.PI * Math.PI * E) / (KLr_m * KLr_m); // MPa
    let Fcr: number;
    let buckling_mode: 'inelastic' | 'elastic';

    if (KLr_m <= limit_4_71) {
      // Pandeo inelástico
      Fcr = Math.pow(0.658, Fy / Fe) * Fy;
      buckling_mode = 'inelastic';
    } else {
      // Pandeo elástico
      Fcr = 0.877 * Fe;
      buckling_mode = 'elastic';
    }

    steps.push({
      title: '5. Tensión Elástica de Pandeo de Euler',
      article: 'CIRSOC 301-2018 §E.3',
      latex_formula: 'F_e = \\frac{\\pi^2 E}{\\left(KL/r\\right)_m^2}',
      latex_substitution:
        `F_e = \\frac{\\pi^2 \\times ${E.toLocaleString()}}{${KLr_m.toFixed(2)}^2} = \\frac{${(Math.PI*Math.PI*E).toFixed(0)}}{${(KLr_m*KLr_m).toFixed(1)}} = ${Fe.toFixed(1)}\\,\\text{MPa}`,
      result: `Fe = ${Fe.toFixed(1)} MPa`,
      unit: 'MPa',
    });

    if (buckling_mode === 'inelastic') {
      steps.push({
        title: '6. Tensión Crítica — Pandeo Inelástico',
        article: `CIRSOC 301-2018 §E.3 [${KLr_m.toFixed(1)} ≤ 4.71√(E/Fy)=${limit_4_71.toFixed(1)}]`,
        latex_formula: 'F_{cr} = \\left[0.658^{F_y/F_e}\\right] F_y',
        latex_substitution:
          `F_{cr} = 0.658^{${Fy}/${Fe.toFixed(1)}} \\times ${Fy} = 0.658^{${(Fy/Fe).toFixed(4)}} \\times ${Fy} = ${Fcr.toFixed(2)}\\,\\text{MPa}`,
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
    // Pn = Fcr × Ag
    // Ag en cm², Fcr en N/mm² = MPa
    // 1 cm² = 100 mm²  →  Pn [N] = Fcr [N/mm²] × Ag [cm²] × 100 [mm²/cm²]
    // Pn [kN] = Fcr × Ag × 100 / 1000 = Fcr × Ag × 0.1
    const Pn = Fcr * Ag * 0.1; // kN
    const phi_c = 0.85; // CIRSOC 301-2018 usa φc = 0.85
    const phi_Pn = phi_c * Pn; // kN
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

    // ─── PASO 7: Diseño de Presillas (§E.6.2) ─────────────────
    // El corte de diseño es el máximo entre el 2% de Pu y el corte aplicado
    // Ref: AISC 360-16 §C2.2 + §E6.2
    const V_design = Math.max(0.02 * Pu, Vu); // kN
    // h_0 = distancia entre líneas de conexión de las presillas (centros de bulones/soldaduras)
    // = h_sep (back-to-back) + 2 × ys (en mm)
    const h_0 = h_sep + 2 * profile.ys * 10; // mm
    // Corte y momento en cada presilla (2 planos de presillas):
    // Vb = (V_design / 2) × a / h_0  [por presilla, por plano]
    // Mb = (V_design / 2) × a / 2
    const n_planes = 2;
    const Vb = (V_design / n_planes) * (a / h_0); // kN
    const Mb = (V_design / n_planes) * (a / 2) / 1000; // kNm (a en mm → /1000)
    const n_battens = Math.max(0, Math.floor((L * 1000) / a) - 1); // presillas intermedias
    const passes_battens = true; // verificación geométrica (requiere datos de presilla para verificar resistencia)

    steps.push({
      title: '9. Corte de Diseño en Presillas',
      article: 'CIRSOC 301-2018 §E.6.2 / AISC 360-16 §E6.2',
      latex_formula:
        'V_{diseño} = \\max(0.02\\,P_u,\\,V_u) \\qquad V_b = \\frac{V_{diseño}}{2}\\cdot\\frac{a}{h_0} \\qquad M_b = \\frac{V_{diseño}}{2}\\cdot\\frac{a}{2}',
      latex_substitution:
        `V_{diseño} = \\max(0.02 \\times ${Pu.toFixed(1)},\\,${Vu.toFixed(1)}) = ${V_design.toFixed(2)}\\,\\text{kN} \\quad h_0=${h_0.toFixed(0)}\\,\\text{mm} \\quad V_b = \\frac{${V_design.toFixed(2)}}{2}\\cdot\\frac{${a.toFixed(0)}}{${h_0.toFixed(0)}} = ${Vb.toFixed(3)}\\,\\text{kN}`,
      result: `Vb=${Vb.toFixed(3)} kN | Mb=${Mb.toFixed(4)} kNm | N° presillas intermedias: ${n_battens}`,
      unit: 'kN, kNm',
    });

    const battens: BattenResults = {
      V_design, h_0, Vb, Mb, n_battens, passes: passes_battens,
    };

    const overallResult =
      passes_strength && check_individual && check_modified && check_global;

    return {
      inputs,
      section,
      slenderness,
      strength,
      battens,
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
    const empty = <T>(val: T): T => val;
    return {
      inputs,
      section: empty({ Ag: 0, Ix_total: 0, Iy_total: 0, rx: 0, ry: 0, r_min: 0, d: 0, h_total: 0 }),
      slenderness: empty({ KLr_x: 0, KLr_y: 0, KLr_o: 0, ri: 0, a_ri: 0, KLr_m: 0, limit_4_71: 0, limit_200: 200, check_individual: false, check_global: false, check_modified: false }),
      strength: empty({ Fe: 0, Fcr: 0, Pn: 0, phi_Pn: 0, phi_c: 0.85, DCR: 0, passes: false, buckling_mode: 'inelastic' as const }),
      battens: empty({ V_design: 0, h_0: 0, Vb: 0, Mb: 0, n_battens: 0, passes: false }),
      steps,
      errors,
      warnings,
      overallResult: false,
    };
  }
}
