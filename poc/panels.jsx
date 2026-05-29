// panels.jsx — shared controls, primitive renderer, left & right rails.

const Ico = ({ name, size = 16, style, ...r }) => (
  <i data-lucide={name} style={{ width: size, height: size, display: 'inline-flex', ...style }} {...r} />
);

// ---- primitive -> svg element ----
function primEl(p, i) {
  const common = { key: i, fill: 'none', vectorEffect: 'non-scaling-stroke' };
  if (p.k === 'line') return <line {...common} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} />;
  if (p.k === 'path') return <path {...common} d={p.d} />;
  if (p.k === 'circle') return <circle {...common} cx={p.cx} cy={p.cy} r={p.r} fill={p.dot ? 'currentColor' : 'none'} />;
  if (p.k === 'rect') {
    const t = p.rot ? `rotate(${p.rot} ${p.cx} ${p.cy})` : undefined;
    return <rect {...common} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.rx || 0} transform={t} />;
  }
  if (p.k === 'poly') {
    const pts = p.pts.map(q => q.join(',')).join(' ');
    return p.closed ? <polygon {...common} points={pts} /> : <polyline {...common} points={pts} />;
  }
  return null;
}
function PrimLayer({ prims, color, sw, faintColor }) {
  return (
    <g stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      {prims.map((p, i) => p.faint
        ? <g key={i} stroke={faintColor} strokeWidth={sw * 0.6}>{primEl(p, i)}</g>
        : primEl(p, i))}
    </g>
  );
}

// ---- tiny controls ----
function Stepper({ value, min = 1, max = 99, onChange }) {
  return (
    <div className="stepper">
      <button onClick={() => onChange(Math.max(min, value - 1))}><Ico name="minus" size={13} /></button>
      <span className="v">{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))}><Ico name="plus" size={13} /></button>
    </div>
  );
}
function Seg({ value, options, onChange }) {
  return (
    <div className="seg">
      {options.map(o => (
        <button key={o.value} className={value === o.value ? 'is-on' : ''} onClick={() => onChange(o.value)}>
          {o.icon && <Ico name={o.icon} size={12} />}{o.label}
        </button>
      ))}
    </div>
  );
}
function SwitchT({ on, onChange }) {
  return <span className={'sw-t' + (on ? '' : ' off')} role="switch" aria-checked={on} onClick={() => onChange(!on)} />;
}

// ---- collection thumbnail (catalog-as-data preview) ----
const THUMB_SEED = { 'regular-textures': 7, 'irregular-textures': 21, 'geometric-shapes': 3, 'dice': 11, 'silence': 1 };
function CollThumb({ id }) {
  const prims = React.useMemo(() => {
    const rng = window.makeRng(THUMB_SEED[id] || 5);
    return window.COLLECTIONS[id].render(rng, { x: 1, y: 1, w: 24, h: 24 });
  }, [id]);
  return (
    <svg className="sw" viewBox="0 0 26 26" preserveAspectRatio="xMidYMid meet">
      <PrimLayer prims={prims} color="#0A0A0A" sw={0.5} />
    </svg>
  );
}

// ===================== LEFT RAIL =====================
const MODULES = [
  { id: 'grid', name: 'grid', icon: 'grid-3x3' },
  { id: 'tictactoe', name: 'tictactoe', icon: 'hash' },
  { id: 'test-sheet', name: 'test-sheet', icon: 'file-text' },
  { id: 'p5', name: 'p5', icon: 'spline', soon: true },
  { id: 'd3', name: 'd3', icon: 'git-fork', soon: true },
  { id: 'threejs', name: 'three.js', icon: 'box', soon: true },
];

function LeftRail({ moduleId, onModule, layers, sel, onSel, onToggle }) {
  return (
    <aside className="rail rail--l">
      <div className="sec">
        <div className="sec__h"><span className="sec__t">Módulo</span></div>
        <div className="mods">
          {MODULES.map(m => (
            <div key={m.id}
              className={'mod' + (moduleId === m.id ? ' is-on' : '') + (m.soon ? ' is-soon' : '')}
              onClick={() => !m.soon && onModule(m.id)}>
              <Ico name={m.icon} size={15} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{m.name}</span>
              {m.soon && <span className="soon">pronto</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="sec" style={{ flex: 1 }}>
        <div className="sec__h">
          <span className="sec__t">Capas</span>
          <span className="sec__a" title="nueva capa"><Ico name="plus" size={14} /></span>
        </div>
        <div className="layers">
          {layers.map(l => (
            <div key={l.id}
              className={'layer' + (sel === l.id ? ' is-sel' : '') + (l.visible ? '' : ' is-hidden')}
              onClick={() => onSel(l.id)}>
              <span className="grip"><Ico name="grip-vertical" size={13} /></span>
              <span className="pen" style={{ background: l.penColor }} />
              <span className="lmeta">
                <span className="lname">{l.name}</span>
                <span className="ltech">{l.penName}</span>
              </span>
              <span className="tech-tag">{l.technique}</span>
              <span className="eye" title={l.visible ? 'ocultar' : 'mostrar'}
                onClick={(e) => { e.stopPropagation(); onToggle(l.id); }}>
                <Ico name={l.visible ? 'eye' : 'eye-off'} size={14} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

Object.assign(window, { Ico, PrimLayer, primEl, Stepper, Seg, SwitchT, CollThumb, LeftRail, MODULES });
