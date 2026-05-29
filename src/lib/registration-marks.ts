import { PlotterDocument } from '../types'
import { getPaperDimensions } from './paper'
import { svgEl } from './svg'

const SW = '0.35'
const MARK = 4.8

/** L-shaped registration marks at the four page corners (inside margin). */
export function renderRegistrationMarks(document: PlotterDocument): SVGElement[] {
  const paper = getPaperDimensions(document)
  const m = document.margin
  const s = MARK
  const paths = [
    `M ${m} ${m + s} L ${m} ${m} L ${m + s} ${m}`,
    `M ${paper.width - m - s} ${m} L ${paper.width - m} ${m} L ${paper.width - m} ${m + s}`,
    `M ${m} ${paper.height - m - s} L ${m} ${paper.height - m} L ${m + s} ${paper.height - m}`,
    `M ${paper.width - m - s} ${paper.height - m} L ${paper.width - m} ${paper.height - m} L ${paper.width - m} ${paper.height - m - s}`,
  ]
  return paths.map((d) =>
    svgEl('path', { d, 'stroke-width': SW, 'vector-effect': 'non-scaling-stroke' }),
  )
}
