import { PaperDimensions, PaperFormat, PlotterDocument, PAPER_DIMENSIONS } from '../types'

export const PAPER_FORMAT_OPTIONS: { value: PaperFormat; label: string }[] = [
  { value: 'A4', label: 'A4' },
  { value: 'A3', label: 'A3' },
  { value: 'Letter', label: 'Letter' },
  { value: 'Legal', label: 'Legal' },
  { value: 'Square', label: '1:1' },
]

export function isSquareFormat(format: PaperFormat): boolean {
  return format === 'Square'
}

/** Returns drawable paper size in mm, applying landscape when applicable. */
export function getPaperDimensions(
  doc: Pick<PlotterDocument, 'paperFormat' | 'landscape'>,
): PaperDimensions {
  const base = PAPER_DIMENSIONS[doc.paperFormat]
  if (isSquareFormat(doc.paperFormat)) return base
  if (doc.landscape) return { width: base.height, height: base.width }
  return base
}

export function formatPaperLabel(doc: Pick<PlotterDocument, 'paperFormat' | 'landscape'>): string {
  const { width, height } = getPaperDimensions(doc)
  const orient = isSquareFormat(doc.paperFormat) ? '' : doc.landscape ? ' · apaisado' : ' · vertical'
  return `${doc.paperFormat}${orient} · ${width}×${height} mm`
}
