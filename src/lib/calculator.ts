// ============================================================
// ORQUESTADOR DE CÁLCULO
// Selecciona la estrategia según la tipología
// ============================================================

import type { ColumnInputs, CalculationResults } from '@/types';
import { BattenedColumnStrategy } from './strategies/BattenedColumnStrategy';
import { LacedColumnStrategy } from './strategies/LacedColumnStrategy';

const strategies = {
  empresillada: new BattenedColumnStrategy(),
  celosia: new LacedColumnStrategy(),
};

export function calculate(inputs: ColumnInputs): CalculationResults {
  const strategy = strategies[inputs.tipologia as keyof typeof strategies];
  if (!strategy) {
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
      steps: [],
      errors: [`Tipología "${inputs.tipologia}" no implementada en esta versión`],
      warnings: [],
      overallResult: false,
    };
  }
  return strategy.calculate(inputs);
}
