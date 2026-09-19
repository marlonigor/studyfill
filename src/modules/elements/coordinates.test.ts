/**
 * Testes unitários do módulo de coordenadas.
 *
 * F.I.R.S.T.: rápidos, independentes, sem I/O externo.
 */

import { describe, expect, it } from 'vitest'
import {
  pixelsToRelative,
  relativeToPixels,
  relativeToPdfPoints,
} from './coordinates'

describe('relativeToPixels', () => {
  it('converte posição relativa para pixels corretamente', () => {
    const result = relativeToPixels({ x: 0.25, y: 0.4, width: 0.3, height: 0.05 }, 800, 1000)
    expect(result.x).toBeCloseTo(200)
    expect(result.y).toBeCloseTo(400)
    expect(result.width).toBeCloseTo(240)
    expect(result.height).toBeCloseTo(50)
  })

  it('retorna zero quando pos é 0', () => {
    const result = relativeToPixels({ x: 0, y: 0, width: 0, height: 0 }, 800, 1000)
    expect(result.x).toBe(0)
    expect(result.y).toBe(0)
  })

  it('retorna dimensões completas quando pos é 1', () => {
    const result = relativeToPixels({ x: 0, y: 0, width: 1, height: 1 }, 800, 1000)
    expect(result.width).toBe(800)
    expect(result.height).toBe(1000)
  })
})

describe('pixelsToRelative', () => {
  it('converte pixels para relativo corretamente', () => {
    const result = pixelsToRelative({ x: 200, y: 400, width: 240, height: 50 }, 800, 1000)
    expect(result.x).toBeCloseTo(0.25)
    expect(result.y).toBeCloseTo(0.4)
    expect(result.width).toBeCloseTo(0.3)
    expect(result.height).toBeCloseTo(0.05)
  })

  it('roundtrip: relativo → pixels → relativo deve ser idêntico', () => {
    const original = { x: 0.1, y: 0.2, width: 0.5, height: 0.08 }
    const px = relativeToPixels(original, 600, 800)
    const back = pixelsToRelative(px, 600, 800)
    expect(back.x).toBeCloseTo(original.x)
    expect(back.y).toBeCloseTo(original.y)
    expect(back.width).toBeCloseTo(original.width)
    expect(back.height).toBeCloseTo(original.height)
  })
})

describe('relativeToPdfPoints', () => {
  it('inverte o eixo Y para o sistema pdf-lib (bottom-left)', () => {
    // Elemento no topo da página (y=0, height=0.05) → em pontos PDF deve estar perto do topo
    // pdf-lib: y = pageH - y*pageH - height*pageH
    const pageH = 841 // A4 em pontos
    const result = relativeToPdfPoints({ x: 0, y: 0, width: 1, height: 0.05 }, 595, pageH)
    // y deve ser pageH - 0 - 0.05*pageH = 841 - 42.05 = 798.95
    expect(result.y).toBeCloseTo(pageH - 0.05 * pageH)
  })

  it('calcula x e width em pontos PDF corretamente', () => {
    const result = relativeToPdfPoints({ x: 0.1, y: 0, width: 0.5, height: 0.1 }, 595, 841)
    expect(result.x).toBeCloseTo(59.5)
    expect(result.width).toBeCloseTo(297.5)
  })
})
