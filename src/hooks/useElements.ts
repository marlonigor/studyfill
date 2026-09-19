/**
 * Hook de gerenciamento de elementos da camada de edição.
 *
 * CRUD de TextBoxes com coordenadas relativas (ADR-002).
 */

import { useCallback, useState } from 'react'
import type { EditLayer, RelativePosition, TextBoxElement } from '../types'

let _idCounter = 0
function generateId(): string {
  return `textbox-${Date.now()}-${_idCounter++}`
}

function nowIso(): string {
  return new Date().toISOString()
}

export interface UseElementsReturn {
  editLayer: EditLayer
  addTextBox: (
    pageIndex: number,
    position: RelativePosition,
    initialProps?: Partial<Pick<TextBoxElement, 'fontSize' | 'fontColor' | 'fontFamily'>>,
  ) => TextBoxElement
  updateTextBox: (
    id: string,
    changes: Partial<Pick<TextBoxElement, 'content' | 'position' | 'fontSize' | 'fontColor' | 'fontFamily'>>,
  ) => void
  deleteTextBox: (id: string) => void
  loadEditLayer: (layer: EditLayer) => void
  acceptCandidate: (pageIndex: number, position: RelativePosition) => TextBoxElement
}

export function useElements(documentId: string): UseElementsReturn {
  const [editLayer, setEditLayer] = useState<EditLayer>({
    documentId,
    elements: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  })

  const addTextBox = useCallback(
    (
      pageIndex: number,
      position: RelativePosition,
      initialProps?: Partial<Pick<TextBoxElement, 'fontSize' | 'fontColor' | 'fontFamily'>>,
    ): TextBoxElement => {
      const newBox: TextBoxElement = {
        id: generateId(),
        type: 'textbox',
        pageIndex,
        position,
        content: '',
        fontSize: initialProps?.fontSize ?? 14,
        fontColor: initialProps?.fontColor ?? '#0f172a',
        fontFamily: initialProps?.fontFamily ?? 'Inter',
      }
    setEditLayer(prev => ({
      ...prev,
      elements: [...prev.elements, newBox],
      updatedAt: nowIso(),
    }))
    return newBox
  }, [])

  const updateTextBox = useCallback(
    (id: string, changes: Partial<Pick<TextBoxElement, 'content' | 'position' | 'fontSize' | 'fontColor'>>) => {
      setEditLayer(prev => ({
        ...prev,
        elements: prev.elements.map(el => (el.id === id ? { ...el, ...changes } : el)),
        updatedAt: nowIso(),
      }))
    },
    [],
  )

  const deleteTextBox = useCallback((id: string) => {
    setEditLayer(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id),
      updatedAt: nowIso(),
    }))
  }, [])

  const loadEditLayer = useCallback((layer: EditLayer) => {
    setEditLayer(layer)
  }, [])

  /** Aceita um candidato de detecção e cria um TextBox (ADR-004). */
  const acceptCandidate = useCallback(
    (pageIndex: number, position: RelativePosition): TextBoxElement => {
      return addTextBox(pageIndex, position)
    },
    [addTextBox],
  )

  return { editLayer, addTextBox, updateTextBox, deleteTextBox, loadEditLayer, acceptCandidate }
}
