import { useDocumentStore } from '../store/document'
import { COLLECTIONS } from '../lib/collections'

export function CollectionsPanel() {
  const document = useDocumentStore((s) => s.document)
  const updateCollection = useDocumentStore((s) => s.updateCollection)

  if (!document) return null

  const activeCount = document.collections.filter((c) => c.on).length

  return (
    <div className="sec">
      <div className="sec__h">
        <span className="sec__t">Colecciones</span>
        <span className="sec__t" style={{ letterSpacing: 0 }}>
          {activeCount}/{document.collections.length}
        </span>
      </div>
      <div className="colls">
        {document.collections.map((cw) => {
          const meta = COLLECTIONS.find((c) => c.id === cw.id)
          return (
            <div
              key={cw.id}
              className={'coll' + (cw.on ? '' : ' is-off')}
              onClick={() => updateCollection(cw.id, { on: !cw.on })}
              onKeyDown={(e) => e.key === 'Enter' && updateCollection(cw.id, { on: !cw.on })}
              role="button"
              tabIndex={0}
            >
              <span className={'check' + (cw.on ? ' on' : '')} aria-hidden />
              <div className="cmeta">
                <div className="cname">{meta?.label ?? cw.id}</div>
                <div className="cwt">peso {cw.weight}</div>
              </div>
              <div
                className="wt"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <input
                  className="rg"
                  type="range"
                  min={1}
                  max={6}
                  step={1}
                  value={cw.weight}
                  disabled={!cw.on}
                  onChange={(e) => updateCollection(cw.id, { weight: +e.target.value })}
                  aria-label={`Peso de ${cw.id}`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
