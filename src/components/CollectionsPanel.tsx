import { useDocumentStore } from '../store/document'
import { COLLECTIONS } from '../lib/collections'
import { collectionsForTechnique } from '../lib/collection-kinds'
import { isContentLayer } from '../lib/module-layers'

export function CollectionsPanel() {
  const document = useDocumentStore((s) => s.document)
  const activeLayerId = useDocumentStore((s) => s.activeLayerId)
  const updateLayer = useDocumentStore((s) => s.updateLayer)

  if (!document || document.moduleId !== 'grid') return null

  const activeLayer = document.layers.find((l) => l.id === activeLayerId)
  if (!activeLayer || !isContentLayer(activeLayer)) {
    return (
      <div className="sec">
        <div className="sec__h">
          <span className="sec__t">Colección</span>
        </div>
        <p className="help">Selecciona una capa de contenido para asignar una colección.</p>
      </div>
    )
  }

  const allowed = collectionsForTechnique(activeLayer.technique)
  const options = COLLECTIONS.filter((c) => allowed.includes(c.id))

  return (
    <div className="sec">
      <div className="sec__h">
        <span className="sec__t">Colección</span>
        <span className="sec__t" style={{ letterSpacing: 0, fontWeight: 400 }}>
          {activeLayer.name}
        </span>
      </div>
      <p className="help" style={{ marginBottom: 8 }}>
        {activeLayer.technique === 'cut'
          ? 'Formas geométricas para corte.'
          : 'Texturas y tramas para dibujo.'}
      </p>
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
          min={1}
          max={6}
          step={1}
          value={activeLayer.collectionWeight}
          onChange={(e) =>
            updateLayer(activeLayer.id, { collectionWeight: +e.target.value })
          }
          aria-label="Peso de la capa en la grilla"
        />
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
          max={6}
          step={1}
          value={activeLayer.emptySpace ?? 0}
          onChange={(e) => updateLayer(activeLayer.id, { emptySpace: +e.target.value })}
          aria-label="Espacio vacío en celdas asignadas"
        />
        <p className="help" style={{ marginTop: 6 }}>
          Probabilidad de dejar vacía una celda asignada a esta capa.
        </p>
      </div>
    </div>
  )
}
