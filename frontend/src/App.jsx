import { useState } from 'react'
import TodoList from './components/TodoList'
import NotesPanel from './components/NotesPanel'
import WelcomeBanner from './components/WelcomeBanner'

export default function App() {
  const [tab, setTab] = useState('todos')

  return (
    <div className="app">
      <header className="app-header">
        <h1>My App</h1>
        <WelcomeBanner />
        <nav className="tabs">
          <button
            className={tab === 'todos' ? 'tab active' : 'tab'}
            onClick={() => setTab('todos')}
          >
            ✅ Todos
          </button>
          <button
            className={tab === 'notes' ? 'tab active' : 'tab'}
            onClick={() => setTab('notes')}
          >
            📝 Notes
          </button>
        </nav>
      </header>

      <main className="app-main">
        {tab === 'todos' ? <TodoList /> : <NotesPanel />}
      </main>
    </div>
  )
}
