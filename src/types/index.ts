/**
 * Tipos compartilhados do StudyFill.
 *
 * ADR-002: coordenadas relativas à página (0.0 – 1.0) para que a posição
 * seja independente do zoom e do tamanho da tela.
 */

/** Posição e dimensão expressas como fração da página (0 a 1). */
export interface RelativePosition {
  /** Fração horizontal a partir do canto esquerdo. */
  x: number
  /** Fração vertical a partir do topo. */
  y: number
  /** Fração da largura da página. */
  width: number
  /** Fração da altura da página. */
  height: number
}

/** Tipos de elementos suportados na camada de edição. */
export type ElementType = 'textbox'

/** Um campo de texto criado pelo usuário ou aceito via detecção. */
export interface TextBoxElement {
  id: string
  type: ElementType
  /** Índice da página (0-based). */
  pageIndex: number
  position: RelativePosition
  content: string
  fontSize: number
  fontColor: string
  fontFamily?: string
}

/** Camada de edição: todos os elementos adicionados sobre um documento. */
export interface EditLayer {
  documentId: string
  elements: TextBoxElement[]
  createdAt: string
  updatedAt: string
}

/**
 * Documento principal: PDF original + camada de edição.
 * O originalPdfBuffer NUNCA deve ser alterado (ADR-001).
 */
export interface StudyDocument {
  id: string
  name: string
  /** Buffer binário do PDF original — imutável. */
  originalPdfBuffer: ArrayBuffer
  editLayer: EditLayer
}

/** Candidato de campo detectado por heurística (ADR-004). */
export interface DetectionCandidate {
  id: string
  pageIndex: number
  position: RelativePosition
  /** true quando o usuário aceitou a sugestão. */
  accepted?: boolean
}

/** Dimensões reais de uma página em pontos PDF. */
export interface PageDimensions {
  width: number
  height: number
}
