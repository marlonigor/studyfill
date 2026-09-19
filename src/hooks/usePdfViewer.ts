/**
 * Hook central: estado do documento aberto.
 *
 * Gerencia: carregamento do PDF via PDF.js, página atual, zoom,
 * e expõe a referência ao PDFDocumentProxy para o visualizador.
 */

import * as pdfjs from 'pdfjs-dist'
import { useCallback, useEffect, useRef, useState } from 'react'

// Configura o worker do PDF.js (Vite serve o arquivo via URL estático)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export interface UsePdfViewerReturn {
  pdfDoc: pdfjs.PDFDocumentProxy | null
  currentPage: number
  totalPages: number
  zoom: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  setZoom: React.Dispatch<React.SetStateAction<number>>
  loadPdf: (buffer: ArrayBuffer) => Promise<void>
  isLoading: boolean
  error: string | null
}

export function usePdfViewer(): UsePdfViewerReturn {
  const [pdfDoc, setPdfDoc] = useState<pdfjs.PDFDocumentProxy | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [zoom, setZoom] = useState(1.0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentDocRef = useRef<pdfjs.PDFDocumentProxy | null>(null)
  const loadingTaskRef = useRef<ReturnType<typeof pdfjs.getDocument> | null>(null)

  /** Cleanup seguro — ignora erros se o proxy já foi destruído (ex.: HMR). */
  const destroyCurrentDoc = useCallback(async () => {
    try {
      loadingTaskRef.current?.destroy()
      loadingTaskRef.current = null
      currentDocRef.current = null
    } catch {
      // Proxy já destruído — ignora silenciosamente.
    }
  }, [])

  const loadPdf = useCallback(async (buffer: ArrayBuffer) => {
    setIsLoading(true)
    setError(null)
    try {
      await destroyCurrentDoc()
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) })
      loadingTaskRef.current = loadingTask
      const doc = await loadingTask.promise
      currentDocRef.current = doc
      setPdfDoc(doc)
      setTotalPages(doc.numPages)
      setCurrentPage(1)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar o PDF.'
      setError(`Não foi possível abrir o documento. ${msg}`)
    } finally {
      setIsLoading(false)
    }
  }, [destroyCurrentDoc])

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      destroyCurrentDoc()
    }
  }, [destroyCurrentDoc])

  return {
    pdfDoc,
    currentPage,
    totalPages,
    zoom,
    setCurrentPage,
    setZoom,
    loadPdf,
    isLoading,
    error,
  }
}
