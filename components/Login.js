'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './Login.module.css'

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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setMessage('Check je email voor de bevestigingslink!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (error) {
      setMessage(`Fout: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>🏠 Renovation Tracker</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          Track en plan je huisrenovaties met je huismate
        </p>

        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jouw@email.com"
              required
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Wachtwoord
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {message && (
            <div
              style={{
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                backgroundColor: message.includes('Fout') ? '#fcebeb' : '#eaf3de',
                color: message.includes('Fout') ? '#a32d2d' : '#3b6d11',
                fontSize: '13px',
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#378add',
              color: 'white',
              marginBottom: '12px',
            }}
          >
            {loading ? 'Bezig...' : isSignup ? 'Account aanmaken' : 'Inloggen'}
          </button>
        </form>

        <button
          onClick={() => {
            setIsSignup(!isSignup)
            setMessage('')
          }}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            color: '#378add',
            border: '1px solid #378add',
          }}
        >
          {isSignup ? 'Ik heb al een account' : 'Nieuw account aanmaken'}
        </button>
      </div>
    </div>
  )
}
