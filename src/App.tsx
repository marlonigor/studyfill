/**
 * App principal do StudyFill.
 *
 * Roteamento simples via estado React (sem react-router no MVP):
 * - 'list'   → DocumentList (tela inicial)
 * - 'editor' → Editor (visualizador + camada de edição)
 *
 * Orquestra: importação, persistência, exportação e navegação.
 */

import { useCallback, useRef, useState } from 'react'
import { DetectionPanel } from './components/DetectionPanel/DetectionPanel'
import { DocumentList } from './components/DocumentList/DocumentList'
import { PDFCanvas } from './components/PDFCanvas/PDFCanvas'
import { TextBoxLayer } from './components/TextBoxLayer/TextBoxLayer'
import { Toolbar } from './components/Toolbar/Toolbar'
import { useElements } from './hooks/useElements'
import { usePdfViewer } from './hooks/usePdfViewer'
import { detectHorizontalLines } from './modules/detection/lineDetector'
import { downloadPdf, exportDocument } from './modules/export/pdfExporter'
import {
  loadDocument,
  openDatabase,
  saveDocument,
} from './modules/persistence/database'
import type { DetectionCandidate, StudyDocument } from './types'
import styles from './App.module.css'

type Screen = 'list' | 'editor'

const ZOOM_STEP = 0.2
const ZOOM_MIN = 0.5
const ZOOM_MAX = 3.0

export default function App() {
  const [screen, setScreen] = useState<Screen>('list')
  const [currentDoc, setCurrentDoc] = useState<StudyDocument | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showDetection, setShowDetection] = useState(false)
  const [candidates, setCandidates] = useState<DetectionCandidate[]>([])
  const [isDetecting, setIsDetecting] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 })
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastImageDataRef = useRef<ImageData | null>(null)

  const {
    pdfDoc,
    currentPage,
    totalPages,
    zoom,
    setCurrentPage,
    setZoom,
    loadPdf,
    isLoading,
    error: pdfError,
  } = usePdfViewer()

  const docId = currentDoc?.id ?? 'new'
  const { editLayer, addTextBox, updateTextBox, deleteTextBox, loadEditLayer, acceptCandidate } =
    useElements(docId)

  // ── Utilitários de feedback ──────────────────────────────────────────────

  const showError = (msg: string) => {
    setErrorMsg(msg)
    setTimeout(() => setErrorMsg(null), 4000)
  }

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  // ── Importação ───────────────────────────────────────────────────────────

  const handleImportClick = () => fileInputRef.current?.click()

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!e.target) return
      // Reset do input para permitir reimportar o mesmo arquivo
      e.target.value = ''

      if (!file) return
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        showError('O arquivo selecionado não é um PDF válido.')
        return
      }

      try {
        const buffer = await file.arrayBuffer()
        await loadPdf(buffer)

        const id = `doc-${Date.now()}`
        const newDoc: StudyDocument = {
          id,
          name: file.name.replace(/\.pdf$/i, ''),
          originalPdfBuffer: buffer,
          editLayer: {
            documentId: id,
            elements: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }
        setCurrentDoc(newDoc)
        loadEditLayer(newDoc.editLayer)
        setScreen('editor')
        setCandidates([])
        setShowDetection(false)
      } catch {
        showError('Não foi possível abrir o arquivo. Verifique se é um PDF válido.')
      }
    },
    [loadPdf, loadEditLayer],
  )

  // ── Abrir documento salvo ────────────────────────────────────────────────

  const handleOpenDocument = useCallback(
    async (id: string) => {
      try {
        const db = await openDatabase()
        const doc = await loadDocument(db, id)
        if (!doc) { showError('Documento não encontrado.'); return }

        await loadPdf(doc.originalPdfBuffer)
        setCurrentDoc(doc)
        loadEditLayer(doc.editLayer)
        setScreen('editor')
        setCandidates([])
        setShowDetection(false)
      } catch {
        showError('Erro ao abrir o documento.')
      }
    },
    [loadPdf, loadEditLayer],
  )

  // ── Salvar ───────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!currentDoc) return
    setIsSaving(true)
    try {
      const docToSave: StudyDocument = {
        ...currentDoc,
        editLayer: { ...editLayer, documentId: currentDoc.id },
      }
      const db = await openDatabase()
      await saveDocument(db, docToSave)
      setCurrentDoc(docToSave)
      showSuccess('Progresso salvo!')
    } catch {
      showError('Erro ao salvar. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }, [currentDoc, editLayer])

  // ── Exportar ─────────────────────────────────────────────────────────────

  const handleExport = useCallback(async () => {
    if (!currentDoc) return
    setIsExporting(true)
    try {
      const docToExport: StudyDocument = { ...currentDoc, editLayer }
      const bytes = await exportDocument(docToExport)
      downloadPdf(bytes, `${currentDoc.name}_preenchido`)
      showSuccess('PDF exportado com sucesso!')
    } catch {
      showError('Erro ao exportar o PDF.')
    } finally {
      setIsExporting(false)
    }
  }, [currentDoc, editLayer])

  // ── Zoom — functional updates para não capturar zoom/page obsoletos ───────

  const handleZoomIn = useCallback(() => setZoom(z => Math.min(ZOOM_MAX, z + ZOOM_STEP)), [])
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(ZOOM_MIN, z - ZOOM_STEP)), [])
  const handleZoomReset = useCallback(() => setZoom(1.0), [])

  // ── Navegação de páginas ─────────────────────────────────────────────────

  const handlePrevPage = useCallback(() => setCurrentPage(p => Math.max(1, p - 1)), [])
  const handleNextPage = useCallback(
    () => setCurrentPage(p => Math.min(totalPages, p + 1)),
    [totalPages],
  )

  // ── Callbacks estáveis para PDFCanvas ────────────────────────────────────
  // Precisam ser estáveis para que o useLayoutEffect no PDFCanvas não execute
  // desnecessariamente. Não têm deps além das refs — atualizamos via ref lá.

  const handleRenderComplete = useCallback(
    (imageData: ImageData, canvas: HTMLCanvasElement) => {
      lastImageDataRef.current = imageData
      setCanvasSize({ w: canvas.offsetWidth, h: canvas.offsetHeight })
    },
    [],
  )

  const handleSizeChange = useCallback((w: number, h: number) => {
    setCanvasSize({ w, h })
  }, [])

  // ── Detecção (assíncrona para não travar a UI) ────────────────────────────

  const handleDetect = useCallback(async () => {
    if (!lastImageDataRef.current) return
    setIsDetecting(true)
    try {
      const found = await detectHorizontalLines(lastImageDataRef.current, currentPage - 1)
      setCandidates(found)
    } finally {
      setIsDetecting(false)
    }
  }, [currentPage])

  const handleAcceptCandidate = useCallback(
    (candidate: DetectionCandidate) => {
      acceptCandidate(candidate.pageIndex, candidate.position)
      setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, accepted: true } : c))
    },
    [acceptCandidate],
  )

  const handleRejectCandidate = (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id))
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.app}>
      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        aria-hidden="true"
      />

      {/* Toast de erro */}
      {(errorMsg || pdfError) && (
        <div className={styles.toast} role="alert" data-type="error">
          ⚠ {errorMsg || pdfError}
        </div>
      )}

      {/* Toast de sucesso */}
      {successMsg && (
        <div className={styles.toast} role="status" data-type="success">
          ✓ {successMsg}
        </div>
      )}

      {screen === 'list' && (
        <DocumentList onOpen={handleOpenDocument} onImport={handleImportClick} />
      )}

      {screen === 'editor' && (
        <div className={styles.editorLayout}>
          <Toolbar
            currentPage={currentPage}
            totalPages={totalPages}
            zoom={zoom}
            isSaving={isSaving}
            isExporting={isExporting}
            hasDocument={!!pdfDoc}
            onImport={handleImportClick}
            onSave={handleSave}
            onExport={handleExport}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            onOpenDetection={() => setShowDetection(true)}
          />

          <div className={styles.workspace}>
            {/* Painel lateral de detecção */}
            {showDetection && (
              <aside className={styles.sidebar}>
                <DetectionPanel
                  candidates={candidates}
                  isDetecting={isDetecting}
                  onDetect={handleDetect}
                  onAccept={handleAcceptCandidate}
                  onReject={handleRejectCandidate}
                  onClose={() => setShowDetection(false)}
                />
              </aside>
            )}

            {/* Área principal de edição */}
            <div className={styles.canvasArea}>
              {isLoading && (
                <div className={styles.loadingOverlay}>
                  <div className={styles.spinner} />
                  <p>Carregando documento...</p>
                </div>
              )}

              {pdfDoc && (
                <div className={styles.pageWrapper}>
                  <PDFCanvas
                    pdfDoc={pdfDoc}
                    pageNumber={currentPage}
                    zoom={zoom}
                    onRenderComplete={handleRenderComplete}
                    onSizeChange={handleSizeChange}
                  />
                  {canvasSize.w > 0 && (
                    <TextBoxLayer
                      elements={editLayer.elements}
                      pageIndex={currentPage - 1}
                      canvasWidth={canvasSize.w}
                      canvasHeight={canvasSize.h}
                      onAdd={pos => addTextBox(currentPage - 1, pos)}
                      onUpdate={updateTextBox}
                      onDelete={deleteTextBox}
                    />
                  )}
                </div>
              )}

              {!pdfDoc && !isLoading && (
                <div className={styles.placeholder}>
                  <p>Nenhum documento carregado.</p>
                  <button className={styles.backBtn} onClick={() => setScreen('list')}>
                    ← Voltar à lista
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
