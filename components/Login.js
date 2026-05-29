'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/auth/callback` } })
        if (error) throw error
        setMessage('Check je email voor de bevestigingslink!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (error) {
      setMessage(`Fout: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const mono = { fontFamily: "'DM Mono', monospace" }
  const serif = { fontFamily: "'DM Serif Display', serif" }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ ...serif, fontSize: '32px', marginBottom: '8px', letterSpacing: '-0.5px' }}>Renovation Tracker</h1>
          <p style={{ ...mono, fontSize: '11px', color: 'var(--ink-muted)', letterSpacing: '0.5px' }}>
            {isSignup ? 'Account aanmaken' : 'Inloggen'}
          </p>
        </div>

        <div style={{ background: 'white', border: '1px solid var(--border)', padding: '32px' }}>
          <form onSubmit={handleAuth} style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ ...mono, display: 'block', fontSize: '10px', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '5px' }}>
                Email
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="jouw@email.com" required disabled={loading} />
            </div>

            <div>
              <label style={{ ...mono, display: 'block', fontSize: '10px', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '5px' }}>
                Wachtwoord
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required disabled={loading} />
            </div>

            {message && (
              <div style={{ ...mono, fontSize: '11px', padding: '10px 12px', background: message.includes('Fout') ? '#fce8e8' : 'var(--green-bg)', color: message.includes('Fout') ? '#c00' : 'var(--green)', border: `1px solid ${message.includes('Fout') ? '#f5c0c0' : '#c0dab8'}` }}>
                {message}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ ...mono, background: 'var(--ink)', color: 'var(--bg)', border: 'none', padding: '11px', fontSize: '11px', letterSpacing: '0.8px', textTransform: 'uppercase', cursor: 'pointer', marginTop: '4px' }}>
              {loading ? 'Bezig...' : isSignup ? 'Account aanmaken' : 'Inloggen'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <button onClick={() => { setIsSignup(!isSignup); setMessage('') }}
              style={{ ...mono, background: 'transparent', border: 'none', fontSize: '11px', color: 'var(--ink-muted)', cursor: 'pointer', letterSpacing: '0.5px', textDecoration: 'underline' }}>
              {isSignup ? 'Ik heb al een account →' : 'Nieuw account aanmaken →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
