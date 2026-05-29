import { useDocumentStore } from './store/document'
import { NewDocumentScreen } from './components/NewDocumentScreen'
import { AppShell } from './components/AppShell'

function App() {
  const document = useDocumentStore((s) => s.document)
  return document ? <AppShell /> : <NewDocumentScreen />
}

export default App
