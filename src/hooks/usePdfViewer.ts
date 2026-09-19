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
  setCurrentPage: (page: number) => void
  setZoom: (zoom: number) => void
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

  const loadPdf = useCallback(async (buffer: ArrayBuffer) => {
    setIsLoading(true)
    setError(null)
    try {
      // Destrói doc anterior para liberar memória
      if (currentDocRef.current) {
        await currentDocRef.current.destroy()
      }
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) })
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
  }, [])

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      currentDocRef.current?.destroy()
    }
  }, [])

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
