/**
 * Módulo de persistência com IndexedDB.
 *
 * Armazena o PDF original (ArrayBuffer) e a camada de edição (JSON)
 * separadamente do conteúdo editado (ADR-001).
 *
 * Exemplo de uso:
 *   const db = await openDatabase()
 *   await saveDocument(db, studyDoc)
 *   const docs = await listDocuments(db)
 *   const doc = await loadDocument(db, id)
 *   await deleteDocument(db, id)
 */

import { openDB, type IDBPDatabase } from 'idb'
import type { StudyDocument } from '../../types'

const DB_NAME = 'studyfill'
const DB_VERSION = 1
const STORE_NAME = 'documents'

export type StudyFillDB = IDBPDatabase<unknown>

/** Abre (ou cria) o banco IndexedDB do StudyFill. */
export async function openDatabase(): Promise<StudyFillDB> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    },
  })
}

/** Salva ou atualiza um documento (original + camada de edição). */
export async function saveDocument(
  db: StudyFillDB,
  doc: StudyDocument,
): Promise<void> {
  await db.put(STORE_NAME, doc)
}

/** Retorna todos os documentos sem o buffer (para listagem leve). */
export async function listDocuments(
  db: StudyFillDB,
): Promise<Omit<StudyDocument, 'originalPdfBuffer'>[]> {
  const all = await db.getAll(STORE_NAME)
  return all.map(({ originalPdfBuffer: _buf, ...rest }) => rest)
}

/** Carrega um documento completo pelo id. */
export async function loadDocument(
  db: StudyFillDB,
  id: string,
): Promise<StudyDocument | undefined> {
  return db.get(STORE_NAME, id)
}

/** Remove um documento do banco. */
export async function deleteDocument(
  db: StudyFillDB,
  id: string,
): Promise<void> {
  await db.delete(STORE_NAME, id)
}
