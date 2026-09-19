/**
 * Módulo de exportação (ADR-009).
 *
 * Gera um novo PDF sobrepondo os TextBoxes da camada de edição
 * sobre o PDF original usando pdf-lib. O original nunca é modificado.
 *
 * Exemplo de uso:
 *   const pdfBytes = await exportDocument(studyDoc)
 *   downloadPdf(pdfBytes, 'studyfill-export.pdf')
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import type { StudyDocument, TextBoxElement } from '../../types'
import { relativeToPdfPoints } from '../elements/coordinates'

/**
 * Exporta o documento: carrega o PDF original e sobrepõe os TextBoxes.
 * Retorna os bytes do novo PDF.
 */
export async function exportDocument(doc: StudyDocument): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(doc.originalPdfBuffer)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const pages = pdfDoc.getPages()

  const textBoxes = doc.editLayer.elements.filter((el): el is TextBoxElement => el.type === 'textbox')

  for (const box of textBoxes) {
    const page = pages[box.pageIndex]
    if (!page) continue

    const { width: pageW, height: pageH } = page.getSize()
    const pts = relativeToPdfPoints(box.position, pageW, pageH)

    if (!box.content.trim()) continue

    const hexColor = box.fontColor.startsWith('#') ? box.fontColor.slice(1) : '000000'
    const r = parseInt(hexColor.slice(0, 2), 16) / 255
    const g = parseInt(hexColor.slice(2, 4), 16) / 255
    const b = parseInt(hexColor.slice(4, 6), 16) / 255

    // Desenha um fundo branco semitransparente para melhor legibilidade
    page.drawRectangle({
      x: pts.x,
      y: pts.y,
      width: pts.width,
      height: pts.height,
      color: rgb(1, 1, 1),
      opacity: 0.85,
    })

    page.drawText(box.content, {
      x: pts.x + 2,
      y: pts.y + pts.height / 2 - box.fontSize / 2,
      size: box.fontSize,
      font,
      color: rgb(r, g, b),
      maxWidth: pts.width - 4,
    })
  }

  return pdfDoc.save()
}

/**
 * Dispara o download do PDF exportado no navegador.
 *
 * @param bytes    - bytes gerados pelo pdf-lib
 * @param filename - nome do arquivo (sem extensão)
 */
export function downloadPdf(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  anchor.click()
  URL.revokeObjectURL(url)
}
