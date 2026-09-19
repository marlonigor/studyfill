/**
 * CandidateHighlight: overlay que destaca a área de um candidato de detecção
 * quando o usuário passa o mouse sobre a sugestão no painel.
 *
 * Renderiza um retângulo semitransparente na posição relativa do candidato,
 * convertida para pixels com base nas dimensões do canvas.
 */

import { relativeToPixels } from '../../modules/elements/coordinates'
import type { DetectionCandidate } from '../../types'
import styles from './CandidateHighlight.module.css'

interface CandidateHighlightProps {
  candidate: DetectionCandidate | null
  canvasWidth: number
  canvasHeight: number
}

export function CandidateHighlight({
  candidate,
  canvasWidth,
  canvasHeight,
}: CandidateHighlightProps) {
  if (!candidate) return null

  const px = relativeToPixels(candidate.position, canvasWidth, canvasHeight)

  // Margem vertical extra para tornar o highlight mais visível em linhas finas
  const paddingY = 8
  const highlightHeight = Math.max(px.height, 4) + paddingY * 2

  return (
    <div
      className={styles.overlay}
      style={{ width: canvasWidth, height: canvasHeight }}
    >
      <div
        className={styles.highlight}
        style={{
          left: px.x - 4,
          top: px.y - paddingY,
          width: px.width + 8,
          height: highlightHeight,
        }}
      />
      {/* Linha guia horizontal */}
      <div
        className={styles.guideLine}
        style={{
          top: px.y + px.height / 2,
          left: 0,
          width: canvasWidth,
        }}
      />
    </div>
  )
}
