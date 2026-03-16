// ============================================================
// ESTRATEGIA: PERFILES EN CONTACTO — DOBLE ÁNGULO (2L)
// Normativa: CIRSOC 301-2018 §E.6.1 / AISC 360-16 §E6
// Grupo I — Dos ángulos iguales espalda-espalda (SEAB/LLBB)
// ============================================================

import type {
  ColumnInputs,
  CalculationResults,
  SectionProperties,
  SlendernessResults,
  StrengthResults,
  BattenResults,
  ContactResults,
  CalculationStep,
} from '@/types';
import type { IColumnStrategy } from './IColumnStrategy';

const PI = Math.PI;

export class ContactColumnStrategy implements IColumnStrategy {
  readonly tipologia = 'perfiles_contacto';
  readonly description = 'Doble Ángulo en Contacto (2L) — CIRSOC 301 §E.6.1';

  calculate(inputs: ColumnInputs): CalculationResults {
    const errors: string[] = [];
    const warnings: string[] = [];
    const steps: CalculationStep[] = [];

    const { L, h_sep, a, K, Fy, E, Pu, Vu, conexion, angulo_contacto } = inputs;

    if (L <= 0) errors.push('Longitud L debe ser mayor que cero');
    if (a <= 0) errors.push('Separación entre conectores "a" debe ser mayor que cero');
    if (Fy <= 0) errors.push('Tensión de fluencia Fy debe ser mayor que cero');
    if (!angulo_contacto) errors.push('Debe seleccionar un perfil de ángulo');

    if (errors.length > 0) return this._emptyResult(inputs, errors, warnings, steps);

    const ang = angulo_contacto!;

    // ─── PASO 1: Propiedades de la sección compuesta ─────────
    // 2L espalda-espalda:
    //   Ag = 2 × A_angulo
    //   d  = e_angulo + h_sep/2/10  [cm]
    //        (e = distancia del centroide a la cara exterior/espalda del ángulo)
    //   Ix = 2 × Iy_angulo  (eje paralelo a la espalda — inercia mayor del ángulo)
    //   Iy = 2 × (Iz_angulo + A × d²)  (Steiner — eje perpendicular)

    const Ag = 2 * ang.A; // cm²
    const d = ang.e + (h_sep / 2) / 10; // cm (distancia centroide→eje del conjunto)
    const Ix_total = 2 * ang.Iy; // cm⁴ — eje fuerte del conjunto (paralelo a espaldas)
    const Iy_total = 2 * (ang.Iz + ang.A * d * d); // cm⁴ — eje débil con Steiner
    const rx = Math.sqrt(Ix_total / Ag); // cm
    const ry = Math.sqrt(Iy_total / Ag); // cm
    const r_min = Math.min(rx, ry); // cm
    // h_total: altura del doble ángulo = lado del ángulo (a dimension)
    const h_total = ang.a; // mm

    const section: SectionProperties = {
      Ag, Ix_total, Iy_total, rx, ry, r_min, d, h_total,
    };

    steps.push({
      title: '1. Propiedades de la Sección Compuesta — 2L Espalda a Espalda',
      article: 'CIRSOC 301-2018 §E.6.1 / Steiner',
      latex_formula:
        'A_g = 2 A_{L} \\qquad I_{x} = 2\\,I_{y,L} \\qquad I_{y} = 2\\left(I_{z,L} + A_{L}\\,d^2\\right)',
      latex_substitution:
        `A_g = 2 \\times ${ang.A.toFixed(2)} = ${Ag.toFixed(2)}\\,\\text{cm}^2 \\qquad d = ${ang.e.toFixed(2)} + \\frac{${(h_sep/2).toFixed(1)}}{10} = ${d.toFixed(3)}\\,\\text{cm}`,
      result: `Ag=${Ag.toFixed(2)} cm² | Ix=${Ix_total.toFixed(2)} cm⁴ | Iy=${Iy_total.toFixed(2)} cm⁴ | rx=${rx.toFixed(3)} cm | ry=${ry.toFixed(3)} cm`,
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
      latex_substitution:
        `\\frac{KL}{r_x} = ${KLr_x.toFixed(2)} \\qquad \\frac{KL}{r_y} = ${KLr_y.toFixed(2)}`,
      result: `(KL/r)_o = ${KLr_o.toFixed(2)} → eje ${KLr_y > KLr_x ? 'y-y' : 'x-x'} gobierna`,
      unit: 'adimensional',
    });

    // ─── PASO 3: Esbeltez Individual entre conectores ─────────
    // ri = iz del ángulo (radio de giro mínimo del ángulo individual)
    const ri = ang.iz; // cm
    const a_cm = a / 10; // mm → cm
    const a_ri = a_cm / ri;

    steps.push({
      title: '3. Esbeltez Individual entre Conectores',
      article: 'CIRSOC 301-2018 §E.6.2a',
      latex_formula: '\\frac{a}{r_i} \\leq 0.75\\left(\\frac{KL}{r}\\right)_m',
      latex_substitution:
        `\\frac{a}{r_i} = \\frac{${a}/10}{${ri.toFixed(3)}} = ${a_ri.toFixed(2)}`,
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
      latex_sub_m = `= \\sqrt{${KLr_o.toFixed(2)}^2 + ${a_ri.toFixed(2)}^2} = ${KLr_m.toFixed(2)}`;
    } else {
      const h_0_mod = h_sep + 2 * ang.e * 10; // mm
      const alpha = h_0_mod / (2 * h_sep);
      const coef = 0.82 * (alpha * alpha) / (1 + alpha * alpha);
      KLr_m = Math.sqrt(KLr_o * KLr_o + coef * a_ri * a_ri);
      latex_formula_m =
        '\\left(\\frac{KL}{r}\\right)_m = \\sqrt{\\left(\\frac{KL}{r}\\right)_o^2 + \\frac{0.82\\,\\alpha^2}{1+\\alpha^2}\\left(\\frac{a}{r_i}\\right)^2}';
      latex_sub_m = `\\alpha=${alpha.toFixed(3)} \\quad (KL/r)_m = ${KLr_m.toFixed(2)}`;
    }

    const limit_4_71 = 4.71 * Math.sqrt(E / Fy);
    const check_individual = a_ri <= 0.75 * KLr_m;
    const check_global = KLr_o <= 200;
    const check_modified = KLr_m <= 200;

    if (!check_individual) {
      warnings.push(`a/ri = ${a_ri.toFixed(2)} > 0.75×(KL/r)_m = ${(0.75*KLr_m).toFixed(2)}. Reducir separación entre conectores.`);
    }

    steps.push({
      title: '4. Esbeltez Modificada — Perfiles en Contacto',
      article: 'CIRSOC 301-2018 §E.6 / AISC 360-16 §E6',
      latex_formula: latex_formula_m,
      latex_substitution: latex_sub_m,
      result: `(KL/r)_m = ${KLr_m.toFixed(2)} | 4.71√(E/Fy) = ${limit_4_71.toFixed(1)}`,
      unit: '',
      passes: check_individual,
    });

    steps.push({
      title: '4a. Verificación Esbeltez Individual',
      article: 'CIRSOC 301-2018 §E.6.2a',
      latex_formula: '\\frac{a}{r_i} \\leq 0.75\\left(\\frac{KL}{r}\\right)_m',
      latex_substitution: `${a_ri.toFixed(2)} \\leq 0.75 \\times ${KLr_m.toFixed(2)} = ${(0.75*KLr_m).toFixed(2)}`,
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

    // ─── PASO 5–6: Fcr §E.3 ──────────────────────────────────
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
      title: '5. Tensión Elástica de Pandeo',
      article: 'CIRSOC 301-2018 §E.3',
      latex_formula: 'F_e = \\frac{\\pi^2 E}{(KL/r)_m^2}',
      latex_substitution: `F_e = \\frac{\\pi^2 \\times ${E}}{${KLr_m.toFixed(2)}^2} = ${Fe.toFixed(1)}\\,\\text{MPa}`,
      result: `Fe = ${Fe.toFixed(1)} MPa`,
      unit: 'MPa',
    });

    steps.push({
      title: `6. Tensión Crítica — Pandeo ${buckling_mode === 'inelastic' ? 'Inelástico' : 'Elástico'}`,
      article: `CIRSOC 301-2018 §E.3 [${KLr_m.toFixed(1)} ${buckling_mode === 'inelastic' ? '≤' : '>'} ${limit_4_71.toFixed(1)}]`,
      latex_formula: buckling_mode === 'inelastic'
        ? 'F_{cr} = 0.658^{F_y/F_e} F_y'
        : 'F_{cr} = 0.877 F_e',
      latex_substitution: buckling_mode === 'inelastic'
        ? `F_{cr} = 0.658^{${(Fy/Fe).toFixed(4)}} \\times ${Fy} = ${Fcr.toFixed(2)}\\,\\text{MPa}`
        : `F_{cr} = 0.877 \\times ${Fe.toFixed(1)} = ${Fcr.toFixed(2)}\\,\\text{MPa}`,
      result: `Fcr = ${Fcr.toFixed(2)} MPa`,
      unit: 'MPa',
    });

    // ─── PASO 7: Resistencia ──────────────────────────────────
    const Pn = Fcr * Ag * 0.1;
    const phi_c = 0.85;
    const phi_Pn = phi_c * Pn;
    const DCR = Pu / phi_Pn;
    const passes_strength = DCR <= 1.0;

    steps.push({
      title: '7. Resistencia Nominal a Compresión',
      article: 'CIRSOC 301-2018 §E.3',
      latex_formula: 'P_n = F_{cr}\\,A_g \\qquad \\phi_c P_n = 0.85\\,P_n',
      latex_substitution:
        `P_n = ${Fcr.toFixed(2)} \\times ${Ag.toFixed(2)} \\times 0.1 = ${Pn.toFixed(2)}\\,\\text{kN} \\quad \\phi_c P_n = ${phi_Pn.toFixed(2)}\\,\\text{kN}`,
      result: `Pn=${Pn.toFixed(2)} kN | φPn=${phi_Pn.toFixed(2)} kN | DCR=${DCR.toFixed(3)}`,
      unit: 'kN',
      passes: passes_strength,
    });

    steps.push({
      title: '8. Verificación a Compresión (LRFD)',
      article: 'CIRSOC 301-2018 §B.3.3',
      latex_formula: 'P_u \\leq \\phi_c P_n',
      latex_substitution:
        `${Pu.toFixed(1)} \\leq ${phi_Pn.toFixed(1)} \\qquad \\text{DCR} = ${DCR.toFixed(3)}`,
      result: `DCR = ${DCR.toFixed(3)} → ${passes_strength ? 'CUMPLE' : 'NO CUMPLE'}`,
      unit: '',
      passes: passes_strength,
    });

    const strength: StrengthResults = {
      Fe, Fcr, Pn, phi_Pn, phi_c, DCR, passes: passes_strength, buckling_mode,
    };

    // ─── PASO 8: Diseño de conectores ────────────────────────
    const V_design = Math.max(0.02 * Pu, Vu);
    const h_0 = h_sep + 2 * ang.e * 10; // mm
    const n_connectors = Math.max(1, Math.floor((L * 1000) / a) - 1);

    steps.push({
      title: '9. Corte de Diseño en Conectores',
      article: 'CIRSOC 301-2018 §E.6.2 / AISC 360-16 §E6.2',
      latex_formula: 'V_{diseño} = \\max(0.02\\,P_u,\\,V_u)',
      latex_substitution:
        `V_{diseño} = \\max(0.02 \\times ${Pu.toFixed(1)},\\,${Vu.toFixed(1)}) = ${V_design.toFixed(2)}\\,\\text{kN}`,
      result: `V_diseño=${V_design.toFixed(2)} kN | h_0=${h_0.toFixed(0)} mm | N° conectores intermedios: ${n_connectors}`,
      unit: 'kN, mm',
    });

    const contact: ContactResults = {
      V_design, h_0, n_connectors, passes: true,
    };

    const battens: BattenResults = {
      V_design, h_0, Vb: V_design / 2, Mb: 0, n_battens: n_connectors, passes: true,
    };

    const overallResult = passes_strength && check_individual && check_modified && check_global;

    return {
      inputs, section, slenderness, strength, battens, contact,
      steps, errors, warnings, overallResult,
    };
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
