/**
 * Toolbar: Header e Barra de Ferramentas da Tela 2 (Editor de PDF)
 *
 * Design System: Scholar Script (EstudoPDF)
 *
 * Inclui:
 * - Botão voltar para a lista
 * - Título do arquivo com possibilidade de renomeação rápida
 * - Indicador de salvamento em tempo real (● Salvo)
 * - Ferramentas de estudo (Selecionar 'V', Texto 'T', Detectar 'D')
 * - Controles de página e zoom
 * - Ação primária de Exportar (Ctrl+E)
 */

import { useState } from 'react'
import styles from './Toolbar.module.css'

interface ToolbarProps {
  documentName?: string
  onRenameDocument?: (name: string) => void
  onBack?: () => void
  currentPage: number
  totalPages: number
  zoom: number
  isSaving: boolean
  isExporting: boolean
  hasDocument: boolean
  isTextToolActive?: boolean
  onToggleTextTool?: () => void
  onImport: () => void
  onSave: () => void
  onExport: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onPrevPage: () => void
  onNextPage: () => void
  onOpenDetection: () => void
  detectedCount?: number
}

export function Toolbar({
  documentName = 'Documento sem título',
  onRenameDocument,
  onBack,
  currentPage,
  totalPages,
  zoom,
  isSaving,
  isExporting,
  hasDocument,
  isTextToolActive = false,
  onToggleTextTool,
  onImport,
  onSave,
  onExport,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onPrevPage,
  onNextPage,
  onOpenDetection,
  detectedCount = 0,
}: ToolbarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState(documentName)

  const handleTitleSubmit = () => {
    setIsEditingTitle(false)
    if (tempTitle.trim() && onRenameDocument) {
      onRenameDocument(tempTitle.trim())
    }
  }

  return (
    <header className={styles.toolbar} role="toolbar" aria-label="Barra de ferramentas do EstudoPDF">
      {/* Grupo Esquerdo: Navegação e Identidade do Documento */}
      <div className={styles.leftGroup}>
        {onBack && (
          <button
            id="btn-back-to-list"
            className={styles.backBtn}
            onClick={onBack}
            title="Voltar à lista de documentos"
            aria-label="Voltar para a lista de documentos"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span className={styles.backText}>Voltar</span>
          </button>
        )}

        <div className={styles.brandBadge}>
          <span className={styles.brandLogoText}>EstudoPDF</span>
        </div>

        {hasDocument && (
          <div className={styles.docInfo}>
            {isEditingTitle ? (
              <input
                className={styles.titleInput}
                value={tempTitle}
                onChange={e => setTempTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleTitleSubmit()
                  if (e.key === 'Escape') {
                    setTempTitle(documentName)
                    setIsEditingTitle(false)
                  }
                }}
                autoFocus
              />
            ) : (
              <h2
                className={styles.docTitle}
                onClick={() => {
                  setTempTitle(documentName)
                  setIsEditingTitle(true)
                }}
                title="Clique para renomear"
              >
                {documentName}
              </h2>
            )}

            <div className={styles.saveStatus} title={isSaving ? 'Salvando alterações...' : 'Todas as alterações salvas'}>
              <span
                className={`${styles.statusDot} ${isSaving ? styles.savingDot : styles.savedDot}`}
                aria-hidden="true"
              />
              <span className={styles.statusText}>{isSaving ? 'Salvando...' : 'Salvo'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Grupo Central: Ferramentas de Estudo e Manipulação */}
      {hasDocument && (
        <div className={styles.centerGroup}>
          <div className={styles.toolSegment}>
            <button
              id="btn-tool-select"
              type="button"
              className={`${styles.toolBtn} ${!isTextToolActive ? styles.toolBtnActive : ''}`}
              onClick={() => {
                if (isTextToolActive && onToggleTextTool) onToggleTextTool()
              }}
              title="Modo Seleção (V)"
              aria-label="Modo Seleção"
              aria-pressed={!isTextToolActive}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 3l7 18 3-7 7-3L3 3z" />
              </svg>
              <span>Selecionar</span>
              <kbd className={styles.miniKbd}>V</kbd>
            </button>

            <button
              id="btn-tool-text"
              type="button"
              className={`${styles.toolBtn} ${isTextToolActive ? styles.toolBtnActive : ''}`}
              onClick={onToggleTextTool}
              title="Inserir Caixa de Texto (T) — Clique ou arraste sobre o documento"
              aria-label="Ferramenta de Texto"
              aria-pressed={isTextToolActive}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="4 7 4 4 20 4 20 7" />
                <line x1="9" y1="20" x2="15" y2="20" />
                <line x1="12" y1="4" x2="12" y2="20" />
              </svg>
              <span>Texto</span>
              <kbd className={styles.miniKbd}>T</kbd>
            </button>

            <button
              id="btn-detect-open"
              type="button"
              className={styles.detectBtn}
              onClick={onOpenDetection}
              title="Detectar campos e linhas para resposta"
              aria-label="Detectar campos"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Detectar</span>
              {detectedCount > 0 && <span className={styles.detectBadge}>{detectedCount}</span>}
            </button>
          </div>

          <div className={styles.viewSegment}>
            <div className={styles.navControls}>
              <button
                id="btn-prev-page"
                type="button"
                className={styles.iconBtn}
                onClick={onPrevPage}
                disabled={currentPage <= 1}
                aria-label="Página anterior"
                title="Página anterior"
              >
                ‹
              </button>
              <span className={styles.pageDisplay} aria-live="polite">
                {currentPage} / {totalPages}
              </span>
              <button
                id="btn-next-page"
                type="button"
                className={styles.iconBtn}
                onClick={onNextPage}
                disabled={currentPage >= totalPages}
                aria-label="Próxima página"
                title="Próxima página"
              >
                ›
              </button>
            </div>

            <div className={styles.zoomControls}>
              <button
                id="btn-zoom-out"
                type="button"
                className={styles.iconBtn}
                onClick={onZoomOut}
                aria-label="Reduzir zoom"
                title="Reduzir zoom"
              >
                −
              </button>
              <button
                id="btn-zoom-reset"
                type="button"
                className={styles.zoomDisplay}
                onClick={onZoomReset}
                title="Resetar para 100%"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                id="btn-zoom-in"
                type="button"
                className={styles.iconBtn}
                onClick={onZoomIn}
                aria-label="Aumentar zoom"
                title="Aumentar zoom"
              >
                ＋
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grupo Direito: Importar, Salvar Manual e Exportar */}
      <div className={styles.rightGroup}>
        <button
          id="btn-import-pdf"
          type="button"
          className={styles.secondaryActionBtn}
          onClick={onImport}
          title="Abrir outro PDF"
        >
          Abrir
        </button>

        {hasDocument && (
          <>
            <button
              id="btn-save"
              type="button"
              className={styles.secondaryActionBtn}
              onClick={onSave}
              disabled={isSaving}
              title="Salvar alterações no navegador"
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>

            <button
              id="btn-export"
              type="button"
              className={styles.exportBtn}
              onClick={onExport}
              disabled={isExporting}
              title="Exportar PDF com respostas (Ctrl+E)"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>{isExporting ? 'Exportando...' : 'Exportar'}</span>
              <kbd className={styles.exportKbd}>Ctrl+E</kbd>
            </button>
          </>
        )}
      </div>
    </header>
  )
}
