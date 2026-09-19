/**
 * Testes unitários do DetectionPanel.
 *
 * Princípios F.I.R.S.T.: testes isolados, determinísticos e rápidos via RTL.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { DetectionCandidate } from '../../types'
import { DetectionPanel } from './DetectionPanel'

describe('DetectionPanel', () => {
  const mockCandidate: DetectionCandidate = {
    id: 'cand-1',
    pageIndex: 0,
    position: { x: 0.1, y: 0.35, width: 0.8, height: 0.02 },
    accepted: false,
  }

  it('renderiza o estado inicial sem detecção', () => {
    const onDetect = vi.fn()
    render(
      <DetectionPanel
        candidates={[]}
        isDetecting={false}
        hasAttempted={false}
        onDetect={onDetect}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onClose={vi.fn()}
        onHoverCandidate={vi.fn()}
      />,
    )

    expect(screen.getByText('Detectar Campos')).toBeInTheDocument()
    expect(screen.getByText('Nenhuma detecção feita ainda nesta página.')).toBeInTheDocument()

    const btn = screen.getByRole('button', { name: 'Detectar nesta página' })
    expect(btn).toBeEnabled()
    fireEvent.click(btn)
    expect(onDetect).toHaveBeenCalledTimes(1)
  })

  it('exibe progresso minimalista quando está analisando', () => {
    render(
      <DetectionPanel
        candidates={[]}
        isDetecting={true}
        detectionProgress={62}
        hasAttempted={false}
        onDetect={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onClose={vi.fn()}
        onHoverCandidate={vi.fn()}
      />,
    )

    expect(screen.getByText('Analisando...')).toBeDisabled()
    expect(screen.getByText('Escaneando linhas: 62%')).toBeInTheDocument()
  })

  it('exibe mensagem explicativa quando nenhum campo for detectado após tentativa', () => {
    render(
      <DetectionPanel
        candidates={[]}
        isDetecting={false}
        hasAttempted={true}
        onDetect={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onClose={vi.fn()}
        onHoverCandidate={vi.fn()}
      />,
    )

    expect(screen.getByText('Nenhum campo detectado')).toBeInTheDocument()
    expect(
      screen.getByText('Não foram encontradas linhas de preenchimento nesta página.'),
    ).toBeInTheDocument()
  })

  it('permite aceitar e rejeitar candidatos da lista', () => {
    const onAccept = vi.fn()
    const onReject = vi.fn()

    render(
      <DetectionPanel
        candidates={[mockCandidate]}
        isDetecting={false}
        hasAttempted={true}
        onDetect={vi.fn()}
        onAccept={onAccept}
        onReject={onReject}
        onClose={vi.fn()}
        onHoverCandidate={vi.fn()}
      />,
    )

    expect(screen.getByText('1 sugestão encontrada:')).toBeInTheDocument()
    expect(screen.getByText(/Linha 1/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Aceitar sugestão 1' }))
    expect(onAccept).toHaveBeenCalledWith(mockCandidate)

    fireEvent.click(screen.getByRole('button', { name: 'Rejeitar sugestão 1' }))
    expect(onReject).toHaveBeenCalledWith('cand-1')
  })

  it('emite hover no candidato ao passar e retirar o mouse', () => {
    const onHoverCandidate = vi.fn()

    render(
      <DetectionPanel
        candidates={[mockCandidate]}
        isDetecting={false}
        hasAttempted={true}
        onDetect={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onClose={vi.fn()}
        onHoverCandidate={onHoverCandidate}
      />,
    )

    const listItem = screen.getByRole('listitem')
    fireEvent.mouseEnter(listItem)
    expect(onHoverCandidate).toHaveBeenCalledWith(mockCandidate)

    fireEvent.mouseLeave(listItem)
    expect(onHoverCandidate).toHaveBeenCalledWith(null)
  })

  it('aciona o callback onClose ao clicar no botão fechar', () => {
    const onClose = vi.fn()

    render(
      <DetectionPanel
        candidates={[]}
        isDetecting={false}
        hasAttempted={false}
        onDetect={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onClose={onClose}
        onHoverCandidate={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Fechar painel' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('informa quando todas as sugestões já foram aceitas ou rejeitadas', () => {
    const acceptedCandidate = { ...mockCandidate, accepted: true }

    render(
      <DetectionPanel
        candidates={[acceptedCandidate]}
        isDetecting={false}
        hasAttempted={true}
        onDetect={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onClose={vi.fn()}
        onHoverCandidate={vi.fn()}
      />,
    )

    expect(screen.getByText('Todas as sugestões foram revisadas.')).toBeInTheDocument()
  })
})
