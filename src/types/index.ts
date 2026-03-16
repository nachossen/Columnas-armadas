// ============================================================
// SISTEMA INTEGRAL DE CÁLCULO - COLUMNAS ARMADAS
// Tipos e interfaces - CIRSOC 301-2018 / AISC 360-16
// ============================================================

import type { AnguloProfile } from '@/data/angulos_catalog';
export type { AnguloProfile };

export interface UPNProfile {
  designation: string;  // "UPN 100"
  h: number;            // altura total mm
  b: number;            // ancho de ala mm
  tw: number;           // espesor de alma mm
  tf: number;           // espesor de ala mm
  A: number;            // área de la sección cm²
  Iy: number;           // momento de inercia eje fuerte cm⁴
  Iz: number;           // momento de inercia eje débil cm⁴
  iy: number;           // radio de giro eje fuerte cm
  iz: number;           // radio de giro eje débil cm
  ys: number;           // distancia centroide - cara exterior del alma cm
  Wel_y: number;        // módulo elástico eje fuerte cm³
  Wel_z: number;        // módulo elástico eje débil cm³
}

export type TipologiaColumna =
  | 'empresillada'      // Grupo V - implementada
  | 'celosia'           // Grupo IV - implementada
  | 'perfiles_contacto' // Grupo I - implementada
  | 'cajón'             // Grupo III - implementada
  | 'chapas_continuas'; // Grupo II - implementada

export type TipoConexion = 'bulones' | 'soldadura';

export interface ColumnInputs {
  tipologia: TipologiaColumna;
  profile: UPNProfile;
  L: number;            // longitud de la columna m
  h_sep: number;        // separación entre caras exteriores (back-to-back) mm
  a: number;            // separación entre presillas / panel de celosía / conectores mm
  K: number;            // factor de longitud efectiva
  conexion: TipoConexion;
  Fy: number;           // tensión de fluencia MPa
  Fu: number;           // tensión de rotura MPa
  E: number;            // módulo de elasticidad MPa (200000)
  Pu: number;           // carga axial mayorada kN
  Vu: number;           // corte mayorado kN
  Mu: number;           // momento mayorado kNm
  // Grupo IV — Celosía
  celosia_tipo?: 'simple' | 'doble';
  angulo_lacing?: AnguloProfile;
  // Grupo I — Perfiles en Contacto (doble ángulo)
  angulo_contacto?: AnguloProfile;
  // Grupos II y III — Chapas
  t_cp?: number;        // espesor de chapas de cubierta/continuidad mm
}

export interface SectionProperties {
  Ag: number;           // área bruta total cm²
  Ix_total: number;     // inercia total eje x-x cm⁴
  Iy_total: number;     // inercia total eje y-y cm⁴
  rx: number;           // radio de giro compuesto eje x-x cm
  ry: number;           // radio de giro compuesto eje y-y cm
  r_min: number;        // radio de giro mínimo cm
  d: number;            // distancia centroide individual - centroide compuesto cm
  h_total: number;      // altura total de la sección compuesta mm
}

export interface SlendernessResults {
  KLr_x: number;
  KLr_y: number;
  KLr_o: number;
  ri: number;           // radio de giro individual (iz del perfil)
  a_ri: number;         // esbeltez individual a/ri
  KLr_m: number;        // esbeltez modificada
  limit_4_71: number;
  limit_200: number;
  check_individual: boolean;
  check_global: boolean;
  check_modified: boolean;
}

export interface StrengthResults {
  Fe: number;
  Fcr: number;
  Pn: number;
  phi_Pn: number;
  phi_c: number;
  DCR: number;
  passes: boolean;
  buckling_mode: 'inelastic' | 'elastic';
}

export interface BattenResults {
  V_design: number;
  h_0: number;
  Vb: number;
  Mb: number;
  n_battens: number;
  passes: boolean;
}

export interface LacingResults {
  h_0: number;
  theta_deg: number;
  l_d: number;
  KL_lacing: number;
  r_lacing: number;
  KLr_lacing: number;
  N_d: number;
  Fe_lacing: number;
  Fcr_lacing: number;
  Pn_lacing: number;
  phi_Pn_lacing: number;
  DCR_lacing: number;
  passes_slenderness: boolean;
  passes_strength: boolean;
  passes: boolean;
}

export interface ContactResults {
  V_design: number;
  h_0: number;         // distancia entre centros de conectores mm
  n_connectors: number; // número de juegos de conectores
  passes: boolean;
}

export interface BoxResults {
  b_total: number;     // ancho total del cajón mm
  A_plates: number;    // área total de chapas cm²
  t_cp: number;        // espesor de chapas mm
  passes: boolean;
}

export interface CalculationStep {
  title: string;
  article: string;
  latex_formula: string;
  latex_substitution: string;
  result: string;
  unit: string;
  passes?: boolean;
  warning?: boolean;
}

export interface CalculationResults {
  inputs: ColumnInputs;
  section: SectionProperties;
  slenderness: SlendernessResults;
  strength: StrengthResults;
  battens: BattenResults;
  lacing?: LacingResults;
  contact?: ContactResults;
  box?: BoxResults;
  steps: CalculationStep[];
  errors: string[];
  warnings: string[];
  overallResult: boolean;
}

export interface IColumnStrategy {
  calculate(inputs: ColumnInputs): CalculationResults;
}
