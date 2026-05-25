'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import RenovationForm from './RenovationForm'
import RoomOverview from './RoomOverview'
import DashboardStats from './DashboardStats'
import styles from './Dashboard.module.css'

export default function Dashboard({ user }) {
  const [renovations, setRenovations] = useState([])
  const [loading, setLoading] = useState(true)
  const [sharedEmail, setSharedEmail] = useState('')
  const [shareMessage, setShareMessage] = useState('')

  useEffect(() => {
    loadRenovations()
    
    const subscription = supabase
      .channel('renovations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'renovations' },
        loadRenovations
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadRenovations = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('renovations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setRenovations(data || [])
    } catch (error) {
      console.error('Error loading renovations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRenovation = async (formData) => {
    try {
      const { error } = await supabase
        .from('renovations')
        .insert([
          {
            ...formData,
            user_id: user.id,
          },
        ])
      
      if (error) throw error
      await loadRenovations()
    } catch (error) {
      console.error('Error adding renovation:', error)
      alert('Error: ' + error.message)
    }
  }

  const handleDeleteRenovation = async (id) => {
    if (!confirm('Zeker weten?')) return
    
    try {
      const { error } = await supabase
        .from('renovations')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await loadRenovations()
    } catch (error) {
      console.error('Error deleting renovation:', error)
      alert('Error: ' + error.message)
    }
  }

  const handleShare = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('shared_access')
        .insert([
          {
            owner_id: user.id,
            shared_with_email: sharedEmail,
          },
        ])
      
      if (error) throw error
      setShareMessage(`Gedeeld met ${sharedEmail}! 🎉`)
      setSharedEmail('')
      setTimeout(() => setShareMessage(''), 3000)
    } catch (error) {
      setShareMessage('Error: ' + error.message)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🏠 Renovation Tracker</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            {user.email}
          </span>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#f0f0f0',
              color: '#333',
            }}
          >
            Uitloggen
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <DashboardStats renovations={renovations} />

        <div className={styles.content}>
          <div className={styles.formSection}>
            <h2>Voeg renovatie toe</h2>
            <RenovationForm onSubmit={handleAddRenovation} />

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
              <h3 style={{ marginBottom: '12px' }}>Delen met huismate</h3>
              <form onSubmit={handleShare}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="email"
                    value={sharedEmail}
                    onChange={(e) => setSharedEmail(e.target.value)}
                    placeholder="huismate@email.com"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#639922',
                      color: 'white',
                    }}
                  >
                    Delen
                  </button>
                </div>
              </form>
              {shareMessage && (
                <div
                  style={{
                    fontSize: '13px',
                    color: shareMessage.includes('Error') ? '#a32d2d' : '#3b6d11',
                  }}
                >
                  {shareMessage}
                </div>
              )}
            </div>
          </div>

          <div className={styles.listSection}>
            <h2>Overzicht per ruimte</h2>
            {loading ? (
              <p>Laden...</p>
            ) : renovations.length === 0 ? (
              <p style={{ color: '#999' }}>Nog geen renovaties. Voeg er een toe!</p>
            ) : (
              <RoomOverview
                renovations={renovations}
                onDelete={handleDeleteRenovation}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
