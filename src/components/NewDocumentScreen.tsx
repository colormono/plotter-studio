import { useState, FormEvent } from 'react'
import { PaperFormat, PAPER_DIMENSIONS } from '../types'
import { useDocumentStore } from '../store/document'
import styles from './NewDocumentScreen.module.css'

const PAPER_FORMATS = Object.keys(PAPER_DIMENSIONS) as PaperFormat[]

export function NewDocumentScreen() {
  const createDocument = useDocumentStore((s) => s.createDocument)
  const [name, setName] = useState('Untitled')
  const [format, setFormat] = useState<PaperFormat>('A4')

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
