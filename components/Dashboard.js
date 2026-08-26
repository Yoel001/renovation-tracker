'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import RoomDetail from './RoomDetail'
import styles from './Dashboard.module.css'

const MONO = { fontFamily: "'DM Mono', monospace" }
const RED = '#8B1A1A'
const BLUE = '#1B3F8B'

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
    if (!form.renovation_type || !form.cost) { alert('Vul type en bedrag in!'); return }
    if (form.renovation_type === 'Overig' && !form.custom_type) { alert('Geef een specificatie op!'); return }
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
    if (!form.renovation_type || !form.cost) { alert('Vul type en bedrag in!'); return }
    if (form.renovation_type === 'Overig' && !form.custom_type) { alert('Geef een specificatie op!'); return }
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

  const geraamd = renovations.filter(r => r.status === 'Gepland').reduce((s, r) => s + (parseFloat(r.cost) || 0), 0)
  const uitgevoerd = renovations.filter(r => r.status === 'Uitgevoerd').reduce((s, r) => s + (parseFloat(r.cost) || 0), 0)
  const teMaken = renovations.filter(r => r.status === 'Gepland').reduce((s, r) => s + (parseFloat(r.cost) || 0), 0)

  const activeRoom = rooms.find(r => r.id === selectedRoom)
  const activeRenos = renovations.filter(r => r.room_id === selectedRoom)

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <div style={{ width: '6px', height: '6px', background: RED }} />
          <div style={{ width: '6px', height: '6px', background: BLUE }} />
          <div style={{ width: '6px', height: '6px', background: '#C8991A' }} />
          <span className={styles.logo} style={{ marginLeft: '10px' }}>Renovation Tracker</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ ...MONO, fontSize: '11px', color: '#ccc' }}>{user.email}</span>
          <button onClick={() => supabase.auth.signOut()}
            style={{ background: 'transparent', border: '1px solid #e0e0e0', padding: '5px 12px', color: '#999', borderRadius: '0' }}>
            Uitloggen
          </button>
        </div>
      </header>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: '1px solid #ebebeb' }}>
        {[
          { label: 'Geraamd', value: geraamd, color: RED },
          { label: 'Uitgevoerd', value: uitgevoerd, color: BLUE },
          { label: 'Te maken', value: teMaken, color: '#1a1916' },
        ].map(({ label, value, color }, i) => (
          <div key={i} style={{ padding: '12px 20px', borderRight: i < 2 ? '1px solid #ebebeb' : 'none' }}>
            <div style={{ ...MONO, fontSize: '9px', color: '#ccc', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: '300', color }}>
              €{Math.round(value).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: 'calc(100vh - 100px)' }}>

        {/* Sidebar */}
        <div style={{ borderRight: '1px solid #ebebeb', background: '#fafafa', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px', borderBottom: '1px solid #ebebeb' }}>
            <form onSubmit={handleAddRoom} style={{ display: 'flex' }}>
              <input type="text" placeholder="Nieuwe ruimte..." value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                style={{ flex: 1, fontSize: '11px', borderRight: 'none', background: '#fff' }} />
              <button type="submit"
                style={{ padding: '8px 12px', background: '#1a1916', color: '#fff', border: '1px solid #1a1916', fontSize: '13px', fontWeight: '300' }}>
                +
              </button>
            </form>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ ...MONO, padding: '12px', fontSize: '10px', color: '#ccc' }}>Laden...</div>
            ) : rooms.length === 0 ? (
              <div style={{ ...MONO, padding: '12px', fontSize: '10px', color: '#ccc' }}>Voeg een ruimte toe</div>
            ) : rooms.map(room => {
              const renos = renovations.filter(r => r.room_id === room.id)
              const roomTotal = renos.filter(r => r.status === 'Gepland').reduce((s, r) => s + (parseFloat(r.cost) || 0), 0)
              const isSelected = selectedRoom === room.id
              return (
                <div key={room.id} onClick={() => setSelectedRoom(room.id)}
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid #ebebeb',
                    borderLeft: `2px solid ${isSelected ? RED : 'transparent'}`,
                    background: isSelected ? '#fff' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.1s',
                  }}>
                  <div style={{ fontSize: '12px', fontWeight: isSelected ? '500' : '400', color: isSelected ? RED : '#aaa', marginBottom: '2px' }}>
                    {room.name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ ...MONO, fontSize: '9px', color: '#ccc' }}>{renos.length} item{renos.length !== 1 ? 's' : ''}</span>
                    {roomTotal > 0 && <span style={{ ...MONO, fontSize: '9px', color: '#bbb' }}>€{Math.round(roomTotal).toLocaleString()}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detail */}
        <div style={{ padding: '28px 36px', overflowY: 'auto', background: '#fff' }}>
          {!activeRoom ? (
            <div style={{ ...MONO, fontSize: '11px', color: '#ccc', textAlign: 'center', marginTop: '60px' }}>
              Selecteer een ruimte
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
