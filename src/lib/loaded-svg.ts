import type { PaperDimensions } from '../types'
import type { LoadedSvgViewBox, SerializedSvgNode } from './svg-import'
import { countSvgDrawables, normalizeSvgNodes } from './svg-import'

export interface LoadedSvgPlacement {
  /** Center X on paper in mm */
  x: number
  /** Center Y on paper in mm */
  y: number
  /** Uniform scale applied to viewBox dimensions */
  scale: number
  /** Rotation in degrees (multiples of 90) */
  rotation: number
}

export interface LoadedSvgConfig {
  groupId: string
  sourceFileName: string
  viewBox: LoadedSvgViewBox
  nodes: SerializedSvgNode[]
  /** @deprecated Use nodes */
  elements?: SerializedSvgNode[]
  placement: LoadedSvgPlacement
}

export function getConfigNodes(config: LoadedSvgConfig): SerializedSvgNode[] {
  return normalizeSvgNodes(config)
}

export function getConfigStrokeCount(config: LoadedSvgConfig): number {
  return countSvgDrawables(getConfigNodes(config))
}

export function defaultPlacement(
  viewBox: LoadedSvgViewBox,
  paper: PaperDimensions,
  margin: number,
): LoadedSvgPlacement {
  const availW = Math.max(paper.width - margin * 2, 1)
  const availH = Math.max(paper.height - margin * 2, 1)
  const scale = Math.min(availW / viewBox.width, availH / viewBox.height)

  return {
    x: paper.width / 2,
    y: paper.height / 2,
    scale,
    rotation: 0,
  }
}

export function normalizeRotation(degrees: number): number {
  const normalized = ((degrees % 360) + 360) % 360
  return Math.round(normalized / 90) * 90 % 360
}

export function drawingSizeMm(
  viewBox: LoadedSvgViewBox,
  placement: LoadedSvgPlacement,
): { width: number; height: number } {
  let width = viewBox.width * placement.scale
  let height = viewBox.height * placement.scale
  if (placement.rotation % 180 !== 0) {
    ;[width, height] = [height, width]
  }
  return { width, height }
}

export function buildTransform(viewBox: LoadedSvgViewBox, placement: LoadedSvgPlacement): string {
  const cx = viewBox.x + viewBox.width / 2
  const cy = viewBox.y + viewBox.height / 2
  const { x, y, scale, rotation } = placement
  return `translate(${x} ${y}) rotate(${rotation}) scale(${scale}) translate(${-cx} ${-cy})`
}

export function isLoadedSvgConfig(value: unknown): value is LoadedSvgConfig {
  if (!value || typeof value !== 'object') return false
  const cfg = value as LoadedSvgConfig
  const nodes = normalizeSvgNodes(cfg)
  return (
    typeof cfg.groupId === 'string' &&
    typeof cfg.sourceFileName === 'string' &&
    cfg.viewBox != null &&
    typeof cfg.viewBox.width === 'number' &&
    nodes.length > 0 &&
    cfg.placement != null &&
    typeof cfg.placement.scale === 'number'
  )
}
