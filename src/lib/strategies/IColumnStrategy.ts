import type { ColumnInputs, CalculationResults } from '@/types';

export interface IColumnStrategy {
  readonly tipologia: string;
  readonly description: string;
  calculate(inputs: ColumnInputs): CalculationResults;
}
