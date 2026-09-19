/**
 * PDFCanvas: renderiza uma única página do PDF num elemento <canvas>,
 * incluindo uma camada de texto selecionável (TextLayer do PDF.js).
 *
 * Os callbacks onRenderComplete e onSizeChange são armazenados em refs para
 * evitar loop infinito de re-render (render → setCanvasSize → re-render...).
 */

import * as pdfjs from 'pdfjs-dist'
import 'pdfjs-dist/web/pdf_viewer.css'
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
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)
  const renderTaskRef = useRef<pdfjs.RenderTask | null>(null)
  const textLayerInstanceRef = useRef<pdfjs.TextLayer | null>(null)

  // Refs para callbacks — evita reexecução do effect ao receber funções novas.
  const onRenderCompleteRef = useRef(onRenderComplete)
  const onSizeChangeRef = useRef(onSizeChange)
  useLayoutEffect(() => { onRenderCompleteRef.current = onRenderComplete }, [onRenderComplete])
  useLayoutEffect(() => { onSizeChangeRef.current = onSizeChange }, [onSizeChange])

  useEffect(() => {
    if (!canvasRef.current || !textLayerRef.current) return

    const canvas = canvasRef.current
    const textLayerDiv = textLayerRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let cancelled = false

    const render = async () => {
      // Cancela renderização anterior
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }
      if (textLayerInstanceRef.current) {
        textLayerInstanceRef.current.cancel()
        textLayerInstanceRef.current = null
      }
      // Limpa text layer anterior
      textLayerDiv.innerHTML = ''

      const page = await pdfDoc.getPage(pageNumber)
      if (cancelled) return

      const dpr = window.devicePixelRatio || 1
      const viewport = page.getViewport({ scale: zoom * dpr })
      const cssViewport = page.getViewport({ scale: zoom })

      // Canvas: resolução alta para nitidez, dimensões CSS para layout
      canvas.width = viewport.width
      canvas.height = viewport.height
      canvas.style.width = `${cssViewport.width}px`
      canvas.style.height = `${cssViewport.height}px`

      // Configura variáveis de escala do PDF.js essenciais para o TextLayer calcular
      // corretamente font-size, dimensões e posicionamento dos spans de texto.
      const userUnit = cssViewport.userUnit || 1
      const totalScale = cssViewport.scale * userUnit

      const applyScaleVars = (el: HTMLElement) => {
        el.style.setProperty('--scale-factor', `${cssViewport.scale}`)
        el.style.setProperty('--user-unit', `${userUnit}`)
        el.style.setProperty('--total-scale-factor', `${totalScale}`)
        el.style.setProperty('--scale-round-x', '1px')
        el.style.setProperty('--scale-round-y', '1px')
      }

      if (containerRef.current) {
        applyScaleVars(containerRef.current)
        containerRef.current.style.width = `${cssViewport.width}px`
        containerRef.current.style.height = `${cssViewport.height}px`
      }

      applyScaleVars(textLayerDiv)
      textLayerDiv.style.width = `${cssViewport.width}px`
      textLayerDiv.style.height = `${cssViewport.height}px`

      onSizeChangeRef.current?.(cssViewport.width, cssViewport.height)

      // Render do canvas
      const renderTask = page.render({ canvasContext: ctx, viewport, canvas })
      renderTaskRef.current = renderTask

      try {
        await renderTask.promise
        if (cancelled) return

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        onRenderCompleteRef.current?.(imageData, canvas)
      } catch (err) {
        const isCancel =
          (err as { name?: string })?.name === 'RenderingCancelledException' ||
          (err instanceof Error && err.message.includes('Rendering cancelled'))
        if (!isCancel) {
          console.error('[PDFCanvas] Erro de renderização:', err)
        }
        return // Se cancelou, não tenta renderizar text layer
      }

      // TextLayer: camada de texto selecionável perfeitamente calibrada sobre o canvas
      if (cancelled) return
      try {
        const textContent = await page.getTextContent()
        if (cancelled) return

        const textLayer = new pdfjs.TextLayer({
          textContentSource: textContent,
          container: textLayerDiv,
          viewport: cssViewport,
        })
        textLayerInstanceRef.current = textLayer
        await textLayer.render()

        // Assegura dimensões exatas caso setLayerDimensions tenha usado expressões parciais
        if (!cancelled && textLayerRef.current) {
          textLayerRef.current.style.width = `${cssViewport.width}px`
          textLayerRef.current.style.height = `${cssViewport.height}px`
        }
      } catch (err) {
        // Ignora erros de cancelamento no text layer
        if (!(err instanceof Error && err.message.includes('cancel'))) {
          console.error('[PDFCanvas] Erro ao renderizar text layer:', err)
        }
      }
    }

    render()

    return () => {
      cancelled = true
      renderTaskRef.current?.cancel()
      textLayerInstanceRef.current?.cancel()
    }
  }, [pdfDoc, pageNumber, zoom])

  return (
    <div ref={containerRef} className={`${styles.pageContainer} page`}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div ref={textLayerRef} className={`textLayer ${styles.textLayer}`} />
    </div>
  )
}
