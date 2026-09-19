/**
 * DocumentList: Tela 1 — Início & Recentes (Dashboard Acadêmico Focado)
 *
 * Design System: Scholar Script
 * Identidade: EstudoPDF
 *
 * Características:
 * - Top Bar institucional com selo de privacidade
 * - Título editorial em Source Serif 4
 * - Área de Drag & Drop ativa com aviso de segurança
 * - Grid de Documentos Recentes com progresso e ações rápidas
 * - Rodapé com princípios e dicas de atalhos
 * - Sem emojis (apenas SVGs e tipografia limpa)
 */

import { useCallback, useEffect, useState } from 'react'
import {
  deleteDocument,
  listDocuments,
  openDatabase,
} from '../../modules/persistence/database'
import type { StudyDocument } from '../../types'
import styles from './DocumentList.module.css'

type DocumentSummary = Omit<StudyDocument, 'originalPdfBuffer'>

interface DocumentListProps {
  onOpen: (id: string) => void
  onImport: () => void
  onImportFile?: (file: File) => void
}

export function DocumentList({ onOpen, onImport, onImportFile }: DocumentListProps) {
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDragOver, setIsDragOver] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const db = await openDatabase()
      const docs = await listDocuments(db)
      setDocuments(docs)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    if (!window.confirm(`Excluir "${name}"? O arquivo original não será afetado.`)) return
    const db = await openDatabase()
    await deleteDocument(db, id)
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && onImportFile) {
      onImportFile(file)
    } else if (file) {
      onImport()
    }
  }

  return (
    <div className={styles.page}>
      {/* Top Bar Acadêmica */}
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <svg
            className={styles.brandLogo}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span className={styles.brandName}>StudyFill</span>
          <span className={styles.versionBadge}>MVP</span>
        </div>

        <div className={styles.securityBadge}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>100% no seu navegador</span>
        </div>
      </header>

      <main className={styles.container}>
        {/* Seção Hero Editorial */}
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>
            Caderno de Estudos & <em>Preenchimento</em>
          </h1>
          <p className={styles.heroSubtitle}>
            Preencha apostilas, listas de exercícios e simulados em PDF diretamente no navegador.
            <br />
            Suas anotações em camada vetorial limpa, sem jamais alterar o arquivo original.
          </p>
        </div>

        {/* Zona de Drag & Drop e Upload */}
        <section
          className={`${styles.dropZone} ${isDragOver ? styles.dropZoneActive : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={onImport}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onImport()
            }
          }}
          aria-label="Área de importação de arquivo PDF"
        >
          <div className={styles.dropIconBox} aria-hidden="true">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="12" x2="12" y2="18" />
              <polyline points="9 15 12 12 15 15" />
            </svg>
          </div>

          <div className={styles.dropText}>
            <span className={styles.dropHeading}>Arraste e solte o PDF aqui</span>
            <span className={styles.dropSubheading}>ou escolha um documento do seu dispositivo</span>
          </div>

          <button
            id="btn-import-hero"
            type="button"
            className={styles.uploadBtn}
            onClick={e => {
              e.stopPropagation()
              onImport()
            }}
          >
            <span>Abrir PDF do Computador</span>
            <kbd className={styles.shortcutBadge}>Ctrl+O</kbd>
          </button>

          <div className={styles.securityNotice}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Processamento 100% privado no navegador • O arquivo original nunca é alterado</span>
          </div>
        </section>

        {/* Seção Continuar de onde parou */}
        <section className={styles.recentSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Continuar de onde parou</h2>
            {!isLoading && (
              <span className={styles.sectionCount}>
                {documents.length} {documents.length === 1 ? 'documento' : 'documentos'}
              </span>
            )}
          </div>

          {isLoading && <p className={styles.hintText}>Carregando documentos...</p>}

          {!isLoading && documents.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon} aria-hidden="true">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <p className={styles.emptyTitle}>Nenhum documento salvo ainda.</p>
              <p className={styles.emptySubtitle}>
                Importe uma lista de exercícios ou apostila para iniciar seus estudos.
              </p>
            </div>
          )}

          {!isLoading && documents.length > 0 && (
            <div className={styles.grid}>
              {documents.map(doc => (
                <div
                  key={doc.id}
                  id={`btn-open-doc-${doc.id}`}
                  className={styles.card}
                  onClick={() => onOpen(doc.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onOpen(doc.id)
                    }
                  }}
                >
                  <div className={styles.cardPreview}>
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className={styles.pageIndicator}>PDF</span>
                  </div>

                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle} title={doc.name}>
                      {doc.name}
                    </h3>
                    <div className={styles.cardMeta}>
                      <span className={styles.cardBadge}>
                        {doc.editLayer.elements.length} resposta(s)
                      </span>
                      <span className={styles.cardDate}>
                        {new Date(doc.editLayer.updatedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div className={styles.cardActions}>
                      <span className={styles.cardContinueLink}>Continuar respondendo →</span>
                      <button
                        type="button"
                        className={styles.cardDeleteBtn}
                        onClick={e => handleDelete(e, doc.id, doc.name)}
                        title="Excluir documento"
                        aria-label={`Excluir ${doc.name}`}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Rodapé de Princípios e Atalhos */}
        <footer className={styles.footer}>
          <div className={styles.principlesGrid}>
            <div className={styles.principleItem}>
              <div className={styles.principleNumber}>01</div>
              <h4 className={styles.principleTitle}>Importe sem medo</h4>
              <p className={styles.principleDesc}>
                O arquivo original é lido apenas na memória do seu navegador e jamais é modificado ou sobrescrito.
              </p>
            </div>

            <div className={styles.principleItem}>
              <div className={styles.principleNumber}>02</div>
              <h4 className={styles.principleTitle}>Alinhamento Inteligente</h4>
              <p className={styles.principleDesc}>
                Insira caixas de texto sobre pautas ou use o detector automático de linhas para acelerar respostas.
              </p>
            </div>

            <div className={styles.principleItem}>
              <div className={styles.principleNumber}>03</div>
              <h4 className={styles.principleTitle}>Exportação Acadêmica</h4>
              <p className={styles.principleDesc}>
                Gere cópias prontas em PDF com respostas aplainadas para envio seguro ao Google Classroom ou Moodle.
              </p>
            </div>
          </div>

          <div className={styles.shortcutsBar}>
            <span className={styles.shortcutsLabel}>Atalhos rápidos:</span>
            <div className={styles.shortcutItem}>
              <kbd>T</kbd>
              <span>Texto</span>
            </div>
            <div className={styles.shortcutItem}>
              <kbd>V</kbd>
              <span>Selecionar</span>
            </div>
            <div className={styles.shortcutItem}>
              <kbd>Ctrl+O</kbd>
              <span>Abrir</span>
            </div>
            <div className={styles.shortcutItem}>
              <kbd>Ctrl+E</kbd>
              <span>Exportar</span>
            </div>
            <div className={styles.shortcutItem}>
              <kbd>Esc</kbd>
              <span>Fechar</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
