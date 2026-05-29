import { useState, FormEvent, useEffect } from 'react'
import { PaperFormat, PAPER_DIMENSIONS } from '../types'
import { useDocumentStore } from '../store/document'
import { loadAutosave, clearAutosave } from '../lib/persistence'
import styles from './NewDocumentScreen.module.css'

const PAPER_FORMATS = Object.keys(PAPER_DIMENSIONS) as PaperFormat[]

export function NewDocumentScreen() {
  const createDocument = useDocumentStore((s) => s.createDocument)
  const loadDocument = useDocumentStore((s) => s.loadDocument)
  const [name, setName] = useState('Untitled')
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
    <div className={styles.screen}>
      <div className={styles.card}>
        <h1 className={styles.title}>Plotter Studio</h1>

        {showRestore && (
          <div className={styles.restoreBanner}>
            <p className={styles.restoreText}>
              Unsaved session found: <strong>{autosaveName}</strong>
            </p>
            <div className={styles.restoreActions}>
              <button className={styles.restoreBtn} onClick={handleRestore}>
                Restore
              </button>
              <button className={styles.discardBtn} onClick={handleDiscard}>
                Discard
              </button>
            </div>
          </div>
        )}

        <p className={styles.subtitle}>New document</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span>Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
              className={styles.input}
            />
          </label>

          <fieldset className={styles.fieldset}>
            <legend>Paper format</legend>
            <div className={styles.formatGrid}>
              {PAPER_FORMATS.map((f) => {
                const dim = PAPER_DIMENSIONS[f]
                return (
                  <label key={f} className={`${styles.formatOption} ${format === f ? styles.selected : ''}`}>
                    <input
                      type="radio"
                      name="format"
                      value={f}
                      checked={format === f}
                      onChange={() => setFormat(f)}
                    />
                    <span className={styles.formatLabel}>{f}</span>
                    <span className={styles.formatDim}>
                      {dim.width} × {dim.height} mm
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <button type="submit" className={styles.createBtn}>
            Create document
          </button>
        </form>
      </div>
    </div>
  )
}
