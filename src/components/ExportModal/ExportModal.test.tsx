/**
 * Testes unitários do ExportModal (Tela 3).
 *
 * Princípios F.I.R.S.T.: testes isolados, determinísticos e rápidos via RTL.
 * Zero emojis em mensagens e asserções.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ExportModal } from './ExportModal'

describe('ExportModal', () => {
  it('nao renderiza quando isOpen e false', () => {
    render(
      <ExportModal
        isOpen={false}
        documentName="Lista_Fisica"
        totalPages={10}
        answeredPagesCount={2}
        elementsCount={5}
        isExporting={false}
        onClose={vi.fn()}
        onConfirmExport={vi.fn()}
      />,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza o aviso de integridade e metricas quando aberto', () => {
    render(
      <ExportModal
        isOpen={true}
        documentName="Lista_Fisica"
        totalPages={12}
        answeredPagesCount={3}
        elementsCount={7}
        isExporting={false}
        onClose={vi.fn()}
        onConfirmExport={vi.fn()}
      />,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Seu PDF original não será alterado.')).toBeInTheDocument()
    expect(screen.getByText('3 de 12')).toBeInTheDocument()
    expect(screen.getByText('7 respostas')).toBeInTheDocument()
  })

  it('chama onClose ao clicar no botao Cancelar', () => {
    const onClose = vi.fn()
    render(
      <ExportModal
        isOpen={true}
        documentName="Lista_Fisica"
        totalPages={5}
        answeredPagesCount={1}
        elementsCount={2}
        isExporting={false}
        onClose={onClose}
        onConfirmExport={vi.fn()}
      />,
    )

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' })
    fireEvent.click(cancelBtn)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('chama onConfirmExport com nome e opcoes configuradas', () => {
    const onConfirmExport = vi.fn()
    render(
      <ExportModal
        isOpen={true}
        documentName="Lista_Fisica"
        totalPages={8}
        answeredPagesCount={2}
        elementsCount={4}
        isExporting={false}
        onClose={vi.fn()}
        onConfirmExport={onConfirmExport}
      />,
    )

    const input = screen.getByLabelText('Nome do arquivo gerado:')
    fireEvent.change(input, { target: { value: 'Minha_Lista_Final' } })

    const confirmBtn = screen.getByRole('button', { name: /Exportar PDF Preenchido/i })
    fireEvent.click(confirmBtn)

    expect(onConfirmExport).toHaveBeenCalledTimes(1)
    expect(onConfirmExport).toHaveBeenCalledWith('Minha_Lista_Final', {
      onlyAnsweredPages: false,
      flatten: true,
    })
  })

  it('permite selecionar somente paginas respondidas', () => {
    const onConfirmExport = vi.fn()
    render(
      <ExportModal
        isOpen={true}
        documentName="Lista_Fisica"
        totalPages={10}
        answeredPagesCount={3}
        elementsCount={5}
        isExporting={false}
        onClose={vi.fn()}
        onConfirmExport={onConfirmExport}
      />,
    )

    const answeredRadio = screen.getByDisplayValue('answered')
    fireEvent.click(answeredRadio)

    const confirmBtn = screen.getByRole('button', { name: /Exportar PDF Preenchido/i })
    fireEvent.click(confirmBtn)

    expect(onConfirmExport).toHaveBeenCalledWith('Lista_Fisica_preenchido', {
      onlyAnsweredPages: true,
      flatten: true,
    })
  })

  it('fecha o modal ao pressionar Escape', () => {
    const onClose = vi.fn()
    render(
      <ExportModal
        isOpen={true}
        documentName="Lista_Fisica"
        totalPages={4}
        answeredPagesCount={1}
        elementsCount={2}
        isExporting={false}
        onClose={onClose}
        onConfirmExport={vi.fn()}
      />,
    )

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
