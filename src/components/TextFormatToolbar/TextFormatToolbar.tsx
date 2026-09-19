/**
 * TextFormatToolbar: Barra contextual de formatação e controle do Modo de Edição de Texto.
 *
 * Aparece quando o usuário ativa a ferramenta de texto ou seleciona uma caixa de texto.
 * Permite:
 * - Escolher a família da fonte (Inter, Source Serif 4, JetBrains Mono)
 * - Alterar o tamanho da letra (A-, dropdown, A+)
 * - Escolher a cor da escrita (grafite, azul, vermelho, verde)
 * - Desativar o modo de edição a qualquer momento via botão ou atalho (Esc/V)
 *
 * Zero emojis (apenas SVGs e texto limpo).
 */

import styles from './TextFormatToolbar.module.css'

export const FONT_FAMILIES = [
  { id: 'Inter', name: 'Inter (Sans)' },
  { id: 'Source Serif 4', name: 'Source Serif 4 (Serif)' },
  { id: 'JetBrains Mono', name: 'JetBrains Mono (Mono)' },
]

export const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32]

export const FONT_COLORS = [
  { value: '#0f172a', label: 'Grafite' },
  { value: '#2563eb', label: 'Azul caneta' },
  { value: '#dc2626', label: 'Vermelho' },
  { value: '#16a34a', label: 'Verde' },
]

interface TextFormatToolbarProps {
  fontFamily: string
  fontSize: number
  fontColor: string
  hasSelectedBox: boolean
  onChangeFontFamily: (font: string) => void
  onChangeFontSize: (size: number) => void
  onChangeFontColor: (color: string) => void
  onExitEditMode: () => void
}

export function TextFormatToolbar({
  fontFamily,
  fontSize,
  fontColor,
  hasSelectedBox,
  onChangeFontFamily,
  onChangeFontSize,
  onChangeFontColor,
  onExitEditMode,
}: TextFormatToolbarProps) {
  const handleIncreaseSize = () => {
    const currentIndex = FONT_SIZES.indexOf(fontSize)
    if (currentIndex >= 0 && currentIndex < FONT_SIZES.length - 1) {
      onChangeFontSize(FONT_SIZES[currentIndex + 1])
    } else {
      onChangeFontSize(Math.min(48, fontSize + 2))
    }
  }

  const handleDecreaseSize = () => {
    const currentIndex = FONT_SIZES.indexOf(fontSize)
    if (currentIndex > 0) {
      onChangeFontSize(FONT_SIZES[currentIndex - 1])
    } else {
      onChangeFontSize(Math.max(8, fontSize - 2))
    }
  }

  return (
    <div
      className={styles.toolbar}
      role="region"
      aria-label="Barra de formatação do modo de edição de texto"
    >
      {/* Indicador de Status do Modo de Edição */}
      <div className={styles.modeBadge}>
        <div className={styles.modeIcon} aria-hidden="true">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </div>
        <div className={styles.modeText}>
          <span className={styles.modeTitle}>Modo de Edição</span>
          <span className={styles.modeHint}>
            {hasSelectedBox ? 'Editando caixa selecionada' : 'Clique no documento para escrever'}
          </span>
        </div>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      {/* Seletor de Família da Fonte */}
      <div className={styles.controlGroup}>
        <label htmlFor="font-family-select" className={styles.groupLabel}>
          Fonte:
        </label>
        <select
          id="font-family-select"
          className={styles.select}
          value={fontFamily}
          onChange={e => onChangeFontFamily(e.target.value)}
        >
          {FONT_FAMILIES.map(f => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      {/* Seletor de Tamanho da Letra */}
      <div className={styles.controlGroup}>
        <label htmlFor="font-size-select" className={styles.groupLabel}>
          Tamanho:
        </label>
        <div className={styles.sizeButtonGroup}>
          <button
            type="button"
            className={styles.sizeStepBtn}
            onClick={handleDecreaseSize}
            title="Diminuir tamanho da fonte"
            aria-label="Diminuir fonte"
          >
            A−
          </button>

          <select
            id="font-size-select"
            className={styles.sizeSelect}
            value={fontSize}
            onChange={e => onChangeFontSize(Number(e.target.value))}
          >
            {FONT_SIZES.map(s => (
              <option key={s} value={s}>
                {s} px
              </option>
            ))}
          </select>

          <button
            type="button"
            className={styles.sizeStepBtn}
            onClick={handleIncreaseSize}
            title="Aumentar tamanho da fonte"
            aria-label="Aumentar fonte"
          >
            A+
          </button>
        </div>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      {/* Seletor de Cores da Escrita */}
      <div className={styles.controlGroup}>
        <span className={styles.groupLabel}>Cor:</span>
        <div className={styles.colorPalette} role="radiogroup" aria-label="Cor do texto">
          {FONT_COLORS.map(c => (
            <button
              key={c.value}
              type="button"
              className={`${styles.colorChip} ${fontColor === c.value ? styles.colorChipActive : ''}`}
              style={{ backgroundColor: c.value }}
              onClick={() => onChangeFontColor(c.value)}
              title={c.label}
              aria-label={c.label}
              role="radio"
              aria-checked={fontColor === c.value}
            />
          ))}
        </div>
      </div>

      <div className={styles.spacer} />

      {/* Botão de Concluir / Desativar Modo de Edição */}
      <button
        id="btn-exit-text-mode"
        type="button"
        className={styles.exitBtn}
        onClick={onExitEditMode}
        title="Desativar modo de edição (Esc ou V)"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>Concluir Edição</span>
        <kbd className={styles.kbd}>Esc</kbd>
      </button>
    </div>
  )
}
