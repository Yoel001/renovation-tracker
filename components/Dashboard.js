'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import RoomManager from './RoomManager'
import styles from './Dashboard.module.css'

export default function Dashboard({ user }) {
  const [rooms, setRooms] = useState([])
  const [renovations, setRenovations] = useState([])
  const [loading, setLoading] = useState(true)
  const [sharedEmail, setSharedEmail] = useState('')
  const [shareMessage, setShareMessage] = useState('')

  useEffect(() => {
    loadData()
    
    const subscription = supabase
      .channel('changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'renovations' }, loadData)
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [roomsData, renovationsData] = await Promise.all([
        supabase.from('rooms').select('*').eq('user_id', user.id),
        supabase.from('renovations').select('*').eq('user_id', user.id),
      ])
      
      if (roomsData.error) throw roomsData.error
      if (renovationsData.error) throw renovationsData.error
      
      setRooms(roomsData.data || [])
      setRenovations(renovationsData.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRoom = async (name) => {
    try {
      const { error } = await supabase.from('rooms').insert([{
        name,
        user_id: user.id,
      }])
      if (error) throw error
      await loadData()
    } catch (error) {
      alert('Fout: ' + error.message)
    }
  }

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('Zeker weten? Alle renovaties in deze ruimte worden verwijderd.')) return
    try {
      const { error } = await supabase.from('rooms').delete().eq('id', roomId)
      if (error) throw error
      await loadData()
    } catch (error) {
      alert('Fout: ' + error.message)
    }
  }

  const handleAddRenovation = async (roomId, formData) => {
    try {
      const { error } = await supabase.from('renovations').insert([{
        room_id: roomId,
        user_id: user.id,
        renovation_type: formData.renovation_type,
        cost: parseFloat(formData.cost),
        status: formData.status,
        start_date: formData.start_date || null,
        notes: formData.notes || null,
      }])
      if (error) throw error
      await loadData()
    } catch (error) {
      alert('Fout: ' + error.message)
    }
  }

  const handleDeleteRenovation = async (renovationId) => {
    if (!confirm('Verwijderen?')) return
    try {
      const { error } = await supabase.from('renovations').delete().eq('id', renovationId)
      if (error) throw error
      await loadData()
    } catch (error) {
      alert('Fout: ' + error.message)
    }
  }

  const handleShare = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('shared_access').insert([{
        owner_id: user.id,
        shared_with_email: sharedEmail,
      }])
      if (error) throw error
      setShareMessage(`Gedeeld met ${sharedEmail}! 🎉`)
      setSharedEmail('')
      setTimeout(() => setShareMessage(''), 3000)
    } catch (error) {
      setShareMessage('Fout: ' + error.message)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const totalCost = renovations.reduce((sum, r) => sum + (parseFloat(r.cost) || 0), 0)

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
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Uitloggen
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '24px',
        }}>
          <div style={{ background: '#e6f1fb', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Totale kosten</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#185fa5' }}>
              €{Math.round(totalCost).toLocaleString()}
            </div>
          </div>
          <div style={{ background: '#faeeda', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Ruimtes</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#ba7517' }}>{rooms.length}</div>
          </div>
          <div style={{ background: '#eaf3de', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Renovaties</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#3b6d11' }}>{renovations.length}</div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.formSection}>
            <h2>Ruimtes & Renovaties</h2>
            {loading ? <p>Laden...</p> : (
              <RoomManager
                rooms={rooms}
                renovations={renovations}
                onAddRoom={handleAddRoom}
                onDeleteRoom={handleDeleteRoom}
                onAddRenovation={handleAddRenovation}
                onDeleteRenovation={handleDeleteRenovation}
              />
            )}

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
                    style={{ backgroundColor: '#639922', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                  >
                    Delen
                  </button>
                </div>
              </form>
              {shareMessage && <div style={{ fontSize: '13px', color: shareMessage.includes('Fout') ? '#a32d2d' : '#3b6d11' }}>{shareMessage}</div>}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
