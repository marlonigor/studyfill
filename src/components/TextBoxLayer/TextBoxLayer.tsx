/**
 * TextBoxLayer: overlay posicionado sobre o PDFCanvas.
 *
 * Renderiza todos os TextBoxes da página atual como divs absolutamente
 * posicionados. Suporta:
 * - Duplo clique na área livre → cria novo TextBox
 * - Drag → move o TextBox
 * - Handles de resize → redimensiona
 * - Clique no ícone X → exclui
 * - Clique no box → ativa edição inline
 */

import { useCallback, useRef, useState } from 'react'
import type { RelativePosition, TextBoxElement } from '../../types'
import { pixelsToRelative, relativeToPixels } from '../../modules/elements/coordinates'
import styles from './TextBoxLayer.module.css'

interface TextBoxLayerProps {
  elements: TextBoxElement[]
  pageIndex: number
  canvasWidth: number
  canvasHeight: number
  onAdd: (position: RelativePosition) => void
  onUpdate: (id: string, changes: Partial<Pick<TextBoxElement, 'content' | 'position'>>) => void
  onDelete: (id: string) => void
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
  onAdd,
  onUpdate,
  onDelete,
}: TextBoxLayerProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const layerRef = useRef<HTMLDivElement>(null)

  const handleLayerDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Só cria se o duplo-clique for na área livre (não num TextBox existente)
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
      onAdd(position)
    },
    [canvasWidth, canvasHeight, onAdd],
  )

  const pageElements = elements.filter(el => el.pageIndex === pageIndex)

  return (
    <div
      ref={layerRef}
      className={styles.layer}
      style={{ width: canvasWidth, height: canvasHeight }}
      onDoubleClick={handleLayerDoubleClick}
    >
      {pageElements.map(el => (
        <TextBoxItem
          key={el.id}
          element={el}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          isActive={activeId === el.id}
          onActivate={() => setActiveId(el.id)}
          onDeactivate={() => setActiveId(null)}
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
  onUpdate: (id: string, changes: Partial<Pick<TextBoxElement, 'content' | 'position'>>) => void
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
      }}
      onClick={onActivate}
    >
      {/* Barra de drag */}
      <div className={styles.dragHandle} onMouseDown={handleDragMouseDown} title="Mover" />

      {/* Textarea de conteúdo */}
      <textarea
        className={styles.textarea}
        value={element.content}
        placeholder="Digite aqui..."
        onChange={e => onUpdate(element.id, { content: e.target.value })}
        onFocus={onActivate}
        onBlur={onDeactivate}
        style={{ fontSize: element.fontSize, color: element.fontColor }}
      />

      {/* Botão de excluir */}
      <button
        className={styles.deleteBtn}
        onClick={e => { e.stopPropagation(); onDelete(element.id) }}
        title="Excluir campo"
        aria-label="Excluir campo de texto"
      >
        ✕
      </button>

      {/* Handle de resize (canto inferior direito) */}
      <div className={styles.resizeHandle} onMouseDown={handleResizeMouseDown} title="Redimensionar" />
    </div>
  )
}
