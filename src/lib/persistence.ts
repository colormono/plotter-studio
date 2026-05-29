import { PlotterDocument } from '../types'

export const AUTOSAVE_KEY = 'plotter-studio:autosave'

export function serialize(doc: PlotterDocument): string {
  return JSON.stringify(doc)
}

export function deserialize(json: string): PlotterDocument {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('Invalid file: cannot parse JSON')
  }
  return validate(parsed)
}

function validate(data: unknown): PlotterDocument {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('Invalid document: expected a JSON object')
  }
  const obj = data as Record<string, unknown>

  const required = ['id', 'name', 'version', 'paperFormat', 'maxGridDepth', 'layers'] as const
  for (const field of required) {
    if (!(field in obj)) {
      throw new Error(`Invalid document: missing required field "${field}"`)
    }
  }

  if (obj.version !== '1') {
    throw new Error(`Unsupported document version: "${obj.version}"`)
  }

  if (!Array.isArray(obj.layers)) {
    throw new Error('Invalid document: "layers" must be an array')
  }

  return data as PlotterDocument
}

export function downloadDocument(doc: PlotterDocument): void {
  const json = serialize(doc)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${doc.name}.plotter.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function openDocumentFromFile(
  file: File,
  onSuccess: (doc: PlotterDocument) => void,
  onError: (message: string) => void,
): void {
  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result
    if (typeof text !== 'string') {
      onError('Could not read file')
      return
    }
    try {
      onSuccess(deserialize(text))
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unknown error')
    }
  }
  reader.readAsText(file)
}

export function saveAutosave(doc: PlotterDocument): void {
  try {
    localStorage.setItem(AUTOSAVE_KEY, serialize(doc))
  } catch {
    // localStorage may be unavailable (private mode quota exceeded etc.)
  }
}

export function loadAutosave(): PlotterDocument | null {
  try {
    const json = localStorage.getItem(AUTOSAVE_KEY)
    if (!json) return null
    return deserialize(json)
  } catch {
    return null
  }
}

export function clearAutosave(): void {
  try {
    localStorage.removeItem(AUTOSAVE_KEY)
  } catch {
    // ignore
  }
}
