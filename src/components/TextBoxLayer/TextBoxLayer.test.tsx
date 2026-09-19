/**
 * Testes unitários do TextBoxLayer.
 *
 * Princípios F.I.R.S.T.: testes rápidos, isolados e determinísticos.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { TextBoxElement } from '../../types'
import { TextBoxLayer } from './TextBoxLayer'

describe('TextBoxLayer', () => {
  const mockElement: TextBoxElement = {
    id: 'tb-1',
    type: 'textbox',
    pageIndex: 0,
    position: { x: 0.1, y: 0.2, width: 0.3, height: 0.05 },
    content: 'Texto de teste',
    fontSize: 14,
    fontColor: '#000000',
  }

  it('renderiza os elementos da página atual', () => {
    render(
      <TextBoxLayer
        elements={[mockElement]}
        pageIndex={0}
        canvasWidth={800}
        canvasHeight={1000}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    const textarea = screen.getByDisplayValue('Texto de teste')
    expect(textarea).toBeInTheDocument()
  })

  it('permite criar caixa de texto com duplo clique na área livre', () => {
    const onAdd = vi.fn()
    const { container } = render(
      <TextBoxLayer
        elements={[]}
        pageIndex={0}
        canvasWidth={800}
        canvasHeight={1000}
        onAdd={onAdd}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    const layer = container.firstChild as HTMLElement
    fireEvent.doubleClick(layer, { clientX: 200, clientY: 300 })

    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        width: expect.any(Number),
        height: expect.any(Number),
      }),
    )
  })

  it('cria caixa de texto com clique simples quando a ferramenta de texto está ativa (estilo Paint)', () => {
    const onAdd = vi.fn()
    const { container } = render(
      <TextBoxLayer
        elements={[]}
        pageIndex={0}
        canvasWidth={800}
        canvasHeight={1000}
        isTextToolActive={true}
        onAdd={onAdd}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    const layer = container.firstChild as HTMLElement
    fireEvent.mouseDown(layer, { clientX: 100, clientY: 150, button: 0 })
    fireEvent.mouseUp(layer)

    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('cria caixa de texto proporcional ao arrasto quando a ferramenta de texto está ativa (estilo Paint)', () => {
    const onAdd = vi.fn()
    const { container } = render(
      <TextBoxLayer
        elements={[]}
        pageIndex={0}
        canvasWidth={800}
        canvasHeight={1000}
        isTextToolActive={true}
        onAdd={onAdd}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    const layer = container.firstChild as HTMLElement
    fireEvent.mouseDown(layer, { clientX: 50, clientY: 50, button: 0 })
    fireEvent.mouseMove(layer, { clientX: 250, clientY: 150 })
    fireEvent.mouseUp(layer)

    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        width: expect.closeTo(200 / 800, 2),
        height: expect.closeTo(100 / 1000, 2),
      }),
    )
  })

  it('exclui a caixa de texto ao clicar no botão de excluir', () => {
    const onDelete = vi.fn()
    render(
      <TextBoxLayer
        elements={[mockElement]}
        pageIndex={0}
        canvasWidth={800}
        canvasHeight={1000}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={onDelete}
      />,
    )

    const deleteBtn = screen.getByRole('button', { name: 'Excluir campo de texto' })
    fireEvent.click(deleteBtn)

    expect(onDelete).toHaveBeenCalledWith('tb-1')
  })
})
