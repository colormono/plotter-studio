import { useDocumentStore } from '../store/document'
import { COLLECTIONS } from '../lib/collections'
import { collectionsForTechnique } from '../lib/collection-kinds'
import { isContentLayer } from '../lib/module-layers'
import { EMPTY_SPACE_MAX } from '../lib/art-engine'
import type { Layer, LayerRole } from '../types'

const GRID_WEIGHT_MAX = 10

const FIXED_LAYER_NOTE: Partial<Record<LayerRole, string>> = {
  registration: 'Marcas de esquina para alinear el papel. No usa colección.',
  'cut-border': 'Recorrido de corte del borde. No usa colección.',
  frame: 'Marco del área de dibujo. No usa colección.',
  structure: 'Contorno de las celdas. Se dibuja con la pluma de esta capa.',
}

function techniqueLabel(technique: Layer['technique']): string {
  if (technique === 'cut') return 'corte'
  if (technique === 'mixed') return 'mixto'
  return 'dibujo'
}

function LayerFocus({ layer }: { layer: Layer }) {
  const detail = isContentLayer(layer) ? techniqueLabel(layer.technique) : 'capa fija'
  return (
    <div className="sec__h">
      <span className="sec__t">Capa activa</span>
      <span className="layer-active">
        <span className="pen" style={{ background: layer.penColor }} aria-hidden />
        <span className="layer-active__name">{layer.name}</span>
        <span aria-hidden>·</span>
        <span>{detail}</span>
      </span>
    </div>
  )
}

export function CollectionsPanel() {
  const document = useDocumentStore((s) => s.document)
  const activeLayerId = useDocumentStore((s) => s.activeLayerId)
  const updateLayer = useDocumentStore((s) => s.updateLayer)

  if (!document || document.moduleId !== 'grid') return null

  const activeLayer = document.layers.find((l) => l.id === activeLayerId)
  if (!activeLayer) return null

  if (!isContentLayer(activeLayer)) {
    const note =
      (activeLayer.layerRole && FIXED_LAYER_NOTE[activeLayer.layerRole]) ||
      'Esta capa no usa una colección.'
    return (
      <div className="sec">
        <LayerFocus layer={activeLayer} />
        <p className="help">{note}</p>
      </div>
    )
  }

  const allowed = collectionsForTechnique(activeLayer.technique)
  const options = COLLECTIONS.filter((c) => allowed.includes(c.id))

  return (
    <div className="sec">
      <LayerFocus layer={activeLayer} />
      <div className="colls">
        {options.map((collection) => {
          const selected = activeLayer.primaryCollection === collection.id
          return (
            <div
              key={collection.id}
              className={'coll' + (selected ? '' : ' is-off')}
              onClick={() =>
                updateLayer(activeLayer.id, { primaryCollection: collection.id })
              }
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                updateLayer(activeLayer.id, { primaryCollection: collection.id })
              }
              role="button"
              tabIndex={0}
              aria-pressed={selected}
            >
              <span className={'check' + (selected ? ' on' : '')} aria-hidden />
              <div className="cmeta">
                <div className="cname">{collection.label}</div>
                <div className="cwt">{collection.kind === 'cut' ? 'corte' : 'dibujo'}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="field" style={{ marginTop: 10 }}>
        <div className="ctl-h">
          <span className="lbl">Peso en grilla</span>
          <span className="num">{activeLayer.collectionWeight}</span>
        </div>
        <input
          className="rg"
          type="range"
          min={0}
          max={GRID_WEIGHT_MAX}
          step={1}
          value={Math.min(GRID_WEIGHT_MAX, Math.max(0, activeLayer.collectionWeight))}
          onChange={(e) =>
            updateLayer(activeLayer.id, { collectionWeight: +e.target.value })
          }
          aria-label="Peso de la capa en la grilla"
        />
        <p className="help" style={{ marginTop: 6 }}>
          0 no asigna celdas. Con varias capas, un peso mayor recibe más celdas.
        </p>
      </div>

      <div className="field" style={{ marginTop: 10 }}>
        <div className="ctl-h">
          <span className="lbl">Espacio vacío</span>
          <span className="num">{activeLayer.emptySpace ?? 0}</span>
        </div>
        <input
          className="rg"
          type="range"
          min={0}
          max={EMPTY_SPACE_MAX}
          step={1}
          value={Math.min(EMPTY_SPACE_MAX, Math.max(0, activeLayer.emptySpace ?? 0))}
          onChange={(e) => updateLayer(activeLayer.id, { emptySpace: +e.target.value })}
          aria-label="Espacio vacío en celdas asignadas"
        />
        <p className="help" style={{ marginTop: 6 }}>
          0 no deja celdas vacías. {EMPTY_SPACE_MAX} deja vacías todas las de esta capa.
        </p>
      </div>
    </div>
  )
}
