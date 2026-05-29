import { useState, FormEvent, useEffect } from 'react'
import { PaperFormat, PAPER_DIMENSIONS } from '../types'
import { PAPER_FORMAT_OPTIONS } from '../lib/paper'
import { useDocumentStore } from '../store/document'
import { loadAutosave, clearAutosave } from '../lib/persistence'

const PAPER_FORMATS = PAPER_FORMAT_OPTIONS.map((o) => o.value)

export function NewDocumentScreen() {
  const createDocument = useDocumentStore((s) => s.createDocument)
  const loadDocument = useDocumentStore((s) => s.loadDocument)
  const [name, setName] = useState('untitled')
  const [format, setFormat] = useState<PaperFormat>('A4')
  const [showRestore, setShowRestore] = useState(false)
  const [autosaveName, setAutosaveName] = useState<string | null>(null)

  useEffect(() => {
    const saved = loadAutosave()
    if (saved) {
      setAutosaveName(saved.name)
      setShowRestore(true)
    }
  }, [])

  function handleRestore() {
    const saved = loadAutosave()
    if (saved) loadDocument(saved)
  }

  function handleDiscard() {
    clearAutosave()
    setShowRestore(false)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    createDocument(trimmed, format)
  }

  return (
    <div className="new-screen">
      <div className="new-card">
        <div className="brand">
          <span className="glyph" aria-hidden />
          <span className="wm">Plotter Studio</span>
        </div>

        {showRestore && (
          <div className="restore-banner">
            <p className="restore-text">
              Sesión sin guardar: <strong>{autosaveName}</strong>
            </p>
            <div className="restore-actions">
              <button type="button" className="btn btn--primary" onClick={handleRestore}>
                Restaurar
              </button>
              <button type="button" className="btn" onClick={handleDiscard}>
                Descartar
              </button>
            </div>
          </div>
        )}

        <p className="new-subtitle">Nuevo documento</p>

        <form onSubmit={handleSubmit} className="new-form">
          <label className="new-field">
            <span>Nombre</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
              className="new-input"
            />
          </label>

          <fieldset className="new-fieldset">
            <legend>Formato de papel</legend>
            <div className="format-grid">
              {PAPER_FORMATS.map((f) => {
                const dim = PAPER_DIMENSIONS[f]
                return (
                  <label
                    key={f}
                    className={'format-option' + (format === f ? ' is-on' : '')}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={f}
                      checked={format === f}
                      onChange={() => setFormat(f)}
                    />
                    <span className="format-label">{f === 'Square' ? '1:1' : f}</span>
                    <span className="format-dim">
                      {dim.width} × {dim.height} mm
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <button type="submit" className="btn btn--primary" style={{ height: 38 }}>
            Crear documento
          </button>
        </form>
      </div>
    </div>
  )
}
