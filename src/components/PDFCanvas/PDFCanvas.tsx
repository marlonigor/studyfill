/**
 * PDFCanvas: renderiza uma única página do PDF num elemento <canvas>.
 *
 * Emite onRenderComplete com o ImageData da página (usado pela detecção).
 * A escala (zoom) é aplicada multiplicada pelo devicePixelRatio para nitidez.
 *
 * Os callbacks onRenderComplete e onSizeChange são armazenados em refs para
 * evitar que o useEffect principal re-execute a cada render do pai — o que
 * causava loop infinito (render → setCanvasSize → re-render → render...).
 */

import * as pdfjs from 'pdfjs-dist'
import { useEffect, useLayoutEffect, useRef } from 'react'
import styles from './PDFCanvas.module.css'

interface PDFCanvasProps {
  pdfDoc: pdfjs.PDFDocumentProxy
  pageNumber: number
  zoom: number
  onRenderComplete?: (imageData: ImageData, canvas: HTMLCanvasElement) => void
  onSizeChange?: (width: number, height: number) => void
}

export function PDFCanvas({
  pdfDoc,
  pageNumber,
  zoom,
  onRenderComplete,
  onSizeChange,
}: PDFCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderTaskRef = useRef<pdfjs.RenderTask | null>(null)

  // Refs para callbacks: evitam que o effect de renderização reexecute
  // quando o pai re-renderiza com funções novas mas semanticamente iguais.
  const onRenderCompleteRef = useRef(onRenderComplete)
  const onSizeChangeRef = useRef(onSizeChange)
  useLayoutEffect(() => { onRenderCompleteRef.current = onRenderComplete }, [onRenderComplete])
  useLayoutEffect(() => { onSizeChangeRef.current = onSizeChange }, [onSizeChange])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let cancelled = false

    const render = async () => {
      // Cancela renderização anterior se ainda em andamento
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }

      const page = await pdfDoc.getPage(pageNumber)
      if (cancelled) return

      const dpr = window.devicePixelRatio || 1
      const viewport = page.getViewport({ scale: zoom * dpr })

      canvas.width = viewport.width
      canvas.height = viewport.height
      canvas.style.width = `${viewport.width / dpr}px`
      canvas.style.height = `${viewport.height / dpr}px`

      onSizeChangeRef.current?.(viewport.width / dpr, viewport.height / dpr)

      const renderTask = page.render({ canvasContext: ctx, viewport })
      renderTaskRef.current = renderTask

      try {
        await renderTask.promise
        if (!cancelled) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          onRenderCompleteRef.current?.(imageData, canvas)
        }
      } catch (err) {
        // pdfjs-dist usa um objeto com .name === 'RenderingCancelledException'
        const isCancel =
          (err as { name?: string })?.name === 'RenderingCancelledException' ||
          (err instanceof Error && err.message.includes('Rendering cancelled'))
        if (!isCancel) {
          console.error('[PDFCanvas] Erro de renderização:', err)
        }
      }
    }

    render()

    return () => {
      cancelled = true
      renderTaskRef.current?.cancel()
    }
  }, [pdfDoc, pageNumber, zoom]) // callbacks fora das deps — chegam via ref

  return <canvas ref={canvasRef} className={styles.canvas} />
}
