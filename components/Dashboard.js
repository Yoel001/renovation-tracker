'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import RoomDetail from './RoomDetail'
import styles from './Dashboard.module.css'

export default function Dashboard({ user }) {
  const [rooms, setRooms] = useState([])
  const [renovations, setRenovations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [newRoomName, setNewRoomName] = useState('')

  useEffect(() => {
    loadData()
    const sub = supabase.channel('changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'renovations' }, loadData)
      .subscribe()
    return () => sub.unsubscribe()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [r, n] = await Promise.all([
        supabase.from('rooms').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('renovations').select('*').eq('user_id', user.id).order('created_at'),
      ])
      if (r.error) throw r.error
      if (n.error) throw n.error
      setRooms(r.data || [])
      setRenovations(n.data || [])
      setSelectedRoom(prev => prev ?? r.data?.[0]?.id ?? null)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleAddRoom = async (e) => {
    e.preventDefault()
    if (!newRoomName.trim()) return
    const { data, error } = await supabase.from('rooms').insert([{ name: newRoomName.trim(), user_id: user.id }]).select()
    if (error) alert('Fout: ' + error.message)
    else { setNewRoomName(''); await loadData(); if (data?.[0]) setSelectedRoom(data[0].id) }
  }

  const handleDeleteRoom = async (id) => {
    if (!confirm('Zeker weten? Alle renovaties worden mee verwijderd.')) return
    const { error } = await supabase.from('rooms').delete().eq('id', id)
    if (error) alert('Fout: ' + error.message)
    else { if (selectedRoom === id) setSelectedRoom(null); await loadData() }
  }

  const handleRenameRoom = async (id, name) => {
    const { error } = await supabase.from('rooms').update({ name }).eq('id', id)
    if (error) alert('Fout: ' + error.message); else await loadData()
  }

  const handleAddRenovation = async (roomId, form) => {
    const { error } = await supabase.from('renovations').insert([{
      room_id: roomId, user_id: user.id,
      renovation_type: form.renovation_type,
      custom_type: form.custom_type || null,
      cost: parseFloat(form.cost),
      status: form.status,
      start_date: form.start_date || null,
      notes: form.notes || null,
      urls: form.urls.filter(u => u.trim() !== ''),
    }])
    if (error) alert('Fout: ' + error.message); else await loadData()
  }

  const handleDeleteRenovation = async (id) => {
    if (!confirm('Verwijderen?')) return
    const { error } = await supabase.from('renovations').delete().eq('id', id)
    if (error) alert('Fout: ' + error.message); else await loadData()
  }

  const handleUpdateRenovation = async (id, form) => {
    const { error } = await supabase.from('renovations').update({
      renovation_type: form.renovation_type,
      custom_type: form.custom_type || null,
      cost: parseFloat(form.cost),
      status: form.status,
      start_date: form.start_date || null,
      notes: form.notes || null,
      urls: form.urls.filter(u => u.trim() !== ''),
    }).eq('id', id)
    if (error) alert('Fout: ' + error.message); else await loadData()
  }

  const mono = { fontFamily: "'DM Mono', monospace" }
  const serif = { fontFamily: "'DM Serif Display', serif" }

  const totalCost = renovations.filter(r => r.status === 'Gepland').reduce((s, r) => s + (parseFloat(r.cost) || 0), 0)
  const doneCost = renovations.filter(r => r.status === 'Uitgevoerd').reduce((s, r) => s + (parseFloat(r.cost) || 0), 0)
  const plannedCost = renovations.filter(r => r.status === 'Gepland').reduce((s, r) => s + (parseFloat(r.cost) || 0), 0)

  const activeRoom = rooms.find(r => r.id === selectedRoom)
  const activeRenos = renovations.filter(r => r.room_id === selectedRoom)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.logo}>Renovation Tracker</span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ ...mono, fontSize: '11px', color: '#999' }}>{user.email}</span>
          <button onClick={() => supabase.auth.signOut()}
            style={{ ...mono, background: 'transparent', border: '1px solid #e0ddd5', padding: '6px 14px', cursor: 'pointer', fontSize: '11px', color: '#999', borderRadius: '2px' }}>
            Uitloggen
          </button>
        </div>
      </header>

      {/* Stats bar */}
      <div style={{ borderBottom: '1px solid #e0ddd5', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: 'white' }}>
        {[
          { label: 'Totaal geraamd', value: totalCost },
          { label: 'Reeds uitgegeven', value: doneCost },
          { label: 'Nog te maken', value: plannedCost },
        ].map(({ label, value }, i) => (
          <div key={i} style={{ padding: '14px 28px', borderRight: i < 2 ? '1px solid #e0ddd5' : 'none' }}>
            <div style={{ ...mono, fontSize: '9px', color: '#aaa', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
            <div style={{ ...serif, fontSize: '20px' }}>€{Math.round(value).toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Two-column */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 'calc(100vh - 118px)' }}>

        {/* Sidebar */}
        <div style={{ borderRight: '1px solid #e0ddd5', background: '#faf8f3', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px', borderBottom: '1px solid #e0ddd5' }}>
            <form onSubmit={handleAddRoom} style={{ display: 'flex' }}>
              <input type="text" placeholder="Nieuwe ruimte..." value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                style={{ flex: 1, fontSize: '12px', padding: '6px 8px', borderRight: 'none', borderRadius: '2px 0 0 2px', background: 'white' }} />
              <button type="submit"
                style={{ ...mono, padding: '6px 12px', background: '#1a1a18', color: '#f2efe6', border: '1px solid #1a1a18', fontSize: '13px', cursor: 'pointer', borderRadius: '0 2px 2px 0' }}>
                +
              </button>
            </form>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ ...mono, padding: '16px', fontSize: '11px', color: '#ccc' }}>Laden...</div>
            ) : rooms.length === 0 ? (
              <div style={{ ...mono, padding: '16px', fontSize: '11px', color: '#ccc' }}>Voeg een ruimte toe</div>
            ) : rooms.map(room => {
              const renos = renovations.filter(r => r.room_id === room.id)
              const roomTotal = renos.filter(r => r.status === 'Gepland').reduce((s, r) => s + (parseFloat(r.cost) || 0), 0)
              const isSelected = selectedRoom === room.id
              return (
                <div key={room.id} onClick={() => setSelectedRoom(room.id)}
                  style={{ padding: '11px 14px', borderBottom: '1px solid #e0ddd5', cursor: 'pointer', background: isSelected ? 'white' : 'transparent', borderLeft: `2px solid ${isSelected ? '#1a1a18' : 'transparent'}`, transition: 'all 0.1s' }}>
                  <div style={{ ...serif, fontSize: '13px', color: '#1a1a18', marginBottom: '2px' }}>{room.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ ...mono, fontSize: '10px', color: '#bbb' }}>{renos.length} item{renos.length !== 1 ? 's' : ''}</span>
                    {roomTotal > 0 && <span style={{ ...mono, fontSize: '10px', color: '#999' }}>€{Math.round(roomTotal).toLocaleString()}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detail */}
        <div style={{ padding: '28px 36px', overflowY: 'auto', background: '#f2efe6' }}>
          {!activeRoom ? (
            <div style={{ ...mono, fontSize: '12px', color: '#ccc', textAlign: 'center', marginTop: '60px' }}>
              Selecteer een ruimte links
            </div>
          ) : (
            <RoomDetail
              room={activeRoom}
              renovations={activeRenos}
              onRenameRoom={handleRenameRoom}
              onDeleteRoom={handleDeleteRoom}
              onAddRenovation={handleAddRenovation}
              onDeleteRenovation={handleDeleteRenovation}
              onUpdateRenovation={handleUpdateRenovation}
            />
          )}
        </div>
      </div>
    </div>
  )
}
