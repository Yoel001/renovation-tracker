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
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleAddRoom = async (name) => {
    const { error } = await supabase.from('rooms').insert([{ name, user_id: user.id }])
    if (error) alert('Fout: ' + error.message); else await loadData()
  }

  const handleDeleteRoom = async (id) => {
    if (!confirm('Zeker weten? Alle renovaties worden mee verwijderd.')) return
    const { error } = await supabase.from('rooms').delete().eq('id', id)
    if (error) alert('Fout: ' + error.message); else await loadData()
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

  const handleShare = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('shared_access').insert([{ owner_id: user.id, shared_with_email: sharedEmail }])
    if (error) setShareMessage('Fout: ' + error.message)
    else { setShareMessage(`Gedeeld met ${sharedEmail}!`); setSharedEmail(''); setTimeout(() => setShareMessage(''), 3000) }
  }

  const totalCost = renovations.filter(r => r.status === 'Gepland').reduce((s, r) => s + (parseFloat(r.cost) || 0), 0)
  const doneCost = renovations.filter(r => r.status === 'Uitgevoerd').reduce((s, r) => s + (parseFloat(r.cost) || 0), 0)
  const plannedCost = renovations.filter(r => r.status === 'Gepland').reduce((s, r) => s + (parseFloat(r.cost) || 0), 0)

  const mono = { fontFamily: "'DM Mono', monospace" }
  const serif = { fontFamily: "'DM Serif Display', serif" }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.logo}>Renovation Tracker</span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ ...mono, fontSize: '11px', color: 'var(--ink-muted)' }}>{user.email}</span>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ ...mono, background: 'transparent', border: '1px solid var(--border)', padding: '6px 14px', cursor: 'pointer', fontSize: '11px', color: 'var(--ink-muted)', borderRadius: '2px' }}
          >
            Uitloggen
          </button>
        </div>
      </header>

      <main className={styles.main}>

        {/* Stats */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
            <span style={{ ...mono, fontSize: '10px', color: 'var(--ink-faint)', letterSpacing: '0.5px' }}>00 /</span>
            <span style={{ ...serif, fontSize: '16px' }}>Overzicht</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '1px solid var(--border)' }}>
            {[
              { label: 'Totaal geraamd', value: totalCost },
              { label: 'Reeds uitgegeven', value: doneCost, border: true },
              { label: 'Nog te maken', value: plannedCost, border: true },
            ].map(({ label: lbl, value, border }, i) => (
              <div key={i} style={{ padding: '20px 24px', borderRight: border ? '1px solid var(--border)' : 'none', background: 'white' }}>
                <div style={{ ...mono, fontSize: '10px', color: 'var(--ink-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {lbl}
                </div>
                <div style={{ ...serif, fontSize: '28px', letterSpacing: '-0.5px' }}>
                  €{Math.round(value).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Room Manager */}
        <div className={styles.content}>
          {loading ? (
            <p style={{ ...mono, fontSize: '11px', color: 'var(--ink-faint)' }}>Laden...</p>
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
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '12px' }}>
              <span style={{ ...mono, fontSize: '10px', color: 'var(--ink-faint)', letterSpacing: '0.5px' }}>03 /</span>
              <span style={{ ...serif, fontSize: '16px' }}>Delen</span>
            </div>
            <form onSubmit={handleShare} style={{ display: 'flex', gap: '0' }}>
              <input type="email" value={sharedEmail} onChange={e => setSharedEmail(e.target.value)}
                placeholder="huismate@email.com"
                style={{ flex: 1, borderRight: 'none', borderRadius: '2px 0 0 2px' }} />
              <button type="submit"
                style={{ ...mono, padding: '9px 20px', background: 'var(--ink)', color: 'var(--bg)', border: '1px solid var(--ink)', fontSize: '11px', letterSpacing: '0.5px', cursor: 'pointer', borderRadius: '0 2px 2px 0', whiteSpace: 'nowrap' }}>
                Delen
              </button>
            </form>
            {shareMessage && (
              <p style={{ ...mono, fontSize: '11px', marginTop: '8px', color: shareMessage.includes('Fout') ? 'red' : 'var(--green)' }}>
                {shareMessage}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
