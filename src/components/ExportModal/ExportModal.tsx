/**
 * ExportModal: Tela 3 — Modal de Confirmação de Exportação
 *
 * Design System: Scholar Script (EstudoPDF)
 *
 * Características:
 * - Aviso de integridade do original (selo azul acadêmico)
 * - Resumo consolidado da sessão (páginas, campos salvos)
 * - Escolha de escopo: PDF completo ou apenas páginas respondidas
 * - Opção de aplainamento (flatten)
 * - Atalhos: Esc para cancelar, Ctrl+Enter para exportar
 * - Zero emojis (apenas SVGs e texto limpo)
 */

import { useEffect, useState } from 'react'
import type { ExportOptions } from '../../modules/export/pdfExporter'
import styles from './ExportModal.module.css'

interface ExportModalProps {
  isOpen: boolean
  documentName: string
  totalPages: number
  answeredPagesCount: number
  elementsCount: number
  isExporting: boolean
  onClose: () => void
  onConfirmExport: (filename: string, options: ExportOptions) => void
}

export function ExportModal({
  isOpen,
  documentName,
  totalPages,
  answeredPagesCount,
  elementsCount,
  isExporting,
  onClose,
  onConfirmExport,
}: ExportModalProps) {
  const [filename, setFilename] = useState(`${documentName}_preenchido`)
  const [scope, setScope] = useState<'all' | 'answered'>('all')
  const [flatten, setFlatten] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setFilename(`${documentName}_preenchido`)
    }
  }, [isOpen, documentName])

  // Atalhos de teclado: Esc e Ctrl+Enter
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleExport()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filename, scope, flatten, isExporting])

  if (!isOpen) return null

  const handleExport = () => {
    if (isExporting) return
    const finalName = filename.trim() || `${documentName}_preenchido`
    onConfirmExport(finalName, {
      onlyAnsweredPages: scope === 'answered',
      flatten,
    })
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header do Modal */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Exportar Documento</h2>
            <p className={styles.subtitle}>Gere uma versão final com suas respostas em camada vetorial.</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar janela">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 1. Aviso de Integridade do Original */}
        <div className={styles.integrityCard}>
          <div className={styles.integrityIconBox} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <div className={styles.integrityText}>
            <strong>Seu PDF original não será alterado.</strong>
            <span> Uma nova cópia com todas as suas respostas, anotações e preenchimentos em camada vetorial será gerada e baixada.</span>
          </div>
        </div>

        {/* 2. Resumo da Sessão Acadêmica & Nome do Arquivo */}
        <div className={styles.section}>
          <label className={styles.fieldLabel} htmlFor="export-filename">
            Nome do arquivo gerado:
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="export-filename"
              className={styles.textInput}
              value={filename}
              onChange={e => setFilename(e.target.value)}
              placeholder="Nome do arquivo"
              disabled={isExporting}
            />
            <span className={styles.fileExt}>.pdf</span>
          </div>

          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Páginas com respostas</span>
              <span className={styles.metricValue}>
                {answeredPagesCount} de {totalPages}
              </span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Campos preenchidos</span>
              <span className={styles.metricValue}>{elementsCount} respostas</span>
            </div>
          </div>
        </div>

        {/* 3. Seleção do Formato de Saída */}
        <div className={styles.section}>
          <span className={styles.fieldLabel}>Escopo da exportação:</span>
          <div className={styles.optionsList}>
            <label className={`${styles.optionItem} ${scope === 'all' ? styles.optionSelected : ''}`}>
              <input
                type="radio"
                name="exportScope"
                value="all"
                checked={scope === 'all'}
                onChange={() => setScope('all')}
                disabled={isExporting}
              />
              <div className={styles.optionContent}>
                <span className={styles.optionTitle}>PDF Completo com Respostas ({totalPages} págs.)</span>
                <span className={styles.optionDesc}>
                  Mantém toda a estrutura original do documento, com respostas preenchidas. Recomendado para entrega de listas e simulados.
                </span>
              </div>
            </label>

            <label className={`${styles.optionItem} ${scope === 'answered' ? styles.optionSelected : ''}`}>
              <input
                type="radio"
                name="exportScope"
                value="answered"
                checked={scope === 'answered'}
                onChange={() => setScope('answered')}
                disabled={isExporting || answeredPagesCount === 0}
              />
              <div className={styles.optionContent}>
                <span className={styles.optionTitle}>
                  Somente Páginas Respondidas ({answeredPagesCount} {answeredPagesCount === 1 ? 'pág.' : 'págs.'})
                </span>
                <span className={styles.optionDesc}>
                  Extrai apenas as folhas que contêm anotações ou respostas salvas. Ideal para impressão econômica.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* 4. Opções Avançadas de Compatibilidade */}
        <div className={styles.section}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={flatten}
              onChange={e => setFlatten(e.target.checked)}
              disabled={isExporting}
            />
            <div className={styles.checkboxContent}>
              <span className={styles.checkboxTitle}>Aplainar campos de texto (flatten PDF)</span>
              <span className={styles.checkboxDesc}>
                Funde o texto à folha para garantir que não haja desconfiguração visual em qualquer leitor ou na avaliação do professor.
              </span>
            </div>
          </label>
        </div>

        {/* 5. Ações */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isExporting}
          >
            Cancelar
          </button>

          <button
            id="btn-confirm-export"
            type="button"
            className={styles.confirmBtn}
            onClick={handleExport}
            disabled={isExporting}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>{isExporting ? 'Gerando arquivo...' : 'Exportar PDF Preenchido'}</span>
            <kbd className={styles.shortcutKey}>Ctrl+Enter</kbd>
          </button>
        </div>
      </div>
    </div>
  )
}
