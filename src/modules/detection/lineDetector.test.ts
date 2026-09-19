/**
 * Testes unitários da detecção de linhas horizontais.
 *
 * F.I.R.S.T.: rápidos, determinísticos e sem dependência de I/O externo.
 */

import { describe, expect, it } from 'vitest'
import { detectHorizontalLines } from './lineDetector'

/** Cria um ImageData sintético preenchido de branco. */
function createBlankImageData(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4)
  // Preenche todos os pixels com branco opaco (255, 255, 255, 255)
  data.fill(255)
  return {
    width,
    height,
    data,
    colorSpace: 'srgb',
  } as unknown as ImageData
}

describe('detectHorizontalLines', () => {
  it('retorna lista vazia e emite progresso completo em imagem sem linhas', async () => {
    const width = 100
    const height = 50
    const imageData = createBlankImageData(width, height)
    const progressValues: number[] = []

    const candidates = await detectHorizontalLines(
      imageData,
      0,
      { rowsPerChunk: 10 },
      progress => progressValues.push(progress),
    )

    expect(candidates).toEqual([])
    expect(progressValues[0]).toBe(0)
    expect(progressValues.at(-1)).toBe(100)
  })

  it('detecta linha escura contínua e emite progresso de análise', async () => {
    const width = 100
    const height = 40
    const imageData = createBlankImageData(width, height)

    // Desenha uma linha preta na linha Y=20 de X=20 a X=80 (largura 60, ratio 0.6)
    const row = 20
    for (let col = 20; col < 80; col++) {
      const idx = (row * width + col) * 4
      imageData.data[idx] = 0     // R
      imageData.data[idx + 1] = 0 // G
      imageData.data[idx + 2] = 0 // B
      imageData.data[idx + 3] = 255 // A
    }

    const progressValues: number[] = []
    const candidates = await detectHorizontalLines(
      imageData,
      1,
      { minWidthRatio: 0.4, rowsPerChunk: 10 },
      p => progressValues.push(p),
    )

    expect(candidates.length).toBe(1)
    expect(candidates[0].pageIndex).toBe(1)
    expect(candidates[0].position.x).toBeCloseTo(0.2)
    expect(candidates[0].position.width).toBeCloseTo(0.6)
    expect(progressValues.length).toBeGreaterThan(0)
    expect(progressValues.at(-1)).toBe(100)
  })
})
