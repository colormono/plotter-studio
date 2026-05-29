// app.jsx — Plotter Studio editor shell

const PAPERS = { a4: [297, 210], a5: [210, 148], sq: [210, 210] };
function paperDims(d) {
  const [a, b] = PAPERS[d.paperId];
  if (d.paperId === 'sq') return { w: a, h: b };
  return d.landscape ? { w: a, h: b } : { w: b, h: a };
}
const PAPER_LABEL = { a4: 'A4', a5: 'A5', sq: '210²' };

const LAYER_DEFS = [
  { id: 'accent',  name: 'Figuras',  penColor: '#2F5D8A', penName: 'azul · 0.30mm',  technique: 'mixed' },
  { id: 'organic', name: 'Texturas', penColor: '#0A0A0A', penName: 'negro · 0.30mm', technique: 'draw' },
  { id: 'fill',    name: 'Tramas',   penColor: '#0A0A0A', penName: 'negro · 0.30mm', technique: 'draw' },
  { id: 'frame',   name: 'Marco',    penColor: '#0A0A0A', penName: 'negro · 0.30mm', technique: 'draw' },
  { id: 'cut',     name: 'Corte',    penColor: '#DC2626', penName: 'rojo · corte',   technique: 'cut' },
];
// render order = bottom..top: cut, frame, fill, organic, accent
const RENDER_ORDER = ['cut', 'frame', 'fill', 'organic', 'accent'];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "regular",
  "uiFont": "inter",
  "paper": "#ffffff",
  "reference": true,
  "accent": true
}/*EDITMODE-END*/;

function svgString(p) {
  const a = 'fill="none" vector-effect="non-scaling-stroke"';
  if (p.k === 'line') return `<line ${a} x1="${p.x1.toFixed(2)}" y1="${p.y1.toFixed(2)}" x2="${p.x2.toFixed(2)}" y2="${p.y2.toFixed(2)}"/>`;
  if (p.k === 'path') return `<path ${a} d="${p.d.trim()}"/>`;
  if (p.k === 'circle') return `<circle ${a} cx="${p.cx.toFixed(2)}" cy="${p.cy.toFixed(2)}" r="${p.r.toFixed(2)}"/>`;
  if (p.k === 'rect') { const t = p.rot ? ` transform="rotate(${p.rot} ${p.cx} ${p.cy})"` : ''; return `<rect ${a} x="${p.x.toFixed(2)}" y="${p.y.toFixed(2)}" width="${p.w.toFixed(2)}" height="${p.h.toFixed(2)}" rx="${(p.rx || 0).toFixed(2)}"${t}/>`; }
  if (p.k === 'poly') { const pts = p.pts.map(q => q.map(n => n.toFixed(2)).join(',')).join(' '); return `<${p.closed ? 'polygon' : 'polyline'} ${a} points="${pts}"/>`; }
  return '';
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [doc, setDoc] = React.useState({
    name: 'untitled',
    paperId: 'a4', landscape: true, margin: 14,
    seed: 42,
    structure: true,
    grid: { rows: 5, cols: 7, depth: 2, splitProb: 0.34, irregular: false, threshold: 2 },
    collections: [
      { id: 'silence', on: true, weight: 5 },
      { id: 'regular-textures', on: true, weight: 4 },
      { id: 'irregular-textures', on: true, weight: 2 },
      { id: 'geometric-shapes', on: true, weight: 3 },
      { id: 'dice', on: true, weight: 1 },
    ],
  });
  const [vis, setVis] = React.useState({ cut: true, frame: true, fill: true, organic: true, accent: true });
  const [sel, setSel] = React.useState('accent');
  const [moduleId, setModuleId] = React.useState('grid');
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const vpRef = React.useRef(null);
  const [vp, setVp] = React.useState({ w: 800, h: 600 });

  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  React.useEffect(() => {
    const el = vpRef.current; if (!el) return;
    const ro = new ResizeObserver(() => setVp({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el); return () => ro.disconnect();
  }, []);

  const paper = paperDims(doc);
  const art = React.useMemo(() => generateArt({ ...doc, paper }), [doc, paper.w, paper.h]);

  const fit = Math.min((vp.w * 0.82) / paper.w, (vp.h * 0.82) / paper.h);
  const scale = fit * zoom;

  const layers = LAYER_DEFS.map(d => ({ ...d, visible: vis[d.id] }));

  const exportStats = React.useMemo(() => {
    let prims = 0, n = 0;
    for (const k of RENDER_ORDER) if (vis[k]) { prims += art.layers[k].length; n++; }
    return { size: `${PAPER_LABEL[doc.paperId]} · ${paper.w}×${paper.h} mm`, layers: n, prims };
  }, [art, vis, doc.paperId, paper.w, paper.h]);

  const regen = () => setDoc(d => ({ ...d, seed: (d.seed * 1103515245 + 12345) >>> 0 || 1 }));

  React.useEffect(() => {
    const k = (e) => { if (e.key === 'r' && !e.metaKey && !e.ctrlKey && e.target.tagName !== 'INPUT') regen(); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, []);

  const exportSvg = () => {
    let body = '';
    for (const id of RENDER_ORDER) {
      if (!vis[id]) continue;
      const def = LAYER_DEFS.find(l => l.id === id);
      const prims = art.layers[id];
      if (!prims.length) continue;
      body += `  <g id="${def.name}" data-technique="${def.technique}" stroke="${def.penColor}" stroke-width="0.3" stroke-linecap="round" stroke-linejoin="round" fill="none">\n`;
      body += prims.map(p => '    ' + svgString(p)).join('\n');
      body += '\n  </g>\n';
    }
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${paper.w}mm" height="${paper.h}mm" viewBox="0 0 ${paper.w} ${paper.h}">\n${body}</svg>\n`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${doc.name}.svg`; a.click();
    URL.revokeObjectURL(url);
  };

  // pan handler
  const onDown2 = (e) => { if (e.button !== 0) return; const base = { ...pan }; const sx = e.clientX, sy = e.clientY;
    const mv = (ev) => setPan({ x: base.x + (ev.clientX - sx), y: base.y + (ev.clientY - sy) });
    const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
  };

  const rootCls = `density-${t.density}` + (t.accent ? '' : ' no-accent');
  const rootStyle = {
    '--font-ui': t.uiFont === 'geist' ? "'Geist', ui-sans-serif, system-ui, sans-serif" : "'Inter', ui-sans-serif, system-ui, sans-serif",
    '--paper': t.paper,
  };

  return (
    <div className={'shell ' + rootCls} style={rootStyle}>
      {/* topbar */}
      <header className="topbar">
        <div className="brand"><span className="glyph" /><span className="wm">Plotter Studio</span></div>
        <div style={{ width: 1, height: 22, background: 'var(--hairline)' }} />
        <div className="docname"><window.Ico name="file" size={14} style={{ color: 'var(--mute)' }} /><span className="nm">{doc.name}</span><span className="ext">.plotter.json</span></div>
        <div className="tb-sp" />
        <div className="tb-meta"><span><b>{art.cellCount}</b> celdas</span><span><b>{exportStats.prims}</b> trazos</span></div>
        <button className="btn" onClick={regen}><window.Ico name="dices" size={14} />Regenerar</button>
        <button className="btn btn--primary" onClick={exportSvg}><window.Ico name="download" size={14} />Exportar</button>
      </header>

      {/* left */}
      <LeftRail moduleId={moduleId} onModule={setModuleId} layers={layers} sel={sel} onSel={setSel}
        onToggle={(id) => setVis(v => ({ ...v, [id]: !v[id] }))} />

      {/* stage */}
      <main className={'stage' + (t.reference ? '' : ' no-ref')} style={t.reference ? undefined : { backgroundImage: 'none' }}>
        <div className="viewport" ref={vpRef} onPointerDown={onDown2} style={{ cursor: 'grab' }}>
          <div className="paper-wrap" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}>
            <svg className="paper" width={paper.w} height={paper.h} viewBox={`0 0 ${paper.w} ${paper.h}`}
              style={{ background: 'var(--paper)' }}>
              {RENDER_ORDER.map(id => {
                if (!vis[id]) return null;
                const def = LAYER_DEFS.find(l => l.id === id);
                return <window.PrimLayer key={id} prims={art.layers[id]} color={def.penColor} sw={0.32} faintColor="#C9C9C9" />;
              })}
            </svg>
          </div>
        </div>

        <div className="stage__bar">
          <div className="z">
            <span className="zbtn" onClick={() => setZoom(z => Math.max(0.3, +(z - 0.15).toFixed(2)))}><window.Ico name="minus" size={13} /></span>
            <span className="zval">{Math.round(scale * 100)}%</span>
            <span className="zbtn" onClick={() => setZoom(z => Math.min(4, +(z + 0.15).toFixed(2)))}><window.Ico name="plus" size={13} /></span>
            <span className="zbtn" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} title="ajustar"><window.Ico name="maximize" size={13} /></span>
          </div>
          <div className="sp" />
          <span className="hint">{PAPER_LABEL[doc.paperId]} · {paper.w} × {paper.h} mm · módulo grid</span>
          <div className="sp" />
          <span className="hint">arrastra para mover · R regenera</span>
        </div>
      </main>

      {/* right */}
      <RightRail doc={doc} setDoc={setDoc} art={art} exportStats={exportStats} onExport={exportSvg} onRegen={regen} />

      {/* tweaks */}
      <TweaksPanel>
        <TweakSection label="Interfaz" />
        <TweakRadio label="Densidad" value={t.density} options={['compact', 'regular', 'comfy']} onChange={v => setTweak('density', v)} />
        <TweakRadio label="Tipografía UI" value={t.uiFont} options={['inter', 'geist']} onChange={v => setTweak('uiFont', v)} />
        <TweakToggle label="Acento coral" value={t.accent} onChange={v => setTweak('accent', v)} />
        <TweakSection label="Lienzo" />
        <TweakColor label="Color del papel" value={t.paper} options={['#ffffff', '#FBF8F2', '#F6F8FA', '#F3F1EC']} onChange={v => setTweak('paper', v)} />
        <TweakToggle label="Cuadrícula de referencia" value={t.reference} onChange={v => setTweak('reference', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
