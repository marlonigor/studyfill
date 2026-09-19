/**
 * Módulo de exportação (ADR-009).
 *
 * Gera um novo PDF sobrepondo os TextBoxes da camada de edição
 * sobre o PDF original usando pdf-lib. O original nunca é modificado.
 *
 * Suporta:
 * - PDF completo com todas as páginas e respostas
 * - Somente páginas respondidas (extração inteligente de páginas com anotações)
 * - Aplainamento vetorial nativo (flatten)
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import type { StudyDocument, TextBoxElement } from '../../types'
import { relativeToPdfPoints } from '../elements/coordinates'

export interface ExportOptions {
  onlyAnsweredPages?: boolean
  flatten?: boolean
}

/**
 * Exporta o documento: carrega o PDF original e sobrepõe os TextBoxes.
 * Retorna os bytes do novo PDF.
 */
export async function exportDocument(
  doc: StudyDocument,
  options: ExportOptions = {},
): Promise<Uint8Array> {
  const originalPdf = await PDFDocument.load(doc.originalPdfBuffer)
  const textBoxes = doc.editLayer.elements.filter(
    (el): el is TextBoxElement => el.type === 'textbox' && el.content.trim().length > 0,
  )

  let targetDoc = originalPdf
  // Mapeamento de página original para página de destino
  const pageMap = new Map<number, number>()

  if (options.onlyAnsweredPages && textBoxes.length > 0) {
    targetDoc = await PDFDocument.create()
    const answeredPageIndices = Array.from(new Set(textBoxes.map(b => b.pageIndex))).sort((a, b) => a - b)
    const copiedPages = await targetDoc.copyPages(originalPdf, answeredPageIndices)
    copiedPages.forEach((page, i) => {
      targetDoc.addPage(page)
      pageMap.set(answeredPageIndices[i], i)
    })
  }

  const fontSans = await targetDoc.embedFont(StandardFonts.Helvetica)
  const fontSerif = await targetDoc.embedFont(StandardFonts.TimesRoman)
  const fontMono = await targetDoc.embedFont(StandardFonts.Courier)
  const pages = targetDoc.getPages()

  for (const box of textBoxes) {
    const targetPageIndex = options.onlyAnsweredPages && textBoxes.length > 0
      ? pageMap.get(box.pageIndex)
      : box.pageIndex

    if (targetPageIndex === undefined) continue
    const page = pages[targetPageIndex]
    if (!page) continue

    const selectedFont =
      box.fontFamily === 'Source Serif 4'
        ? fontSerif
        : box.fontFamily === 'JetBrains Mono'
        ? fontMono
        : fontSans

    const { width: pageW, height: pageH } = page.getSize()
    const pts = relativeToPdfPoints(box.position, pageW, pageH)

    const hexColor = box.fontColor.startsWith('#') ? box.fontColor.slice(1) : '000000'
    const r = parseInt(hexColor.slice(0, 2), 16) / 255
    const g = parseInt(hexColor.slice(2, 4), 16) / 255
    const b = parseInt(hexColor.slice(4, 6), 16) / 255

    // Desenha um fundo branco semitransparente para legibilidade
    page.drawRectangle({
      x: pts.x,
      y: pts.y,
      width: pts.width,
      height: pts.height,
      color: rgb(1, 1, 1),
      opacity: 0.88,
    })

    page.drawText(box.content, {
      x: pts.x + 2,
      y: pts.y + pts.height / 2 - box.fontSize / 2,
      size: box.fontSize,
      font: selectedFont,
      color: rgb(r, g, b),
      maxWidth: pts.width - 4,
    })
  }

  return targetDoc.save()
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
