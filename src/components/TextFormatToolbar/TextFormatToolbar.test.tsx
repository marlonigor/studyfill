/**
 * Testes unitários do TextFormatToolbar.
 *
 * Princípios F.I.R.S.T.: testes isolados, determinísticos e rápidos via RTL.
 * Zero emojis em mensagens e asserções.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TextFormatToolbar } from './TextFormatToolbar'

describe('TextFormatToolbar', () => {
  it('renderiza o indicador de modo de edicao e instrucao', () => {
    render(
      <TextFormatToolbar
        fontFamily="Inter"
        fontSize={14}
        fontColor="#0f172a"
        hasSelectedBox={false}
        onChangeFontFamily={vi.fn()}
        onChangeFontSize={vi.fn()}
        onChangeFontColor={vi.fn()}
        onExitEditMode={vi.fn()}
      />,
    )

    expect(screen.getByText('Modo de Edição')).toBeInTheDocument()
    expect(screen.getByText('Clique no documento para escrever')).toBeInTheDocument()
  })

  it('indica quando ha uma caixa selecionada', () => {
    render(
      <TextFormatToolbar
        fontFamily="Source Serif 4"
        fontSize={18}
        fontColor="#2563eb"
        hasSelectedBox={true}
        onChangeFontFamily={vi.fn()}
        onChangeFontSize={vi.fn()}
        onChangeFontColor={vi.fn()}
        onExitEditMode={vi.fn()}
      />,
    )

    expect(screen.getByText('Editando caixa selecionada')).toBeInTheDocument()
  })

  it('permite trocar a familia da fonte', () => {
    const onChangeFontFamily = vi.fn()
    render(
      <TextFormatToolbar
        fontFamily="Inter"
        fontSize={14}
        fontColor="#0f172a"
        hasSelectedBox={false}
        onChangeFontFamily={onChangeFontFamily}
        onChangeFontSize={vi.fn()}
        onChangeFontColor={vi.fn()}
        onExitEditMode={vi.fn()}
      />,
    )

    const select = screen.getByLabelText('Fonte:')
    fireEvent.change(select, { target: { value: 'Source Serif 4' } })
    expect(onChangeFontFamily).toHaveBeenCalledWith('Source Serif 4')
  })

  it('permite alterar o tamanho da fonte via botoes A+ e A-', () => {
    const onChangeFontSize = vi.fn()
    render(
      <TextFormatToolbar
        fontFamily="Inter"
        fontSize={14}
        fontColor="#0f172a"
        hasSelectedBox={false}
        onChangeFontFamily={vi.fn()}
        onChangeFontSize={onChangeFontSize}
        onChangeFontColor={vi.fn()}
        onExitEditMode={vi.fn()}
      />,
    )

    const incBtn = screen.getByRole('button', { name: 'Aumentar fonte' })
    fireEvent.click(incBtn)
    expect(onChangeFontSize).toHaveBeenCalledWith(16)

    const decBtn = screen.getByRole('button', { name: 'Diminuir fonte' })
    fireEvent.click(decBtn)
    expect(onChangeFontSize).toHaveBeenCalledWith(12)
  })

  it('permite escolher a cor da fonte', () => {
    const onChangeFontColor = vi.fn()
    render(
      <TextFormatToolbar
        fontFamily="Inter"
        fontSize={14}
        fontColor="#0f172a"
        hasSelectedBox={false}
        onChangeFontFamily={vi.fn()}
        onChangeFontSize={vi.fn()}
        onChangeFontColor={onChangeFontColor}
        onExitEditMode={vi.fn()}
      />,
    )

    const blueBtn = screen.getByRole('radio', { name: 'Azul caneta' })
    fireEvent.click(blueBtn)
    expect(onChangeFontColor).toHaveBeenCalledWith('#2563eb')
  })

  it('aciona onExitEditMode ao clicar no botao Concluir Edicao', () => {
    const onExitEditMode = vi.fn()
    render(
      <TextFormatToolbar
        fontFamily="Inter"
        fontSize={14}
        fontColor="#0f172a"
        hasSelectedBox={false}
        onChangeFontFamily={vi.fn()}
        onChangeFontSize={vi.fn()}
        onChangeFontColor={vi.fn()}
        onExitEditMode={onExitEditMode}
      />,
    )

    const exitBtn = screen.getByRole('button', { name: /Concluir Edição/i })
    fireEvent.click(exitBtn)
    expect(onExitEditMode).toHaveBeenCalledTimes(1)
  })
})
