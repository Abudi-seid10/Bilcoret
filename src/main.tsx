import React, { Component, type ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ fontFamily: 'Inter, sans-serif', padding: '2rem', textAlign: 'center', marginTop: '4rem' }}>
          <h2 style={{ color: '#004D34', marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p style={{ color: '#555', marginBottom: '1rem' }}>
            If this is the first load, make sure <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> are set in your Vercel environment variables.
          </p>
          <pre style={{ fontSize: '0.8rem', color: '#888', whiteSpace: 'pre-wrap' }}>
            {(this.state.error as Error).message}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
