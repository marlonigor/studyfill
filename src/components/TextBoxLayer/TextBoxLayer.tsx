/**
 * TextBoxLayer: overlay posicionado sobre o PDFCanvas.
 *
 * Renderiza todos os TextBoxes da página atual como divs absolutamente
 * posicionados. Suporta:
 * - Modo de edição de texto: clique livre ou arrasto cria novas caixas
 * - Duplo clique na área livre → cria novo TextBox
 * - Drag → move o TextBox
 * - Handles de resize → redimensiona
 * - Clique no ícone X → exclui
 * - Clique no box → ativa edição inline e notifica seleção para formatação
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { RelativePosition, TextBoxElement } from '../../types'
import { pixelsToRelative, relativeToPixels } from '../../modules/elements/coordinates'
import styles from './TextBoxLayer.module.css'

interface TextBoxLayerProps {
  elements: TextBoxElement[]
  pageIndex: number
  canvasWidth: number
  canvasHeight: number
  isTextToolActive?: boolean
  selectedId?: string | null
  onSelectElement?: (element: TextBoxElement | null) => void
  onAdd: (position: RelativePosition, calculatedFontSize?: number) => TextBoxElement | string | void
  onUpdate: (
    id: string,
    changes: Partial<Pick<TextBoxElement, 'content' | 'position' | 'fontSize' | 'fontColor' | 'fontFamily'>>,
  ) => void
  onDelete: (id: string) => void
}

interface DrawingBox {
  startX: number
  startY: number
  currentX: number
  currentY: number
}

const MIN_BOX_WIDTH = 80
const MIN_BOX_HEIGHT = 24
const DEFAULT_BOX_WIDTH_RATIO = 0.25
const DEFAULT_BOX_HEIGHT_RATIO = 0.04

export function TextBoxLayer({
  elements,
  pageIndex,
  canvasWidth,
  canvasHeight,
  isTextToolActive = false,
  selectedId = null,
  onSelectElement,
  onAdd,
  onUpdate,
  onDelete,
}: TextBoxLayerProps) {
  const [internalActiveId, setInternalActiveId] = useState<string | null>(null)
  const [drawingBox, setDrawingBox] = useState<DrawingBox | null>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const isDrawingRef = useRef(false)

  const activeId = selectedId !== undefined ? selectedId : internalActiveId

  const handleActivate = useCallback(
    (el: TextBoxElement) => {
      setInternalActiveId(el.id)
      onSelectElement?.(el)
    },
    [onSelectElement],
  )

  const handleDeactivate = useCallback(() => {
    setInternalActiveId(null)
  }, [])

  // ── Criação por duplo clique (atalho clássico permanente) ──────────────────
  const handleLayerDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest('[data-textbox]')) return
      const rect = layerRef.current?.getBoundingClientRect()
      if (!rect) return

      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top

      const position: RelativePosition = {
        x: Math.max(0, clickX / canvasWidth - DEFAULT_BOX_WIDTH_RATIO / 2),
        y: Math.max(0, clickY / canvasHeight - DEFAULT_BOX_HEIGHT_RATIO / 2),
        width: DEFAULT_BOX_WIDTH_RATIO,
        height: DEFAULT_BOX_HEIGHT_RATIO,
      }
      const created = onAdd(position)
      const createdId = typeof created === 'object' && created ? created.id : created
      if (createdId) {
        setInternalActiveId(createdId)
        const found = elements.find(el => el.id === createdId)
        if (found) onSelectElement?.(found)
      }
    },
    [canvasWidth, canvasHeight, onAdd, elements, onSelectElement],
  )

  // ── Ferramenta de Texto: seleção por arrasto livre com adaptação de fonte ──
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isTextToolActive) return
      if ((e.target as HTMLElement).closest('[data-textbox]')) return
      if (e.button !== 0) return

      e.preventDefault()

      const rect = layerRef.current?.getBoundingClientRect()
      if (!rect) return

      const startX = Math.max(0, Math.min(canvasWidth, e.clientX - rect.left))
      const startY = Math.max(0, Math.min(canvasHeight, e.clientY - rect.top))

      isDrawingRef.current = true
      setDrawingBox({ startX, startY, currentX: startX, currentY: startY })

      const onMove = (ev: MouseEvent) => {
        if (!isDrawingRef.current || !layerRef.current) return
        const currentRect = layerRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(canvasWidth, ev.clientX - currentRect.left))
        const y = Math.max(0, Math.min(canvasHeight, ev.clientY - currentRect.top))
        setDrawingBox({ startX, startY, currentX: x, currentY: y })
      }

      const onUp = (ev: MouseEvent) => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
        if (!isDrawingRef.current || !layerRef.current) return
        isDrawingRef.current = false

        const currentRect = layerRef.current.getBoundingClientRect()
        const endX = Math.max(0, Math.min(canvasWidth, ev.clientX - currentRect.left))
        const endY = Math.max(0, Math.min(canvasHeight, ev.clientY - currentRect.top))

        const rawW = Math.abs(endX - startX)
        const rawH = Math.abs(endY - startY)
        const left = Math.min(startX, endX)
        const top = Math.min(startY, endY)

        let wPx = rawW
        let hPx = rawH

        // Clique simples: cria caixa de tamanho padrão proporcional
        if (rawW < 12 && rawH < 12) {
          wPx = Math.max(MIN_BOX_WIDTH, canvasWidth * DEFAULT_BOX_WIDTH_RATIO)
          hPx = Math.max(MIN_BOX_HEIGHT, canvasHeight * DEFAULT_BOX_HEIGHT_RATIO)
        } else {
          wPx = Math.max(MIN_BOX_WIDTH, rawW)
          hPx = Math.max(MIN_BOX_HEIGHT, rawH)
        }

        const xPx = Math.max(0, Math.min(left, canvasWidth - wPx))
        const yPx = Math.max(0, Math.min(top, canvasHeight - hPx))

        // Adaptação proporcional do tamanho da letra à altura da seleção feita
        const calculatedFontSize = Math.max(10, Math.min(72, Math.round(Math.max(14, hPx - 8) * 0.7)))

        const relPos = pixelsToRelative(
          { x: xPx, y: yPx, width: wPx, height: hPx },
          canvasWidth,
          canvasHeight,
        )

        const created = onAdd(relPos, calculatedFontSize)
        const createdId = typeof created === 'object' && created ? created.id : created
        if (createdId) {
          setInternalActiveId(createdId)
          if (typeof created === 'object' && created) {
            onSelectElement?.(created)
          }
        }

        setDrawingBox(null)
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [isTextToolActive, canvasWidth, canvasHeight, onAdd, onSelectElement],
  )

  const pageElements = elements.filter(el => el.pageIndex === pageIndex)

  return (
    <div
      ref={layerRef}
      className={`${styles.layer} ${isTextToolActive ? styles.layerActiveTool : ''}`}
      style={{ width: canvasWidth, height: canvasHeight }}
      onDoubleClick={handleLayerDoubleClick}
      onMouseDown={handleMouseDown}
    >
      {/* Preview retangular com feedback de tamanho da letra enquanto arrasta */}
      {drawingBox && (() => {
        const previewW = Math.max(MIN_BOX_WIDTH, Math.abs(drawingBox.currentX - drawingBox.startX))
        const previewH = Math.max(MIN_BOX_HEIGHT, Math.abs(drawingBox.currentY - drawingBox.startY))
        const estimatedFontSize = Math.max(10, Math.min(72, Math.round(Math.max(14, previewH - 8) * 0.7)))
        return (
          <div
            className={styles.drawingPreview}
            style={{
              left: Math.min(drawingBox.startX, drawingBox.currentX),
              top: Math.min(drawingBox.startY, drawingBox.currentY),
              width: previewW,
              height: previewH,
            }}
          >
            <span className={styles.drawingHint}>Texto</span>
            <span className={styles.drawingSizeBadge}>{estimatedFontSize} px</span>
          </div>
        )
      })()}

      {pageElements.map(el => (
        <TextBoxItem
          key={el.id}
          element={el}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          isActive={activeId === el.id}
          onActivate={() => handleActivate(el)}
          onDeactivate={handleDeactivate}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

// ─── TextBoxItem ──────────────────────────────────────────────────────────────

interface TextBoxItemProps {
  element: TextBoxElement
  canvasWidth: number
  canvasHeight: number
  isActive: boolean
  onActivate: () => void
  onDeactivate: () => void
  onUpdate: (
    id: string,
    changes: Partial<Pick<TextBoxElement, 'content' | 'position' | 'fontSize' | 'fontColor' | 'fontFamily'>>,
  ) => void
  onDelete: (id: string) => void
}

function TextBoxItem({
  element,
  canvasWidth,
  canvasHeight,
  isActive,
  onActivate,
  onDeactivate,
  onUpdate,
  onDelete,
}: TextBoxItemProps) {
  const px = relativeToPixels(element.position, canvasWidth, canvasHeight)
  const dragRef = useRef<{ startMouseX: number; startMouseY: number; startX: number; startY: number } | null>(null)
  const resizeRef = useRef<{ startMouseX: number; startMouseY: number; startW: number; startH: number } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isActive) {
      textareaRef.current?.focus()
    }
  }, [isActive])

  // ── Drag ──
  const handleDragMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onActivate()
    dragRef.current = { startMouseX: e.clientX, startMouseY: e.clientY, startX: px.x, startY: px.y }

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return
      const newX = Math.max(0, dragRef.current.startX + ev.clientX - dragRef.current.startMouseX)
      const newY = Math.max(0, dragRef.current.startY + ev.clientY - dragRef.current.startMouseY)
      const newPx = { x: newX, y: newY, width: px.width, height: px.height }
      onUpdate(element.id, { position: pixelsToRelative(newPx, canvasWidth, canvasHeight) })
    }
    const onUp = () => {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ── Resize ──
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    resizeRef.current = { startMouseX: e.clientX, startMouseY: e.clientY, startW: px.width, startH: px.height }

    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return
      const newW = Math.max(MIN_BOX_WIDTH, resizeRef.current.startW + ev.clientX - resizeRef.current.startMouseX)
      const newH = Math.max(MIN_BOX_HEIGHT, resizeRef.current.startH + ev.clientY - resizeRef.current.startMouseY)
      const newPx = { x: px.x, y: px.y, width: newW, height: newH }
      onUpdate(element.id, { position: pixelsToRelative(newPx, canvasWidth, canvasHeight) })
    }
    const onUp = () => {
      resizeRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const fontFamilyStyle =
    element.fontFamily === 'Source Serif 4'
      ? 'var(--font-serif)'
      : element.fontFamily === 'JetBrains Mono'
      ? 'var(--font-mono)'
      : 'var(--font-sans)'

  return (
    <div
      data-textbox={element.id}
      className={`${styles.textbox} ${isActive ? styles.active : ''}`}
      style={{
        left: px.x,
        top: px.y,
        width: px.width,
        height: px.height,
        fontSize: element.fontSize,
        color: element.fontColor,
        fontFamily: fontFamilyStyle,
      }}
      onClick={onActivate}
    >
      {/* Barra de drag */}
      <div className={styles.dragHandle} onMouseDown={handleDragMouseDown} title="Mover" />

      {/* Textarea de conteúdo */}
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={element.content}
        placeholder="Digite aqui..."
        onChange={e => onUpdate(element.id, { content: e.target.value })}
        onFocus={onActivate}
        onBlur={onDeactivate}
        style={{
          fontSize: element.fontSize,
          color: element.fontColor,
          fontFamily: fontFamilyStyle,
        }}
      />

      {/* Botão de excluir */}
      <button
        className={styles.deleteBtn}
        onClick={e => {
          e.stopPropagation()
          onDelete(element.id)
        }}
        title="Excluir campo"
        aria-label="Excluir campo de texto"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Handle de resize */}
      <div className={styles.resizeHandle} onMouseDown={handleResizeMouseDown} title="Redimensionar" />
    </div>
  )
}
