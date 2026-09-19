/**
 * DetectionPanel: painel de revisão de candidatos detectados.
 *
 * ADR-004: nenhuma sugestão é aplicada sem confirmação do usuário.
 * Fluxo: Detectar → lista de candidatos → Aceitar / Rejeitar um a um.
 *
 * Ao passar o mouse sobre uma sugestão, emite onHoverCandidate para que
 * o App exiba um highlight no documento, indicando onde a sugestão se localiza.
 */

import type { DetectionCandidate } from '../../types'
import styles from './DetectionPanel.module.css'

interface DetectionPanelProps {
  candidates: DetectionCandidate[]
  isDetecting: boolean
  detectionProgress?: number
  hasAttempted?: boolean
  onDetect: () => void
  onAccept: (candidate: DetectionCandidate) => void
  onReject: (candidateId: string) => void
  onClose: () => void
  /** Emitido ao entrar/sair de hover numa sugestão. null = nenhum highlight. */
  onHoverCandidate: (candidate: DetectionCandidate | null) => void
}

export function DetectionPanel({
  candidates,
  isDetecting,
  detectionProgress = 0,
  hasAttempted = false,
  onDetect,
  onAccept,
  onReject,
  onClose,
  onHoverCandidate,
}: DetectionPanelProps) {
  const pending = candidates.filter(c => !c.accepted)

  return (
    <div className={styles.panel} role="complementary" aria-label="Painel de detecção de campos">
      <div className={styles.header}>
        <span className={styles.title}>Detectar Campos</span>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar painel">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <p className={styles.description}>
        A detecção busca linhas horizontais que possam ser espaços de preenchimento.
        Você decide o que aceitar. <strong>Passe o mouse</strong> para ver onde está.
      </p>

      <button
        id="btn-detect-fields"
        className={styles.detectBtn}
        onClick={onDetect}
        disabled={isDetecting}
      >
        {isDetecting ? 'Analisando...' : 'Detectar nesta página'}
      </button>

      {isDetecting && (
        <div className={styles.progressContainer} aria-live="polite">
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.max(5, detectionProgress)}%` }}
            />
          </div>
          <span className={styles.progressText}>
            Escaneando linhas: {detectionProgress}%
          </span>
        </div>
      )}

      {hasAttempted && candidates.length === 0 && !isDetecting && (
        <div className={styles.notFoundCard} role="status">
          <p className={styles.notFoundTitle}>Nenhum campo detectado</p>
          <p className={styles.notFoundDesc}>
            Não foram encontradas linhas de preenchimento nesta página.
          </p>
          <p className={styles.notFoundHint}>
            Dica: dê duplo clique no documento para adicionar caixas de texto manualmente.
          </p>
        </div>
      )}

      {!hasAttempted && candidates.length === 0 && !isDetecting && (
        <p className={styles.empty}>Nenhuma detecção feita ainda nesta página.</p>
      )}

      {pending.length === 0 && candidates.length > 0 && (
        <p className={styles.empty}>Todas as sugestões foram revisadas.</p>
      )}

      {pending.length > 0 && !isDetecting && (
        <p className={styles.summaryText}>
          {pending.length} {pending.length === 1 ? 'sugestão encontrada' : 'sugestões encontradas'}:
        </p>
      )}

      <ul className={styles.list}>
        {pending.map((c, i) => (
          <li
            key={c.id}
            className={styles.candidate}
            onMouseEnter={() => onHoverCandidate(c)}
            onMouseLeave={() => onHoverCandidate(null)}
          >
            <span className={styles.candidateLabel}>
              Linha {i + 1} — y: {(c.position.y * 100).toFixed(1)}%
            </span>
            <div className={styles.candidateActions}>
              <button
                id={`btn-accept-candidate-${i}`}
                className={styles.acceptBtn}
                onClick={() => onAccept(c)}
                aria-label={`Aceitar sugestão ${i + 1}`}
              >
                Aceitar
              </button>
              <button
                id={`btn-reject-candidate-${i}`}
                className={styles.rejectBtn}
                onClick={() => onReject(c.id)}
                aria-label={`Rejeitar sugestão ${i + 1}`}
              >
                Rejeitar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
