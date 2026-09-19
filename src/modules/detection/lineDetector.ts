/**
 * Módulo de detecção de campos por heurística (ADR-004).
 *
 * V1: busca linhas horizontais no canvas renderizado que possam representar
 * espaços de preenchimento (linhas tracejadas ou sólidas de largura mínima).
 *
 * A detecção é ASSÍNCRONA e cede ao main thread a cada bloco de linhas,
 * evitando que a UI trave durante a análise (scheduler.yield / setTimeout).
 *
 * A detecção é sempre acionada pelo usuário e retorna CANDIDATOS.
 * Nenhum campo é criado automaticamente.
 */

import type { DetectionCandidate } from '../../types'

/** Parâmetros de limiar da detecção. */
interface DetectionConfig {
  /** Largura mínima em fração da página para considerar uma linha (default 0.3 = 30%). */
  minWidthRatio: number
  /** Tolerância de luminosidade: pixel escuro se < threshold (default 80). */
  darknessThreshold: number
  /** Espessura máxima em pixels de uma linha (default 4). */
  maxLineThickness: number
  /** Quantas linhas processar por fatia antes de ceder ao scheduler (default 80). */
  rowsPerChunk: number
}

const DEFAULT_CONFIG: DetectionConfig = {
  minWidthRatio: 0.3,
  darknessThreshold: 80,
  maxLineThickness: 4,
  rowsPerChunk: 80,
}

/**
 * Cede ao main thread para não bloquear a UI.
 * Usa scheduler.yield quando disponível (Chrome 115+), senão setTimeout 0.
 */
function yieldToMain(): Promise<void> {
  if (typeof scheduler !== 'undefined' && 'yield' in scheduler) {
    // @ts-expect-error — scheduler.yield ainda não tem tipos no TS
    return scheduler.yield()
  }
  return new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * Analisa os dados de imagem de um canvas e retorna candidatos de linha horizontal.
 * É ASSÍNCRONA: cede ao main thread a cada `rowsPerChunk` linhas.
 *
 * @param imageData  - ImageData do canvas renderizado
 * @param pageIndex  - índice da página (0-based)
 * @param config     - parâmetros de detecção (opcional)
 */
export async function detectHorizontalLines(
  imageData: ImageData,
  pageIndex: number,
  config: Partial<DetectionConfig> = {},
): Promise<DetectionCandidate[]> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const { width, height, data } = imageData
  const candidates: DetectionCandidate[] = []
  let idCounter = 0

  // Percorre cada linha de pixels em chunks assíncronos
  for (let row = 0; row < height; row++) {
    // Cede ao main thread a cada N linhas para não travar a UI
    if (row > 0 && row % cfg.rowsPerChunk === 0) {
      await yieldToMain()
    }

    const darkRunLengths = findDarkRuns(data, row, width, cfg.darknessThreshold)

    for (const run of darkRunLengths) {
      const runWidthRatio = run.length / width
      if (runWidthRatio < cfg.minWidthRatio) continue

      const isFineLine = isHorizontalLineThin(data, row, run.startX, run.length, width, height, cfg.maxLineThickness)
      if (!isFineLine) continue

      candidates.push({
        id: `candidate-${pageIndex}-${idCounter++}`,
        pageIndex,
        position: {
          x: run.startX / width,
          y: row / height,
          width: run.length / width,
          height: Math.max(cfg.maxLineThickness / height, 0.01),
        },
      })
    }
  }

  return mergeCandidatesNearby(candidates)
}

/** Percorre uma linha de pixels e encontra corridas de pixels escuros contínuos. */
function findDarkRuns(
  data: Uint8ClampedArray,
  row: number,
  width: number,
  darknessThreshold: number,
): { startX: number; length: number }[] {
  const runs: { startX: number; length: number }[] = []
  let runStart = -1

  for (let col = 0; col < width; col++) {
    const i = (row * width + col) * 4
    const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    const isDark = luminance < darknessThreshold

    if (isDark && runStart === -1) {
      runStart = col
    } else if (!isDark && runStart !== -1) {
      runs.push({ startX: runStart, length: col - runStart })
      runStart = -1
    }
  }
  if (runStart !== -1) {
    runs.push({ startX: runStart, length: width - runStart })
  }
  return runs
}

/** Verifica se a linha de pixels é fina (não um bloco sólido preenchido). */
function isHorizontalLineThin(
  data: Uint8ClampedArray,
  row: number,
  startX: number,
  runLength: number,
  totalWidth: number,
  totalHeight: number,
  maxThickness: number,
): boolean {
  const midCol = startX + Math.floor(runLength / 2)
  let darkAbove = 0
  let darkBelow = 0

  for (let offset = 1; offset <= maxThickness + 2; offset++) {
    if (row - offset >= 0) {
      const iA = ((row - offset) * totalWidth + midCol) * 4
      const lumA = 0.299 * data[iA] + 0.587 * data[iA + 1] + 0.114 * data[iA + 2]
      if (lumA < 80) darkAbove++
    }
    if (row + offset < totalHeight) {
      const iB = ((row + offset) * totalWidth + midCol) * 4
      const lumB = 0.299 * data[iB] + 0.587 * data[iB + 1] + 0.114 * data[iB + 2]
      if (lumB < 80) darkBelow++
    }
  }

  return darkAbove <= maxThickness && darkBelow <= maxThickness
}

/**
 * Mescla candidatos em linhas consecutivas (diferença < 0.5% de y relativo),
 * evitando duplicatas da mesma linha física.
 */
function mergeCandidatesNearby(candidates: DetectionCandidate[]): DetectionCandidate[] {
  if (candidates.length === 0) return []

  const merged: DetectionCandidate[] = [candidates[0]]
  for (let i = 1; i < candidates.length; i++) {
    const prev = merged[merged.length - 1]
    const curr = candidates[i]
    const yDiff = Math.abs(curr.position.y - prev.position.y)
    if (yDiff < 0.005 && curr.pageIndex === prev.pageIndex) {
      if (curr.position.width > prev.position.width) {
        merged[merged.length - 1] = curr
      }
    } else {
      merged.push(curr)
    }
  }
  return merged
}
