'use client'

import { useState } from 'react'

const RENO_TYPES = [
  'Schilderwerk', 'Elektriciteit', 'Loodgwerk / Water',
  'Vloeren', 'Dakwerk', 'Ramen / Deuren', 'Isolatie',
  'Verwarming / Koeling', 'Keuken', 'Badkamer', 'Overig'
]

const STATUS_OPTIONS = ['Gepland', 'In uitvoering', 'Afgerond']

const emptyForm = {
  renovation_type: '',
  custom_type: '',
  cost: '',
  status: 'Gepland',
  start_date: '',
  notes: '',
  urls: [''],
}

const label = (text) => (
  <label style={{
    display: 'block',
    fontFamily: "'DM Mono', monospace",
    fontSize: '10px',
    fontWeight: '500',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    color: 'var(--ink-muted)',
    marginBottom: '5px',
  }}>
    {text}
  </label>
)

function Btn({ onClick, children, variant = 'ghost', style = {}, type = 'button' }) {
  const variants = {
    primary: { background: 'var(--ink)', color: '#f2efe6', border: '1px solid var(--ink)', padding: '8px 18px' },
    ghost: { background: 'transparent', color: 'var(--ink)', border: '1px solid var(--border)', padding: '8px 18px' },
    danger: { background: 'transparent', color: 'var(--ink-muted)', border: '1px solid var(--border)', padding: '6px 12px' },
    dashed: { background: 'transparent', color: 'var(--ink-muted)', border: '1px dashed var(--border)', padding: '8px 18px', width: '100%' },
  }
  return (
    <button type={type} onClick={onClick} style={{ ...variants[variant], fontFamily: "'DM Mono', monospace", fontSize: '11px', letterSpacing: '0.5px', borderRadius: '2px', cursor: 'pointer', transition: 'opacity 0.15s', ...style }}>
      {children}
    </button>
  )
}

function StatusTag({ status }) {
  const map = {
    'Gepland': { bg: 'var(--bg-card)', color: 'var(--ink-muted)' },
    'In uitvoering': { bg: 'var(--ink)', color: 'var(--bg)' },
    'Afgerond': { bg: 'var(--green-bg)', color: 'var(--green)' },
  }
  const s = map[status] || map['Gepland']
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      fontFamily: "'DM Mono', monospace",
      fontSize: '9px',
      padding: '3px 8px',
      fontWeight: '500',
      letterSpacing: '0.8px',
      textTransform: 'uppercase',
      borderRadius: '2px',
    }}>
      {status}
    </span>
  )
}

function RenoForm({ initial = emptyForm, onSave, onCancel }) {
  const [form, setForm] = useState({ ...emptyForm, ...initial, urls: initial.urls?.length ? initial.urls : [''] })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <div>
        {label('Type werk *')}
        <select value={form.renovation_type} onChange={e => set('renovation_type', e.target.value)}>
          <option value="">— Selecteer —</option>
          {RENO_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {form.renovation_type === 'Overig' && (
        <div>
          {label('Specificeer het werk *')}
          <input
            type="text"
            placeholder="Bijv. Pergola, Zwembad, Tuinaanleg..."
            value={form.custom_type}
            onChange={e => set('custom_type', e.target.value)}
            autoFocus
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          {label('Kosten (€) *')}
          <input type="number" placeholder="0" min="0" step="100"
            value={form.cost} onChange={e => set('cost', e.target.value)} />
        </div>
        <div>
          {label('Status')}
          <select value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        {label('Datum (optioneel)')}
        <input type="date" value={form.start_date || ''} onChange={e => set('start_date', e.target.value)} />
      </div>

      <div>
        {label('Opmerkingen')}
        <textarea placeholder="Details, bijzonderheden..."
          value={form.notes} onChange={e => set('notes', e.target.value)}
          style={{ minHeight: '64px', resize: 'vertical' }} />
      </div>

      <div>
        {label('Links (materialen / inspiratie)')}
        {form.urls.map((url, i) => (
          <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
            <input type="url" placeholder="https://..." value={url}
              onChange={e => {
                const urls = [...form.urls]; urls[i] = e.target.value
                set('urls', urls)
              }} />
            {form.urls.length > 1 && (
              <button onClick={() => set('urls', form.urls.filter((_, j) => j !== i))}
                style={{ padding: '8px 12px', background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--ink-muted)', borderRadius: '2px' }}>
                ✕
              </button>
            )}
          </div>
        ))}
        <button onClick={() => set('urls', [...form.urls, ''])}
          style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.5px', color: 'var(--ink-muted)', background: 'transparent', border: '1px dashed var(--border)', padding: '5px 12px', cursor: 'pointer', borderRadius: '2px' }}>
          + link toevoegen
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', paddingTop: '4px', borderTop: '1px solid var(--border)' }}>
        <Btn variant="primary" onClick={() => onSave(form)}>Opslaan</Btn>
        <Btn variant="ghost" onClick={onCancel}>Annuleren</Btn>
      </div>
    </div>
  )
}

export default function RoomManager({ rooms, renovations, onAddRoom, onDeleteRoom, onRenameRoom, onAddRenovation, onDeleteRenovation, onUpdateRenovation }) {
  const [expandedRoom, setExpandedRoom] = useState(null)
  const [newRoomName, setNewRoomName] = useState('')
  const [editingRoomId, setEditingRoomId] = useState(null)
  const [editingRoomName, setEditingRoomName] = useState('')
  const [addingRenoInRoom, setAddingRenoInRoom] = useState(null)
  const [editingRenoId, setEditingRenoId] = useState(null)

  const getRenos = (roomId) => renovations.filter(r => r.room_id === roomId)

  const sectionLabel = (num, text) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '12px' }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: 'var(--ink-faint)', letterSpacing: '0.5px' }}>{num}</span>
      <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '16px', color: 'var(--ink)' }}>{text}</span>
    </div>
  )

  return (
    <div style={{ display: 'grid', gap: '0' }}>
      {/* Add Room */}
      <div style={{ marginBottom: '32px' }}>
        {sectionLabel('01 /', 'Ruimte toevoegen')}
        <div style={{ display: 'flex', gap: '0' }}>
          <input
            type="text"
            placeholder="Woonkamer, Badkamer, Buitengevel, Terras..."
            value={newRoomName}
            onChange={e => setNewRoomName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && newRoomName.trim()) { onAddRoom(newRoomName.trim()); setNewRoomName('') } }}
            style={{ flex: 1, borderRight: 'none', borderRadius: '2px 0 0 2px' }}
          />
          <button
            onClick={() => { if (newRoomName.trim()) { onAddRoom(newRoomName.trim()); setNewRoomName('') } }}
            style={{ padding: '9px 20px', background: 'var(--ink)', color: 'var(--bg)', border: '1px solid var(--ink)', fontFamily: "'DM Mono', monospace", fontSize: '11px', letterSpacing: '0.5px', cursor: 'pointer', borderRadius: '0 2px 2px 0', whiteSpace: 'nowrap' }}
          >
            + Toevoegen
          </button>
        </div>
      </div>

      {/* Rooms */}
      {rooms.length > 0 && (
        <div>
          {sectionLabel('02 /', 'Overzicht')}
          <div style={{ border: '1px solid var(--border)' }}>
            {rooms.map((room, idx) => {
              const renos = getRenos(room.id)
              const total = renos.reduce((s, r) => s + (parseFloat(r.cost) || 0), 0)
              const isExpanded = expandedRoom === room.id
              const isEditingName = editingRoomId === room.id

              return (
                <div key={room.id} style={{ borderBottom: idx < rooms.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  {/* Room Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '14px 20px',
                    background: isExpanded ? 'var(--bg-card)' : 'transparent',
                    gap: '12px',
                  }}>
                    <span
                      onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
                      style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: 'var(--ink-faint)', cursor: 'pointer', transition: 'transform 0.2s', display: 'inline-block', transform: isExpanded ? 'rotate(90deg)' : 'none', userSelect: 'none', width: '12px' }}
                    >▶</span>

                    {isEditingName ? (
                      <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                        <input value={editingRoomName} onChange={e => setEditingRoomName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { onRenameRoom(room.id, editingRoomName); setEditingRoomId(null) } }}
                          autoFocus style={{ flex: 1, padding: '5px 10px', fontFamily: "'DM Serif Display', serif", fontSize: '15px' }} />
                        <Btn variant="primary" onClick={() => { onRenameRoom(room.id, editingRoomName); setEditingRoomId(null) }}>✓</Btn>
                        <Btn onClick={() => setEditingRoomId(null)}>✕</Btn>
                      </div>
                    ) : (
                      <>
                        <div onClick={() => setExpandedRoom(isExpanded ? null : room.id)} style={{ flex: 1, cursor: 'pointer' }}>
                          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '15px' }}>{room.name}</span>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: 'var(--ink-faint)', marginLeft: '12px' }}>
                            {renos.length} item{renos.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '16px', marginRight: '20px' }}>
                          €{Math.round(total).toLocaleString()}
                        </span>
                        <Btn onClick={() => { setEditingRoomId(room.id); setEditingRoomName(room.name) }}>Naam</Btn>
                        <Btn variant="danger" onClick={() => onDeleteRoom(room.id)} style={{ marginLeft: '6px' }}>Verwijder</Btn>
                      </>
                    )}
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid var(--border)', background: '#faf8f3', padding: '20px' }}>
                      {/* Reno items */}
                      {renos.length > 0 && (
                        <div style={{ border: '1px solid var(--border)', marginBottom: '16px', background: 'white' }}>
                          {renos.map((reno, i) => {
                            const displayName = reno.renovation_type === 'Overig' && reno.custom_type
                              ? reno.custom_type
                              : reno.renovation_type

                            return (
                              <div key={reno.id} style={{ borderBottom: i < renos.length - 1 ? '1px solid var(--border)' : 'none', padding: '14px 16px' }}>
                                {editingRenoId === reno.id ? (
                                  <RenoForm
                                    initial={{
                                      renovation_type: reno.renovation_type,
                                      custom_type: reno.custom_type || '',
                                      cost: reno.cost,
                                      status: reno.status,
                                      start_date: reno.start_date || '',
                                      notes: reno.notes || '',
                                      urls: reno.urls?.length ? reno.urls : [''],
                                    }}
                                    onSave={(form) => { onUpdateRenovation(reno.id, form); setEditingRenoId(null) }}
                                    onCancel={() => setEditingRenoId(null)}
                                  />
                                ) : (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px' }}>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '14px' }}>{displayName}</span>
                                        <StatusTag status={reno.status} />
                                      </div>
                                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '13px', marginBottom: '4px' }}>
                                        €{Math.round(parseFloat(reno.cost) || 0).toLocaleString()}
                                      </div>
                                      {reno.start_date && (
                                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: 'var(--ink-faint)' }}>
                                          {new Date(reno.start_date).toLocaleDateString('nl-NL')}
                                        </div>
                                      )}
                                      {reno.notes && (
                                        <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                                          {reno.notes}
                                        </div>
                                      )}
                                      {reno.urls?.filter(u => u).length > 0 && (
                                        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                          {reno.urls.filter(u => u).map((url, i) => (
                                            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                              style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: 'var(--ink)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: '2px', textDecoration: 'none', background: 'var(--bg)' }}>
                                              ↗ Link {i + 1}
                                            </a>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                      <Btn onClick={() => setEditingRenoId(reno.id)}>Aanpassen</Btn>
                                      <Btn variant="danger" onClick={() => onDeleteRenovation(reno.id)}>✕</Btn>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Add reno */}
                      {addingRenoInRoom === room.id ? (
                        <div style={{ border: '1px solid var(--border)', padding: '20px', background: 'white' }}>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: 'var(--ink-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '16px' }}>
                            Nieuwe renovatie
                          </div>
                          <RenoForm
                            onSave={(form) => { onAddRenovation(room.id, form); setAddingRenoInRoom(null) }}
                            onCancel={() => setAddingRenoInRoom(null)}
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingRenoInRoom(room.id)}
                          style={{ width: '100%', padding: '10px', border: '1px dashed var(--border)', background: 'transparent', cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'var(--ink-muted)', letterSpacing: '0.5px', borderRadius: '2px' }}
                        >
                          + renovatie toevoegen
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
