import { calculate } from '@/lib/calculator'
import type { ColumnInputs } from '@/types'

const baseProfile = {
  designation: 'UPN 200',
  h: 200, b: 75, tw: 8.5, tf: 11.5,
  A: 32.2, Iy: 1910, Iz: 148,
  iy: 7.7, iz: 2.14,
  ys: 2.01,
  Wel_y: 191, Wel_z: 26.4,
}

const baseInputs: ColumnInputs = {
  tipologia: 'empresillada',
  profile: baseProfile,
  L: 5,
  h_sep: 200,
  a: 1000,
  K: 1,
  conexion: 'bulones',
  Fy: 250,
  Fu: 400,
  E: 200000,
  Pu: 500,
  Vu: 0,
  Mu: 0,
}

describe('calculate()', () => {
  it('retorna error para tipología no implementada', () => {
    const result = calculate({ ...baseInputs, tipologia: 'invalida' as never })
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.overallResult).toBe(false)
  })

  it('tipología empresillada devuelve resultado sin errores', () => {
    const result = calculate(baseInputs)
    expect(result.errors).toHaveLength(0)
    expect(result.section.Ag).toBeGreaterThan(0)
  })

  it('tipología celosia devuelve resultado sin errores', () => {
    const result = calculate({
      ...baseInputs,
      tipologia: 'celosia',
      celosia_tipo: 'simple',
      angulo_lacing: {
        designation: 'L 50x50x5',
        a: 50, t: 5,
        A: 4.8, Iy: 11.0, Iz: 11.0,
        iy: 1.51, iz: 0.97, e: 1.37,
      },
    })
    expect(result.errors).toHaveLength(0)
    expect(result.section.Ag).toBeGreaterThan(0)
  })
})
