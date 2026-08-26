'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const MONO = { fontFamily: "'DM Mono', monospace" }
const RED = '#8B1A1A'
const BLUE = '#1B3F8B'
const YELLOW = '#C8991A'

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
        setMessage('Check je email voor de bevestigingslink.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '340px' }}>

        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ width: '8px', height: '8px', background: RED }} />
          <div style={{ width: '8px', height: '8px', background: BLUE }} />
          <div style={{ width: '8px', height: '8px', background: YELLOW }} />
          <span style={{ fontFamily: 'Inter', fontSize: '11px', fontWeight: '500', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#1a1916', marginLeft: '10px' }}>
            Renovation Tracker
          </span>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'grid', gap: '12px' }}>
          <div>
            <label style={{ ...MONO, display: 'block', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: '#bbb', marginBottom: '5px' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jouw@email.com" required disabled={loading} />
          </div>
          <div>
            <label style={{ ...MONO, display: 'block', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: '#bbb', marginBottom: '5px' }}>Wachtwoord</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required disabled={loading} />
          </div>

          {message && (
            <div style={{ ...MONO, fontSize: '10px', padding: '8px 10px', background: message.includes('email') ? '#f9f9f9' : '#fff5f5', color: message.includes('email') ? '#888' : RED, border: `1px solid ${message.includes('email') ? '#ebebeb' : '#f0cece'}` }}>
              {message}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ marginTop: '4px', padding: '10px', background: '#1a1916', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '400', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {loading ? '...' : isSignup ? 'Account aanmaken' : 'Inloggen'}
          </button>
        </form>

        <button onClick={() => { setIsSignup(!isSignup); setMessage('') }}
          style={{ ...MONO, marginTop: '16px', display: 'block', fontSize: '10px', color: '#bbb', background: 'transparent', border: 'none', textDecoration: 'underline', padding: 0, cursor: 'pointer' }}>
          {isSignup ? 'Ik heb al een account' : 'Nieuw account aanmaken'}
        </button>
      </div>
    </div>
  )
}
