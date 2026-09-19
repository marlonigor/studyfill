/**
 * Módulo de coordenadas.
 *
 * ADR-002: a posição dos elementos é armazenada como fração da página (0–1)
 * e convertida para pixels no momento de renderização, com base nas dimensões
 * reais do canvas. Isso garante que o posicionamento é independente do zoom.
 *
 * Exemplo de uso:
 *   const px = relativeToPixels({ x: 0.25, y: 0.4, width: 0.3, height: 0.05 }, 800, 1131)
 *   // => { x: 200, y: 452, width: 240, height: 56 }
 */

import type { RelativePosition } from '../../types'

export interface PixelPosition {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Converte coordenadas relativas (0–1) para pixels,
 * dado o tamanho real do canvas renderizado.
 */
export function relativeToPixels(
  pos: RelativePosition,
  canvasWidth: number,
  canvasHeight: number,
): PixelPosition {
  return {
    x: pos.x * canvasWidth,
    y: pos.y * canvasHeight,
    width: pos.width * canvasWidth,
    height: pos.height * canvasHeight,
  }
}

/**
 * Converte coordenadas em pixels de volta para relativas (0–1),
 * dado o tamanho real do canvas renderizado.
 */
export function pixelsToRelative(
  px: PixelPosition,
  canvasWidth: number,
  canvasHeight: number,
): RelativePosition {
  return {
    x: px.x / canvasWidth,
    y: px.y / canvasHeight,
    width: px.width / canvasWidth,
    height: px.height / canvasHeight,
  }
}

/**
 * Converte coordenadas relativas para pontos PDF absolutos.
 * Usada na exportação (pdf-lib), que trabalha com pontos e eixo Y invertido.
 *
 * @param pos     - posição relativa (0–1)
 * @param pageW   - largura da página em pontos PDF
 * @param pageH   - altura da página em pontos PDF
 */
export function relativeToPdfPoints(
  pos: RelativePosition,
  pageW: number,
  pageH: number,
): PixelPosition {
  // pdf-lib usa eixo Y de baixo para cima (bottom-left origin)
  const y = pageH - pos.y * pageH - pos.height * pageH
  return {
    x: pos.x * pageW,
    y,
    width: pos.width * pageW,
    height: pos.height * pageH,
  }
}
