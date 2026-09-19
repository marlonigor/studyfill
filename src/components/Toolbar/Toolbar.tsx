/**
 * Toolbar principal do StudyFill.
 *
 * Ações: importar PDF, salvar, exportar, zoom, navegação de páginas,
 * abrir painel de detecção.
 */

import styles from './Toolbar.module.css'

interface ToolbarProps {
  currentPage: number
  totalPages: number
  zoom: number
  isSaving: boolean
  isExporting: boolean
  hasDocument: boolean
  onImport: () => void
  onSave: () => void
  onExport: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onPrevPage: () => void
  onNextPage: () => void
  onOpenDetection: () => void
}

export function Toolbar({
  currentPage,
  totalPages,
  zoom,
  isSaving,
  isExporting,
  hasDocument,
  onImport,
  onSave,
  onExport,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onPrevPage,
  onNextPage,
  onOpenDetection,
}: ToolbarProps) {
  return (
    <header className={styles.toolbar} role="toolbar" aria-label="Barra de ferramentas">
      {/* Logo */}
      <div className={styles.brand}>
        <span className={styles.brandName}>StudyFill</span>
      </div>

      {/* Grupo esquerdo: importar */}
      <div className={styles.group}>
        <button
          id="btn-import-pdf"
          className={styles.btnPrimary}
          onClick={onImport}
          title="Importar PDF"
        >
          Importar PDF
        </button>
      </div>

      {/* Navegação de páginas */}
      {hasDocument && (
        <div className={styles.group}>
          <button
            id="btn-prev-page"
            className={styles.btnIcon}
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            aria-label="Página anterior"
          >
            ‹
          </button>
          <span className={styles.pageLabel} aria-live="polite">
            {currentPage} / {totalPages}
          </span>
          <button
            id="btn-next-page"
            className={styles.btnIcon}
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            aria-label="Próxima página"
          >
            ›
          </button>
        </div>
      )}

      {/* Zoom */}
      {hasDocument && (
        <div className={styles.group}>
          <button id="btn-zoom-out" className={styles.btnIcon} onClick={onZoomOut} aria-label="Reduzir zoom">−</button>
          <button id="btn-zoom-reset" className={styles.zoomLabel} onClick={onZoomReset} title="Resetar zoom">
            {Math.round(zoom * 100)}%
          </button>
          <button id="btn-zoom-in" className={styles.btnIcon} onClick={onZoomIn} aria-label="Aumentar zoom">＋</button>
        </div>
      )}

      {/* Grupo direito: ações do documento */}
      {hasDocument && (
        <div className={styles.group}>
          <button
            id="btn-detect-open"
            className={styles.btnSecondary}
            onClick={onOpenDetection}
            title="Detectar campos"
          >
            Detectar
          </button>
          <button
            id="btn-save"
            className={styles.btnSecondary}
            onClick={onSave}
            disabled={isSaving}
            title="Salvar progresso"
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            id="btn-export"
            className={styles.btnPrimary}
            onClick={onExport}
            disabled={isExporting}
            title="Exportar PDF preenchido"
          >
            {isExporting ? 'Exportando...' : 'Exportar PDF'}
          </button>
        </div>
      )}
    </header>
  )
}
