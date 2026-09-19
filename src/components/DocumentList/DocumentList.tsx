/**
 * DocumentList: tela inicial com documentos salvos no IndexedDB.
 * Permite abrir, excluir e importar novos documentos.
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
}

export function DocumentList({ onOpen, onImport }: DocumentListProps) {
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Excluir "${name}"? O arquivo original não será afetado.`)) return
    const db = await openDatabase()
    await deleteDocument(db, id)
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <h1 className={styles.heroTitle}>StudyFill</h1>
        <p className={styles.heroSubtitle}>
          Preencha seus PDFs de estudo diretamente no navegador.
          <br />Sem impressão. Sem editores complicados.
        </p>
        <button id="btn-import-hero" className={styles.importBtn} onClick={onImport}>
          Importar PDF
        </button>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Documentos Salvos</h2>

        {isLoading && <p className={styles.hint}>Carregando...</p>}

        {!isLoading && documents.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </span>
            <p>Nenhum documento salvo ainda.</p>
            <p className={styles.hint}>Importe um PDF para começar.</p>
          </div>
        )}

        <ul className={styles.list}>
          {documents.map(doc => (
            <li key={doc.id} className={styles.card}>
              <button
                id={`btn-open-doc-${doc.id}`}
                className={styles.cardMain}
                onClick={() => onOpen(doc.id)}
              >
                <span className={styles.cardIcon} aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </span>
                <div className={styles.cardInfo}>
                  <span className={styles.cardName}>{doc.name}</span>
                  <span className={styles.cardMeta}>
                    {doc.editLayer.elements.length} campo(s) •{' '}
                    {new Date(doc.editLayer.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </button>
              <button
                className={styles.cardDelete}
                onClick={() => handleDelete(doc.id, doc.name)}
                aria-label={`Excluir ${doc.name}`}
                title="Excluir documento"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
