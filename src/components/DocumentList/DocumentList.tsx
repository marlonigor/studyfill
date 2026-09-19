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
        <div className={styles.heroIcon}>📖</div>
        <h1 className={styles.heroTitle}>StudyFill</h1>
        <p className={styles.heroSubtitle}>
          Preencha seus PDFs de estudo diretamente no navegador.
          <br />Sem impressão. Sem editores complicados.
        </p>
        <button id="btn-import-hero" className={styles.importBtn} onClick={onImport}>
          ＋ Importar PDF
        </button>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Documentos Salvos</h2>

        {isLoading && <p className={styles.hint}>Carregando...</p>}

        {!isLoading && documents.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📄</span>
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
                <span className={styles.cardIcon}>📄</span>
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
                🗑
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
