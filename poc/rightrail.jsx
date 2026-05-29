// rightrail.jsx — parameters for the grid module + paper/export.

function RightRail({ doc, setDoc, art, exportStats, onExport, onRegen }) {
  const g = doc.grid;
  const setG = (patch) => setDoc(d => ({ ...d, grid: { ...d.grid, ...patch } }));
  const setColl = (id, patch) => setDoc(d => ({ ...d, collections: d.collections.map(c => c.id === id ? { ...c, ...patch } : c) }));

  const minMM = art.stats.minCell === Infinity ? 0 : art.stats.minCell;
  const tooSmall = minMM > 0 && minMM < g.threshold;

  return (
    <aside className="rail rail--r">
      {/* ---- module header ---- */}
      <div className="sec">
        <div className="ctl-h">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <window.Ico name="grid-3x3" size={16} style={{ color: 'var(--accent)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500 }}>grid</span>
          </div>
          <button className="btn btn--ghost btn--icon" title="regenerar (R)" onClick={onRegen}>
            <window.Ico name="dices" size={15} />
          </button>
        </div>
        <p className="help" style={{ margin: 0 }}>Módulo principal — define el contrato <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>render(doc, capa)</code>. Subdivide el lienzo y delega cada celda a una colección.</p>
      </div>

      {/* ---- grid params ---- */}
      <div className="sec">
        <div className="sec__h"><span className="sec__t">Grilla</span></div>
        <div className="row2">
          <div className="field">
            <div className="ctl-h"><span className="lbl">Filas</span></div>
            <window.Stepper value={g.rows} min={1} max={16} onChange={v => setG({ rows: v })} />
          </div>
          <div className="field">
            <div className="ctl-h"><span className="lbl">Columnas</span></div>
            <window.Stepper value={g.cols} min={1} max={16} onChange={v => setG({ cols: v })} />
          </div>
        </div>

        <div className="field">
          <div className="ctl-h"><span className="lbl">Profundidad de subgrillas</span><span className="num">{g.depth}</span></div>
          <input className="rg" type="range" min={0} max={4} step={1} value={g.depth} onChange={e => setG({ depth: +e.target.value })} />
        </div>
        <div className="field">
          <div className="ctl-h"><span className="lbl">Prob. de subdivisión</span><span className="num">{Math.round(g.splitProb * 100)}%</span></div>
          <input className="rg" type="range" min={0} max={1} step={0.05} value={g.splitProb} onChange={e => setG({ splitProb: +e.target.value })} />
        </div>

        <div className="ctl-h"><span className="lbl">Grilla irregular (pesos)</span><window.SwitchT on={g.irregular} onChange={v => setG({ irregular: v })} /></div>
        <div className="ctl-h"><span className="lbl">Mostrar estructura</span><window.SwitchT on={doc.structure} onChange={v => setDoc(d => ({ ...d, structure: v }))} /></div>
      </div>

      {/* ---- resolution / 2mm warning ---- */}
      <div className="sec">
        <div className="sec__h"><span className="sec__t">Resolución física</span></div>
        <div className="field">
          <div className="ctl-h"><span className="lbl">Umbral mínimo</span><span className="num">{g.threshold.toFixed(1)} mm</span></div>
          <input className="rg" type="range" min={0.5} max={5} step={0.5} value={g.threshold} onChange={e => setG({ threshold: +e.target.value })} />
        </div>
        {tooSmall ? (
          <div className="callout warn">
            <window.Ico name="triangle-alert" size={15} />
            <span>Celda más chica <b>{minMM.toFixed(1)} mm</b> &lt; umbral <b>{g.threshold} mm</b>. La pluma puede emborronar a esta escala — reduce profundidad o filas.</span>
          </div>
        ) : (
          <div className="callout ok">
            <window.Ico name="check" size={15} />
            <span>Celda más chica <b>{minMM.toFixed(1)} mm</b> — dentro del umbral.</span>
          </div>
        )}
      </div>

      {/* ---- collections ---- */}
      <div className="sec">
        <div className="sec__h"><span className="sec__t">Colecciones</span><span className="sec__t" style={{ letterSpacing: 0 }}>{doc.collections.filter(c => c.on).length}/{doc.collections.length}</span></div>
        <div className="colls">
          {doc.collections.map(c => (
            <div key={c.id} className={'coll' + (c.on ? '' : ' is-off')} onClick={() => setColl(c.id, { on: !c.on })}>
              <span className={'check' + (c.on ? ' on' : '')} />
              {c.id === 'silence'
                ? <span className="sw" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mute-2)', fontSize: 14 }}>·</span>
                : <window.CollThumb id={c.id} />}
              <div className="cmeta">
                <div className="cname">{c.id}</div>
                <div className="cwt">peso {c.weight}</div>
              </div>
              <div onClick={e => e.stopPropagation()} style={{ width: 64, opacity: c.on ? 1 : 0.4 }}>
                <input className="rg" type="range" min={1} max={6} step={1} value={c.weight} disabled={!c.on} onChange={e => setColl(c.id, { weight: +e.target.value })} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- paper ---- */}
      <div className="sec">
        <div className="sec__h"><span className="sec__t">Papel</span></div>
        <div className="row2">
          <div className="field">
            <label>Formato</label>
            <window.Seg value={doc.paperId}
              options={[{ value: 'a4', label: 'A4' }, { value: 'a5', label: 'A5' }, { value: 'sq', label: '□' }]}
              onChange={v => setDoc(d => ({ ...d, paperId: v }))} />
          </div>
          <div className="field">
            <label>Orientación</label>
            <window.Seg value={doc.landscape ? 'l' : 'p'}
              options={[{ value: 'p', icon: 'rectangle-vertical', label: '' }, { value: 'l', icon: 'rectangle-horizontal', label: '' }]}
              onChange={v => setDoc(d => ({ ...d, landscape: v === 'l' }))} />
          </div>
        </div>
        <div className="field">
          <div className="ctl-h"><span className="lbl">Margen</span><span className="num">{doc.margin} mm</span></div>
          <input className="rg" type="range" min={4} max={40} step={1} value={doc.margin} onChange={e => setDoc(d => ({ ...d, margin: +e.target.value }))} />
        </div>
      </div>

      {/* ---- export ---- */}
      <div className="sec">
        <div className="sec__h"><span className="sec__t">Exportar</span></div>
        <div className="kv"><span className="k">formato</span><span className="v">{exportStats.size}</span></div>
        <div className="kv"><span className="k">capas visibles</span><span className="v">{exportStats.layers}</span></div>
        <div className="kv"><span className="k">trazos</span><span className="v">{exportStats.prims}</span></div>
        <div className="kv"><span className="k">celdas</span><span className="v">{art.cellCount}</span></div>
        <div className="callout" style={{ background: 'var(--surface-tint)', border: '1px solid var(--hairline)', color: 'var(--mute)' }}>
          <window.Ico name="shield-check" size={15} />
          <span>Al exportar se sanitiza el SVG: se eliminan rellenos, filtros y degradados.</span>
        </div>
        <button className="btn btn--primary" style={{ width: '100%', height: 34 }} onClick={onExport}>
          <window.Ico name="download" size={15} />Exportar SVG
        </button>
      </div>
    </aside>
  );
}

window.RightRail = RightRail;
