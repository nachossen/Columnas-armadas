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
  | 'perfiles_contacto' // Grupo I - próxima
  | 'cajón'             // Grupo III - próxima
  | 'chapas_continuas'; // Grupo II - próxima

export type TipoConexion = 'bulones' | 'soldadura';

export interface ColumnInputs {
  tipologia: TipologiaColumna;
  profile: UPNProfile;
  L: number;            // longitud de la columna m
  h_sep: number;        // separación entre caras exteriores de almas (back-to-back) mm
  a: number;            // separación entre presillas / panel de celosía mm
  K: number;            // factor de longitud efectiva
  conexion: TipoConexion;
  Fy: number;           // tensión de fluencia MPa
  Fu: number;           // tensión de rotura MPa
  E: number;            // módulo de elasticidad MPa (200000)
  Pu: number;           // carga axial mayorada kN
  Vu: number;           // corte mayorado kN
  Mu: number;           // momento mayorado kNm
  // Celosía (Grupo IV) — campos opcionales
  celosia_tipo?: 'simple' | 'doble';   // celosía simple o doble
  angulo_lacing?: AnguloProfile;        // perfil de la barra de celosía
}

export interface SectionProperties {
  Ag: number;           // área bruta total cm²
  Ix_total: number;     // inercia total eje x-x cm⁴ (paralelo a presillas)
  Iy_total: number;     // inercia total eje y-y cm⁴ (perpendicular a presillas)
  rx: number;           // radio de giro compuesto eje x-x cm
  ry: number;           // radio de giro compuesto eje y-y cm
  r_min: number;        // radio de giro mínimo cm
  d: number;            // distancia centroide individual - centroide compuesto cm
  h_total: number;      // altura total de la sección compuesta mm
}

export interface SlendernessResults {
  KLr_x: number;        // esbeltez global eje x-x
  KLr_y: number;        // esbeltez global eje y-y
  KLr_o: number;        // esbeltez global gobernante
  ri: number;           // radio de giro individual para presillas cm
  a_ri: number;         // esbeltez individual entre presillas (a/ri)
  KLr_m: number;        // esbeltez modificada CIRSOC §E.6
  limit_4_71: number;   // límite 4.71*sqrt(E/Fy)
  limit_200: number;    // límite máximo de esbeltez
  check_individual: boolean;     // a/ri ≤ 0.75 * KLr_m
  check_global: boolean;         // KLr_o ≤ 200
  check_modified: boolean;       // KLr_m ≤ 200
}

export interface StrengthResults {
  Fe: number;           // tensión crítica de Euler MPa
  Fcr: number;          // tensión crítica de diseño MPa
  Pn: number;           // resistencia nominal kN
  phi_Pn: number;       // resistencia de diseño LRFD kN (φc=0.85 CIRSOC)
  phi_c: number;        // factor de reducción (0.85 per CIRSOC 301)
  DCR: number;          // relación demanda/capacidad
  passes: boolean;
  buckling_mode: 'inelastic' | 'elastic';
}

export interface BattenResults {
  V_design: number;     // corte de diseño kN (max 2%Pu o Vu)
  h_0: number;          // distancia entre líneas de conexión de presillas mm
  Vb: number;           // corte requerido por presilla kN
  Mb: number;           // momento requerido por presilla kNm
  n_battens: number;    // número de presillas intermedias
  passes: boolean;
}

export interface LacingResults {
  h_0: number;             // distancia entre líneas de centroide de cordones mm
  theta_deg: number;       // ángulo de inclinación desde horizontal °
  l_d: number;             // longitud de barra diagonal mm
  KL_lacing: number;       // longitud efectiva de barra mm (l_d simple, 0.7×l_d doble)
  r_lacing: number;        // radio de giro mínimo de la barra cm (iz del ángulo)
  KLr_lacing: number;      // esbeltez de la barra de celosía
  N_d: number;             // fuerza axial de diseño en la barra kN
  Fe_lacing: number;       // tensión de Euler para barra MPa
  Fcr_lacing: number;      // tensión crítica de barra MPa
  Pn_lacing: number;       // resistencia nominal de barra kN
  phi_Pn_lacing: number;   // resistencia de diseño de barra kN (φ=0.85)
  DCR_lacing: number;      // relación demanda/capacidad de barra
  passes_slenderness: boolean; // KLr_lacing ≤ 140
  passes_strength: boolean;
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
  lacing?: LacingResults;   // Grupo IV — celosía
  steps: CalculationStep[];
  errors: string[];
  warnings: string[];
  overallResult: boolean;
}

export interface IColumnStrategy {
  calculate(inputs: ColumnInputs): CalculationResults;
}
