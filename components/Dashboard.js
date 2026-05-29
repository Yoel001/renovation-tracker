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
    return () => subscription.unsubscribe()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [roomsRes, renosRes] = await Promise.all([
        supabase.from('rooms').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('renovations').select('*').eq('user_id', user.id).order('created_at'),
      ])
      if (roomsRes.error) throw roomsRes.error
      if (renosRes.error) throw renosRes.error
      setRooms(roomsRes.data || [])
      setRenovations(renosRes.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRoom = async (name) => {
    const { error } = await supabase.from('rooms').insert([{ name, user_id: user.id }])
    if (error) alert('Fout: ' + error.message)
    else await loadData()
  }

  const handleDeleteRoom = async (id) => {
    if (!confirm('Zeker weten? Alle renovaties worden mee verwijderd.')) return
    const { error } = await supabase.from('rooms').delete().eq('id', id)
    if (error) alert('Fout: ' + error.message)
    else await loadData()
  }

  const handleRenameRoom = async (id, name) => {
    const { error } = await supabase.from('rooms').update({ name }).eq('id', id)
    if (error) alert('Fout: ' + error.message)
    else await loadData()
  }

  const handleAddRenovation = async (roomId, form) => {
    const { error } = await supabase.from('renovations').insert([{
      room_id: roomId,
      user_id: user.id,
      renovation_type: form.renovation_type,
      cost: parseFloat(form.cost),
      status: form.status,
      start_date: form.start_date || null,
      notes: form.notes || null,
      urls: form.urls.filter(u => u.trim() !== ''),
    }])
    if (error) alert('Fout: ' + error.message)
    else await loadData()
  }

  const handleDeleteRenovation = async (id) => {
    if (!confirm('Verwijderen?')) return
    const { error } = await supabase.from('renovations').delete().eq('id', id)
    if (error) alert('Fout: ' + error.message)
    else await loadData()
  }

  const handleUpdateRenovation = async (id, form) => {
    const { error } = await supabase.from('renovations').update({
      renovation_type: form.renovation_type,
      cost: parseFloat(form.cost),
      status: form.status,
      start_date: form.start_date || null,
      notes: form.notes || null,
      urls: form.urls.filter(u => u.trim() !== ''),
    }).eq('id', id)
    if (error) alert('Fout: ' + error.message)
    else await loadData()
  }

  const handleShare = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('shared_access').insert([{ owner_id: user.id, shared_with_email: sharedEmail }])
    if (error) { setShareMessage('Fout: ' + error.message) }
    else {
      setShareMessage(`Gedeeld met ${sharedEmail}!`)
      setSharedEmail('')
      setTimeout(() => setShareMessage(''), 3000)
    }
  }

  // Stats
  const totalCost = renovations.reduce((s, r) => s + (parseFloat(r.cost) || 0), 0)
  const doneCost = renovations.filter(r => r.status === 'Afgerond').reduce((s, r) => s + (parseFloat(r.cost) || 0), 0)
  const plannedCost = renovations.filter(r => r.status !== 'Afgerond').reduce((s, r) => s + (parseFloat(r.cost) || 0), 0)

  const StatCard = ({ label, value }) => (
    <div style={{ border: '1px solid #000', padding: '16px 20px' }}>
      <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.8px', textTransform: 'uppercase', color: '#555', marginBottom: '6px' }}>
        {label}
      </div>
      <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>
        €{Math.round(value).toLocaleString()}
      </div>
    </div>
  )

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Renovation Tracker</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#666' }}>{user.email}</span>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ background: '#fff', border: '1px solid #000', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
          >
            Uitloggen
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0', marginBottom: '32px', border: '1px solid #000' }}>
          <div style={{ borderRight: '1px solid #000', padding: '16px 20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.8px', textTransform: 'uppercase', color: '#555', marginBottom: '6px' }}>
              Totaal geraamd
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>
              €{Math.round(totalCost).toLocaleString()}
            </div>
          </div>
          <div style={{ borderRight: '1px solid #000', padding: '16px 20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.8px', textTransform: 'uppercase', color: '#555', marginBottom: '6px' }}>
              Reeds uitgegeven
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>
              €{Math.round(doneCost).toLocaleString()}
            </div>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.8px', textTransform: 'uppercase', color: '#555', marginBottom: '6px' }}>
              Nog te maken
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>
              €{Math.round(plannedCost).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Rooms */}
        <div className={styles.content}>
          {loading ? (
            <p style={{ color: '#999' }}>Laden...</p>
          ) : (
            <RoomManager
              rooms={rooms}
              renovations={renovations}
              onAddRoom={handleAddRoom}
              onDeleteRoom={handleDeleteRoom}
              onRenameRoom={handleRenameRoom}
              onAddRenovation={handleAddRenovation}
              onDeleteRenovation={handleDeleteRenovation}
              onUpdateRenovation={handleUpdateRenovation}
            />
          )}

          {/* Share */}
          <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '24px', marginTop: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.8px', textTransform: 'uppercase', color: '#555', marginBottom: '10px' }}>
              Delen met huismate
            </div>
            <form onSubmit={handleShare} style={{ display: 'flex', gap: '0' }}>
              <input
                type="email"
                value={sharedEmail}
                onChange={e => setSharedEmail(e.target.value)}
                placeholder="huismate@email.com"
                style={{ flex: 1, borderRight: 'none' }}
              />
              <button type="submit" style={{ padding: '8px 20px', background: '#000', color: '#fff', border: '1px solid #000', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>
                Delen
              </button>
            </form>
            {shareMessage && (
              <div style={{ fontSize: '12px', marginTop: '8px', color: shareMessage.includes('Fout') ? '#c00' : '#000' }}>
                {shareMessage}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
