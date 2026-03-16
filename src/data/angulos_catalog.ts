// ============================================================
// CATÁLOGO DE PERFILES ÁNGULO DE ALAS IGUALES
// Fuente: IRAM-IAS U 500-206 / EN 10056-1
// Uso: barras de celosía (Grupo IV), montantes, diagonales
// ============================================================
// Propiedades:
//   a    = lado del ángulo [mm]
//   t    = espesor [mm]
//   A    = área bruta [cm²]
//   Iy   = inercia eje principal mayor [cm⁴]
//   Iz   = inercia eje principal menor [cm⁴]  (= Iy para alas iguales)
//   iy   = radio de giro eje mayor [cm]
//   iz   = radio de giro eje menor [cm]   ← MÍNIMO — el crítico para celosía
//   e    = distancia centroide → cara exterior [cm]
// ============================================================

export interface AnguloProfile {
  designation: string;   // "L 60×60×6"
  a: number;             // lado mm
  t: number;             // espesor mm
  A: number;             // área cm²
  Iy: number;            // inercia eje mayor cm⁴
  Iz: number;            // inercia eje menor cm⁴  (para ángulo igual: Iu, Iv)
  iy: number;            // radio de giro eje mayor cm
  iz: number;            // radio de giro eje menor cm  ← i_min
  e: number;             // dist. centroide → cara exterior cm
}

export const ANGULOS_CATALOG: AnguloProfile[] = [
  // L 30 a L 40
  { designation: 'L 30×30×3',  a: 30,  t: 3,  A: 1.74, Iy: 0.80,  Iz: 0.32,  iy: 0.678, iz: 0.428, e: 0.83 },
  { designation: 'L 30×30×4',  a: 30,  t: 4,  A: 2.27, Iy: 1.01,  Iz: 0.40,  iy: 0.667, iz: 0.420, e: 0.86 },
  { designation: 'L 35×35×4',  a: 35,  t: 4,  A: 2.67, Iy: 1.60,  Iz: 0.63,  iy: 0.775, iz: 0.486, e: 0.99 },
  { designation: 'L 40×40×4',  a: 40,  t: 4,  A: 3.08, Iy: 2.42,  Iz: 0.96,  iy: 0.887, iz: 0.558, e: 1.12 },
  { designation: 'L 40×40×5',  a: 40,  t: 5,  A: 3.79, Iy: 2.91,  Iz: 1.16,  iy: 0.877, iz: 0.552, e: 1.15 },
  // L 45
  { designation: 'L 45×45×4',  a: 45,  t: 4,  A: 3.49, Iy: 3.49,  Iz: 1.39,  iy: 1.00,  iz: 0.631, e: 1.24 },
  { designation: 'L 45×45×5',  a: 45,  t: 5,  A: 4.30, Iy: 4.22,  Iz: 1.68,  iy: 0.991, iz: 0.625, e: 1.27 },
  { designation: 'L 45×45×6',  a: 45,  t: 6,  A: 5.09, Iy: 4.88,  Iz: 1.96,  iy: 0.980, iz: 0.620, e: 1.30 },
  // L 50
  { designation: 'L 50×50×4',  a: 50,  t: 4,  A: 3.90, Iy: 4.80,  Iz: 1.91,  iy: 1.11,  iz: 0.700, e: 1.37 },
  { designation: 'L 50×50×5',  a: 50,  t: 5,  A: 4.80, Iy: 5.82,  Iz: 2.32,  iy: 1.10,  iz: 0.694, e: 1.40 },
  { designation: 'L 50×50×6',  a: 50,  t: 6,  A: 5.69, Iy: 6.76,  Iz: 2.72,  iy: 1.09,  iz: 0.692, e: 1.43 },
  // L 55
  { designation: 'L 55×55×5',  a: 55,  t: 5,  A: 5.32, Iy: 7.85,  Iz: 3.12,  iy: 1.21,  iz: 0.766, e: 1.52 },
  { designation: 'L 55×55×6',  a: 55,  t: 6,  A: 6.31, Iy: 9.15,  Iz: 3.65,  iy: 1.20,  iz: 0.761, e: 1.55 },
  { designation: 'L 55×55×8',  a: 55,  t: 8,  A: 8.22, Iy: 11.5,  Iz: 4.67,  iy: 1.18,  iz: 0.754, e: 1.60 },
  // L 60
  { designation: 'L 60×60×5',  a: 60,  t: 5,  A: 5.82, Iy: 10.2,  Iz: 4.06,  iy: 1.32,  iz: 0.835, e: 1.64 },
  { designation: 'L 60×60×6',  a: 60,  t: 6,  A: 6.91, Iy: 11.9,  Iz: 4.76,  iy: 1.31,  iz: 0.830, e: 1.67 },
  { designation: 'L 60×60×7',  a: 60,  t: 7,  A: 7.97, Iy: 13.5,  Iz: 5.44,  iy: 1.30,  iz: 0.826, e: 1.70 },
  { designation: 'L 60×60×8',  a: 60,  t: 8,  A: 9.03, Iy: 15.0,  Iz: 6.09,  iy: 1.29,  iz: 0.822, e: 1.73 },
  // L 65
  { designation: 'L 65×65×6',  a: 65,  t: 6,  A: 7.51, Iy: 15.2,  Iz: 6.06,  iy: 1.42,  iz: 0.899, e: 1.80 },
  { designation: 'L 65×65×7',  a: 65,  t: 7,  A: 8.69, Iy: 17.3,  Iz: 6.94,  iy: 1.41,  iz: 0.894, e: 1.82 },
  { designation: 'L 65×65×8',  a: 65,  t: 8,  A: 9.83, Iy: 19.3,  Iz: 7.77,  iy: 1.40,  iz: 0.889, e: 1.85 },
  // L 70
  { designation: 'L 70×70×6',  a: 70,  t: 6,  A: 8.13, Iy: 19.0,  Iz: 7.60,  iy: 1.53,  iz: 0.967, e: 1.93 },
  { designation: 'L 70×70×7',  a: 70,  t: 7,  A: 9.40, Iy: 21.7,  Iz: 8.73,  iy: 1.52,  iz: 0.964, e: 1.96 },
  { designation: 'L 70×70×8',  a: 70,  t: 8,  A: 10.6, Iy: 24.2,  Iz: 9.79,  iy: 1.51,  iz: 0.961, e: 1.99 },
  // L 75
  { designation: 'L 75×75×6',  a: 75,  t: 6,  A: 8.73, Iy: 23.5,  Iz: 9.37,  iy: 1.64,  iz: 1.04,  e: 2.06 },
  { designation: 'L 75×75×7',  a: 75,  t: 7,  A: 10.1, Iy: 26.9,  Iz: 10.8,  iy: 1.63,  iz: 1.03,  e: 2.08 },
  { designation: 'L 75×75×8',  a: 75,  t: 8,  A: 11.5, Iy: 30.0,  Iz: 12.1,  iy: 1.62,  iz: 1.02,  e: 2.11 },
  { designation: 'L 75×75×10', a: 75,  t: 10, A: 14.1, Iy: 35.5,  Iz: 14.5,  iy: 1.59,  iz: 1.01,  e: 2.17 },
  // L 80
  { designation: 'L 80×80×6',  a: 80,  t: 6,  A: 9.35, Iy: 28.6,  Iz: 11.4,  iy: 1.75,  iz: 1.10,  e: 2.19 },
  { designation: 'L 80×80×7',  a: 80,  t: 7,  A: 10.9, Iy: 32.8,  Iz: 13.1,  iy: 1.74,  iz: 1.10,  e: 2.21 },
  { designation: 'L 80×80×8',  a: 80,  t: 8,  A: 12.3, Iy: 36.7,  Iz: 14.8,  iy: 1.73,  iz: 1.10,  e: 2.24 },
  { designation: 'L 80×80×10', a: 80,  t: 10, A: 15.1, Iy: 43.8,  Iz: 17.8,  iy: 1.71,  iz: 1.09,  e: 2.30 },
  // L 90
  { designation: 'L 90×90×7',  a: 90,  t: 7,  A: 12.3, Iy: 47.5,  Iz: 19.0,  iy: 1.97,  iz: 1.24,  e: 2.46 },
  { designation: 'L 90×90×8',  a: 90,  t: 8,  A: 13.9, Iy: 53.3,  Iz: 21.4,  iy: 1.96,  iz: 1.24,  e: 2.49 },
  { designation: 'L 90×90×10', a: 90,  t: 10, A: 17.1, Iy: 64.0,  Iz: 25.9,  iy: 1.94,  iz: 1.23,  e: 2.55 },
  { designation: 'L 90×90×12', a: 90,  t: 12, A: 20.3, Iy: 73.8,  Iz: 30.2,  iy: 1.91,  iz: 1.22,  e: 2.60 },
  // L 100
  { designation: 'L 100×100×8', a: 100, t: 8,  A: 15.5, Iy: 73.7,  Iz: 29.5,  iy: 2.18,  iz: 1.38,  e: 2.74 },
  { designation: 'L 100×100×10',a: 100, t: 10, A: 19.2, Iy: 89.9,  Iz: 36.2,  iy: 2.17,  iz: 1.37,  e: 2.80 },
  { designation: 'L 100×100×12',a: 100, t: 12, A: 22.7, Iy: 104.0, Iz: 42.4,  iy: 2.14,  iz: 1.37,  e: 2.86 },
  // L 110
  { designation: 'L 110×110×8', a: 110, t: 8,  A: 17.1, Iy: 98.4,  Iz: 39.3,  iy: 2.40,  iz: 1.52,  e: 3.00 },
  { designation: 'L 110×110×10',a: 110, t: 10, A: 21.2, Iy: 120.0, Iz: 48.3,  iy: 2.38,  iz: 1.51,  e: 3.06 },
  { designation: 'L 110×110×12',a: 110, t: 12, A: 25.2, Iy: 139.0, Iz: 56.7,  iy: 2.35,  iz: 1.50,  e: 3.11 },
  // L 120
  { designation: 'L 120×120×10',a: 120, t: 10, A: 23.2, Iy: 157.0, Iz: 63.1,  iy: 2.60,  iz: 1.65,  e: 3.31 },
  { designation: 'L 120×120×12',a: 120, t: 12, A: 27.5, Iy: 184.0, Iz: 74.3,  iy: 2.59,  iz: 1.64,  e: 3.37 },
  { designation: 'L 120×120×15',a: 120, t: 15, A: 34.1, Iy: 221.0, Iz: 91.0,  iy: 2.55,  iz: 1.63,  e: 3.46 },
];

export const getAnguloByDesignation = (designation: string): AnguloProfile | undefined =>
  ANGULOS_CATALOG.find(p => p.designation === designation);
