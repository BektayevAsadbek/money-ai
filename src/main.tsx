import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, MemoryRouter } from 'react-router-dom'
import App from './App'
import { StoreProvider } from './data/store'
import './styles.css'

// Hash routing works on any static host (GitHub Pages, Vercel, a plain file server).
// The claude.ai artifact build keeps routes in memory because the viewer frame owns the URL.
const Router = import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : HashRouter

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <StoreProvider>
        <App />
      </StoreProvider>
    </Router>
  </StrictMode>,
)
