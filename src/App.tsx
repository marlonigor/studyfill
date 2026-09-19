/**
 * App principal do EstudoPDF.
 *
 * Design System: Scholar Script (Editorial Minimalism + Digital Paper Craft)
 *
 * Orquestra as 3 telas principais do MVP:
 * - Tela 1 (list): DocumentList (Início & Recentes)
 * - Tela 2 (editor): Visualizador de PDF com Toolbar, PDFCanvas, TextBoxLayer e DetectionPanel
 * - Tela 3 (modal): ExportModal (Confirmação de Exportação com integridade do original)
 *
 * Zero emojis em todo o sistema.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CandidateHighlight } from './components/CandidateHighlight/CandidateHighlight'
import { DetectionPanel } from './components/DetectionPanel/DetectionPanel'
import { DocumentList } from './components/DocumentList/DocumentList'
import { ExportModal } from './components/ExportModal/ExportModal'
import { PDFCanvas } from './components/PDFCanvas/PDFCanvas'
import { TextBoxLayer } from './components/TextBoxLayer/TextBoxLayer'
import { TextFormatToolbar } from './components/TextFormatToolbar/TextFormatToolbar'
import { Toolbar } from './components/Toolbar/Toolbar'
import { useElements } from './hooks/useElements'
import { usePdfViewer } from './hooks/usePdfViewer'
import { detectHorizontalLines } from './modules/detection/lineDetector'
import {
  downloadPdf,
  exportDocument,
  type ExportOptions,
} from './modules/export/pdfExporter'
import {
  loadDocument,
  openDatabase,
  saveDocument,
} from './modules/persistence/database'
import type { DetectionCandidate, StudyDocument, TextBoxElement } from './types'
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
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [showDetection, setShowDetection] = useState(false)
  const [candidates, setCandidates] = useState<DetectionCandidate[]>([])
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionProgress, setDetectionProgress] = useState(0)
  const [hasAttemptedDetection, setHasAttemptedDetection] = useState(false)
  const [isTextToolActive, setIsTextToolActive] = useState(false)
  const [activeFontFamily, setActiveFontFamily] = useState('Inter')
  const [activeFontSize, setActiveFontSize] = useState(14)
  const [activeFontColor, setActiveFontColor] = useState('#0f172a')
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null)
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 })
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [highlightedCandidate, setHighlightedCandidate] = useState<DetectionCandidate | null>(null)

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

  // ── Processamento comum de importação de arquivo ─────────────────────────

  const processImportFile = useCallback(
    async (file: File) => {
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

  const handleImportClick = () => fileInputRef.current?.click()

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!e.target) return
      e.target.value = ''
      if (file) {
        await processImportFile(file)
      }
    },
    [processImportFile],
  )

  // ── Abrir documento salvo ────────────────────────────────────────────────

  const handleOpenDocument = useCallback(
    async (id: string) => {
      try {
        const db = await openDatabase()
        const doc = await loadDocument(db, id)
        if (!doc) {
          showError('Documento não encontrado.')
          return
        }

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

  // ── Renomear documento ───────────────────────────────────────────────────

  const handleRenameDocument = useCallback((newName: string) => {
    setCurrentDoc(prev => (prev ? { ...prev, name: newName } : null))
  }, [])

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
      showSuccess('Progresso salvo com sucesso!')
    } catch {
      showError('Erro ao salvar. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }, [currentDoc, editLayer])

  // ── Modo de Edição e Formatação de Texto ─────────────────────────────────

  const handleChangeFontFamily = useCallback(
    (font: string) => {
      setActiveFontFamily(font)
      if (selectedBoxId) {
        updateTextBox(selectedBoxId, { fontFamily: font })
      }
    },
    [selectedBoxId, updateTextBox],
  )

  const handleChangeFontSize = useCallback(
    (size: number) => {
      setActiveFontSize(size)
      if (selectedBoxId) {
        updateTextBox(selectedBoxId, { fontSize: size })
      }
    },
    [selectedBoxId, updateTextBox],
  )

  const handleChangeFontColor = useCallback(
    (color: string) => {
      setActiveFontColor(color)
      if (selectedBoxId) {
        updateTextBox(selectedBoxId, { fontColor: color })
      }
    },
    [selectedBoxId, updateTextBox],
  )

  const handleSelectElement = useCallback((element: TextBoxElement | null) => {
    if (element) {
      setSelectedBoxId(element.id)
      setActiveFontFamily(element.fontFamily || 'Inter')
      setActiveFontSize(element.fontSize || 14)
      setActiveFontColor(element.fontColor || '#0f172a')
      setIsTextToolActive(true)
    } else {
      setSelectedBoxId(null)
    }
  }, [])

  const handleExitTextMode = useCallback(() => {
    setIsTextToolActive(false)
    setSelectedBoxId(null)
  }, [])

  // ── Exportação com opções da Tela 3 ──────────────────────────────────────

  const handleExportConfirm = useCallback(
    async (filename: string, options: ExportOptions) => {
      if (!currentDoc) return
      setIsExporting(true)
      try {
        const docToExport: StudyDocument = { ...currentDoc, editLayer }
        const bytes = await exportDocument(docToExport, options)
        downloadPdf(bytes, filename)
        setIsExportModalOpen(false)
        showSuccess('PDF exportado com sucesso!')
      } catch {
        showError('Erro ao exportar o PDF.')
      } finally {
        setIsExporting(false)
      }
    },
    [currentDoc, editLayer],
  )

  // ── Métricas para a Tela 3 ───────────────────────────────────────────────

  const answeredPagesCount = useMemo(() => {
    const answeredIndices = new Set(
      editLayer.elements
        .filter(el => el.type === 'textbox' && el.content.trim().length > 0)
        .map(el => el.pageIndex),
    )
    return answeredIndices.size
  }, [editLayer.elements])

  const filledElementsCount = useMemo(() => {
    return editLayer.elements.filter(
      el => el.type === 'textbox' && el.content.trim().length > 0,
    ).length
  }, [editLayer.elements])

  // ── Zoom ─────────────────────────────────────────────────────────────────

  const handleZoomIn = useCallback(() => setZoom(z => Math.min(ZOOM_MAX, z + ZOOM_STEP)), [])
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(ZOOM_MIN, z - ZOOM_STEP)), [])
  const handleZoomReset = useCallback(() => setZoom(1.0), [])

  // ── Navegação de páginas ─────────────────────────────────────────────────

  const resetDetection = useCallback(() => {
    setCandidates([])
    setHasAttemptedDetection(false)
    setDetectionProgress(0)
    setHighlightedCandidate(null)
  }, [])

  const handlePrevPage = useCallback(() => {
    setCurrentPage(p => Math.max(1, p - 1))
    resetDetection()
  }, [resetDetection])

  const handleNextPage = useCallback(() => {
    setCurrentPage(p => Math.min(totalPages, p + 1))
    resetDetection()
  }, [totalPages, resetDetection])

  // ── Callbacks para o PDFCanvas ───────────────────────────────────────────

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

  // ── Detecção inteligente ─────────────────────────────────────────────────

  const handleDetect = useCallback(async () => {
    if (!lastImageDataRef.current) return
    setIsDetecting(true)
    setDetectionProgress(0)
    setHasAttemptedDetection(false)
    try {
      const found = await detectHorizontalLines(
        lastImageDataRef.current,
        currentPage - 1,
        {},
        progress => setDetectionProgress(progress),
      )
      setCandidates(found)
      setHasAttemptedDetection(true)
    } finally {
      setIsDetecting(false)
    }
  }, [currentPage])

  const handleAcceptCandidate = useCallback(
    (candidate: DetectionCandidate) => {
      acceptCandidate(candidate.pageIndex, candidate.position)
      setCandidates(prev =>
        prev.map(c => (c.id === candidate.id ? { ...c, accepted: true } : c)),
      )
    },
    [acceptCandidate],
  )

  const handleRejectCandidate = (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id))
  }

  // ── Atalhos de teclado globais ───────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement)?.isContentEditable

      // Esc para fechar modal ou desativar modo de edição ou fechar detecção
      if (e.key === 'Escape') {
        if (isExportModalOpen) {
          setIsExportModalOpen(false)
        } else if (isTextToolActive || selectedBoxId) {
          handleExitTextMode()
        } else if (showDetection) {
          setShowDetection(false)
        }
        return
      }

      // Ctrl+O / Cmd+O: abrir arquivo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault()
        handleImportClick()
        return
      }

      // Ctrl+S / Cmd+S: salvar documento ativo
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        if (screen === 'editor' && currentDoc) {
          e.preventDefault()
          handleSave()
          return
        }
      }

      // Ctrl+E / Cmd+E: abrir modal de exportação
      if ((e.ctrlKey || e.metaKey) && (e.key === 'e' || e.key === 'E')) {
        if (screen === 'editor' && currentDoc) {
          e.preventDefault()
          setIsExportModalOpen(true)
          return
        }
      }

      // Tecla T: ferramenta de texto (quando não estiver digitando em campo)
      if (!isInput && (e.key === 't' || e.key === 'T')) {
        if (screen === 'editor') {
          e.preventDefault()
          if (isTextToolActive || selectedBoxId) {
            handleExitTextMode()
          } else {
            setIsTextToolActive(true)
          }
        }
        return
      }

      // Tecla V: modo seleção / sair da edição
      if (!isInput && (e.key === 'v' || e.key === 'V')) {
        if (screen === 'editor') {
          e.preventDefault()
          handleExitTextMode()
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    isExportModalOpen,
    isTextToolActive,
    selectedBoxId,
    showDetection,
    screen,
    currentDoc,
    handleSave,
    handleExitTextMode,
  ])

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
          {errorMsg || pdfError}
        </div>
      )}

      {/* Toast de sucesso */}
      {successMsg && (
        <div className={styles.toast} role="status" data-type="success">
          {successMsg}
        </div>
      )}

      {/* Tela 1: Início & Recentes */}
      {screen === 'list' && (
        <DocumentList
          onOpen={handleOpenDocument}
          onImport={handleImportClick}
          onImportFile={processImportFile}
        />
      )}

      {/* Tela 2: Editor de PDF */}
      {screen === 'editor' && (
        <div className={styles.editorLayout}>
          <Toolbar
            documentName={currentDoc?.name}
            onRenameDocument={handleRenameDocument}
            onBack={() => setScreen('list')}
            currentPage={currentPage}
            totalPages={totalPages}
            zoom={zoom}
            isSaving={isSaving}
            isExporting={isExporting}
            hasDocument={!!pdfDoc}
            isTextToolActive={isTextToolActive || selectedBoxId !== null}
            onToggleTextTool={() => {
              if (isTextToolActive || selectedBoxId !== null) {
                handleExitTextMode()
              } else {
                setIsTextToolActive(true)
              }
            }}
            onImport={handleImportClick}
            onSave={handleSave}
            onExport={() => setIsExportModalOpen(true)}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            onOpenDetection={() => setShowDetection(true)}
            detectedCount={candidates.filter(c => !c.accepted).length}
          />

          {/* Barra de Formatação do Modo de Edição de Texto */}
          {(isTextToolActive || selectedBoxId !== null) && (
            <TextFormatToolbar
              fontFamily={activeFontFamily}
              fontSize={activeFontSize}
              fontColor={activeFontColor}
              hasSelectedBox={selectedBoxId !== null}
              onChangeFontFamily={handleChangeFontFamily}
              onChangeFontSize={handleChangeFontSize}
              onChangeFontColor={handleChangeFontColor}
              onExitEditMode={handleExitTextMode}
            />
          )}

          <div className={styles.workspace}>
            {/* Painel lateral de detecção */}
            {showDetection && (
              <aside className={styles.sidebar}>
                <DetectionPanel
                  candidates={candidates}
                  isDetecting={isDetecting}
                  detectionProgress={detectionProgress}
                  hasAttempted={hasAttemptedDetection}
                  onDetect={handleDetect}
                  onAccept={handleAcceptCandidate}
                  onReject={handleRejectCandidate}
                  onClose={() => setShowDetection(false)}
                  onHoverCandidate={setHighlightedCandidate}
                />
              </aside>
            )}

            {/* Palco central do PDF */}
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
                      isTextToolActive={isTextToolActive}
                      selectedId={selectedBoxId}
                      onSelectElement={handleSelectElement}
                      onAdd={pos =>
                        addTextBox(currentPage - 1, pos, {
                          fontFamily: activeFontFamily,
                          fontSize: activeFontSize,
                          fontColor: activeFontColor,
                        })
                      }
                      onUpdate={updateTextBox}
                      onDelete={id => {
                        deleteTextBox(id)
                        if (selectedBoxId === id) setSelectedBoxId(null)
                      }}
                    />
                  )}
                  {canvasSize.w > 0 && highlightedCandidate && (
                    <CandidateHighlight
                      candidate={highlightedCandidate}
                      canvasWidth={canvasSize.w}
                      canvasHeight={canvasSize.h}
                    />
                  )}
                </div>
              )}

              {!pdfDoc && !isLoading && (
                <div className={styles.placeholder}>
                  <p>Nenhum documento carregado.</p>
                  <button className={styles.backBtn} onClick={() => setScreen('list')}>
                    Voltar à lista
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tela 3: Modal de Confirmação de Exportação */}
          {currentDoc && (
            <ExportModal
              isOpen={isExportModalOpen}
              documentName={currentDoc.name}
              totalPages={totalPages}
              answeredPagesCount={answeredPagesCount}
              elementsCount={filledElementsCount}
              isExporting={isExporting}
              onClose={() => setIsExportModalOpen(false)}
              onConfirmExport={handleExportConfirm}
            />
          )}
        </div>
      )}
    </div>
  )
}
