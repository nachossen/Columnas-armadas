// ============================================================
// CATÁLOGO DE PERFILES UPN
// Fuente: EN 10365:2017 / DIN 1026-1:2000 / ArcelorMittal
// ============================================================
// Propiedades:
//   h    = altura total [mm]
//   b    = ancho de ala [mm]
//   tw   = espesor de alma [mm]
//   tf   = espesor de ala [mm]
//   A    = área bruta [cm²]
//   Iy   = inercia eje fuerte y-y [cm⁴]
//   Iz   = inercia eje débil z-z [cm⁴]
//   iy   = radio de giro eje fuerte [cm]
//   iz   = radio de giro eje débil [cm]
//   ys   = distancia centroide → cara exterior del alma [cm]
//   Wel_y = módulo elástico eje fuerte [cm³]
//   Wel_z = módulo elástico eje débil [cm³]
// ============================================================

import type { UPNProfile } from '@/types';

export const UPN_CATALOG: UPNProfile[] = [
  {
    designation: 'UPN 80',
    h: 80, b: 45, tw: 6.0, tf: 8.0,
    A: 11.00,
    Iy: 106.0, Iz: 19.4,
    iy: 3.10, iz: 1.33,
    ys: 1.45,
    Wel_y: 26.5, Wel_z: 6.38,
  },
  {
    designation: 'UPN 100',
    h: 100, b: 50, tw: 6.0, tf: 8.5,
    A: 13.50,
    Iy: 206.0, Iz: 29.3,
    iy: 3.91, iz: 1.47,
    ys: 1.55,
    Wel_y: 41.2, Wel_z: 8.49,
  },
  {
    designation: 'UPN 120',
    h: 120, b: 55, tw: 7.0, tf: 9.0,
    A: 17.00,
    Iy: 364.0, Iz: 43.2,
    iy: 4.62, iz: 1.59,
    ys: 1.60,
    Wel_y: 60.7, Wel_z: 11.1,
  },
  {
    designation: 'UPN 140',
    h: 140, b: 60, tw: 7.0, tf: 10.0,
    A: 20.40,
    Iy: 605.0, Iz: 62.7,
    iy: 5.45, iz: 1.75,
    ys: 1.75,
    Wel_y: 86.4, Wel_z: 14.8,
  },
  {
    designation: 'UPN 160',
    h: 160, b: 65, tw: 7.5, tf: 10.5,
    A: 24.00,
    Iy: 925.0, Iz: 85.3,
    iy: 6.21, iz: 1.89,
    ys: 1.84,
    Wel_y: 116.0, Wel_z: 18.3,
  },
  {
    designation: 'UPN 180',
    h: 180, b: 70, tw: 8.0, tf: 11.0,
    A: 28.00,
    Iy: 1350.0, Iz: 114.0,
    iy: 6.95, iz: 2.02,
    ys: 1.96,
    Wel_y: 150.0, Wel_z: 22.4,
  },
  {
    designation: 'UPN 200',
    h: 200, b: 75, tw: 8.5, tf: 11.5,
    A: 32.20,
    Iy: 1910.0, Iz: 148.0,
    iy: 7.70, iz: 2.14,
    ys: 2.01,
    Wel_y: 191.0, Wel_z: 27.0,
  },
  {
    designation: 'UPN 220',
    h: 220, b: 80, tw: 9.0, tf: 12.5,
    A: 37.40,
    Iy: 2690.0, Iz: 197.0,
    iy: 8.48, iz: 2.30,
    ys: 2.14,
    Wel_y: 245.0, Wel_z: 33.6,
  },
  {
    designation: 'UPN 240',
    h: 240, b: 85, tw: 9.5, tf: 13.0,
    A: 42.30,
    Iy: 3600.0, Iz: 248.0,
    iy: 9.22, iz: 2.42,
    ys: 2.23,
    Wel_y: 300.0, Wel_z: 39.6,
  },
  {
    designation: 'UPN 260',
    h: 260, b: 90, tw: 10.0, tf: 14.0,
    A: 48.30,
    Iy: 4820.0, Iz: 317.0,
    iy: 10.0, iz: 2.56,
    ys: 2.20,
    Wel_y: 371.0, Wel_z: 48.3,
  },
  {
    designation: 'UPN 280',
    h: 280, b: 95, tw: 10.0, tf: 15.0,
    A: 53.30,
    Iy: 6280.0, Iz: 399.0,
    iy: 10.9, iz: 2.74,
    ys: 2.13,
    Wel_y: 448.0, Wel_z: 57.2,
  },
  {
    designation: 'UPN 300',
    h: 300, b: 100, tw: 10.0, tf: 16.0,
    A: 58.80,
    Iy: 8030.0, Iz: 495.0,
    iy: 11.7, iz: 2.91,
    ys: 2.70,
    Wel_y: 535.0, Wel_z: 67.8,
  },
  {
    designation: 'UPN 320',
    h: 320, b: 100, tw: 14.0, tf: 17.5,
    A: 75.80,
    Iy: 10870.0, Iz: 597.0,
    iy: 11.9, iz: 2.80,
    ys: 2.60,
    Wel_y: 679.0, Wel_z: 80.6,
  },
  {
    designation: 'UPN 350',
    h: 350, b: 100, tw: 14.0, tf: 16.0,
    A: 77.30,
    Iy: 12840.0, Iz: 570.0,
    iy: 12.9, iz: 2.72,
    ys: 2.40,
    Wel_y: 734.0, Wel_z: 75.0,
  },
  {
    designation: 'UPN 400',
    h: 400, b: 110, tw: 14.0, tf: 18.0,
    A: 91.50,
    Iy: 20350.0, Iz: 846.0,
    iy: 14.9, iz: 3.04,
    ys: 2.65,
    Wel_y: 1020.0, Wel_z: 102.0,
  },
];

export const getProfileByDesignation = (designation: string): UPNProfile | undefined =>
  UPN_CATALOG.find(p => p.designation === designation);
