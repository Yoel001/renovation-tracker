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
  cost: '',
  status: 'Gepland',
  start_date: '',
  notes: '',
  urls: [''],
}

function Btn({ onClick, children, variant = 'default', style = {} }) {
  const base = {
    padding: '7px 14px',
    border: '1px solid #000',
    fontWeight: '500',
    fontSize: '12px',
    cursor: 'pointer',
    background: variant === 'primary' ? '#000' : '#fff',
    color: variant === 'primary' ? '#fff' : '#000',
    ...style,
  }
  return <button onClick={onClick} style={base}>{children}</button>
}

function Tag({ status }) {
  const colors = {
    'Gepland': { bg: '#f0f0f0', color: '#000' },
    'In uitvoering': { bg: '#000', color: '#fff' },
    'Afgerond': { bg: '#d4edda', color: '#000' },
  }
  const c = colors[status] || colors['Gepland']
  return (
    <span style={{
      background: c.bg,
      color: c.color,
      fontSize: '10px',
      padding: '2px 8px',
      fontWeight: '600',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
    }}>
      {status}
    </span>
  )
}

function RenoForm({ initial = emptyForm, onSave, onCancel }) {
  const [form, setForm] = useState(initial)

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const setUrl = (i, v) => {
    const urls = [...form.urls]
    urls[i] = v
    setField('urls', urls)
  }

  const addUrl = () => setField('urls', [...form.urls, ''])
  const removeUrl = (i) => setField('urls', form.urls.filter((_, j) => j !== i))

  const label = (text) => (
    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px', color: '#555' }}>
      {text}
    </label>
  )

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div>
        {label('Type werk *')}
        <select value={form.renovation_type} onChange={e => setField('renovation_type', e.target.value)}>
          <option value="">— Selecteer —</option>
          {RENO_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          {label('Kosten (€) *')}
          <input type="number" placeholder="0" min="0" step="100"
            value={form.cost} onChange={e => setField('cost', e.target.value)} />
        </div>
        <div>
          {label('Status')}
          <select value={form.status} onChange={e => setField('status', e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        {label('Datum (optioneel)')}
        <input type="date" value={form.start_date} onChange={e => setField('start_date', e.target.value)} />
      </div>

      <div>
        {label('Opmerkingen')}
        <textarea placeholder="Details, bijzonderheden..."
          value={form.notes} onChange={e => setField('notes', e.target.value)}
          style={{ minHeight: '60px', resize: 'vertical' }} />
      </div>

      <div>
        {label('Links (materialen / inspiratie)')}
        {form.urls.map((url, i) => (
          <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
            <input type="url" placeholder="https://..." value={url} onChange={e => setUrl(i, e.target.value)} style={{ flex: 1 }} />
            {form.urls.length > 1 && (
              <button onClick={() => removeUrl(i)} style={{ padding: '7px 10px', border: '1px solid #000', background: '#fff', cursor: 'pointer', fontSize: '14px' }}>✕</button>
            )}
          </div>
        ))}
        <button onClick={addUrl} style={{ fontSize: '11px', padding: '5px 10px', border: '1px dashed #999', background: '#fff', cursor: 'pointer', color: '#555', fontWeight: '500' }}>
          + Link toevoegen
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <Btn variant="primary" onClick={() => onSave(form)}>Opslaan</Btn>
        <Btn onClick={onCancel}>Annuleren</Btn>
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

  const handleAddRoom = (e) => {
    e.preventDefault()
    if (!newRoomName.trim()) return
    onAddRoom(newRoomName.trim())
    setNewRoomName('')
  }

  const handleRenameRoom = (roomId) => {
    if (!editingRoomName.trim()) return
    onRenameRoom(roomId, editingRoomName.trim())
    setEditingRoomId(null)
    setEditingRoomName('')
  }

  const handleAddReno = async (roomId, form) => {
    if (!form.renovation_type || !form.cost) { alert('Vul Type en Bedrag in!'); return }
    await onAddRenovation(roomId, form)
    setAddingRenoInRoom(null)
  }

  const handleUpdateReno = async (renoId, form) => {
    if (!form.renovation_type || !form.cost) { alert('Vul Type en Bedrag in!'); return }
    await onUpdateRenovation(renoId, form)
    setEditingRenoId(null)
  }

  return (
    <div style={{ display: 'grid', gap: '0' }}>
      {/* Add Room */}
      <form onSubmit={handleAddRoom} style={{ display: 'flex', gap: '0', marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Nieuwe ruimte (bv. Woonkamer, Buitengevel...)"
          value={newRoomName}
          onChange={e => setNewRoomName(e.target.value)}
          style={{ flex: 1, borderRight: 'none' }}
        />
        <button type="submit" style={{ padding: '8px 20px', background: '#000', color: '#fff', border: '1px solid #000', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          + Ruimte
        </button>
      </form>

      {rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999', border: '1px dashed #ccc' }}>
          Geen ruimtes. Voeg een ruimte toe om te beginnen.
        </div>
      ) : (
        <div style={{ border: '1px solid #000' }}>
          {rooms.map((room, roomIdx) => {
            const renos = getRenos(room.id)
            const total = renos.reduce((sum, r) => sum + (parseFloat(r.cost) || 0), 0)
            const isExpanded = expandedRoom === room.id
            const isEditingName = editingRoomId === room.id

            return (
              <div key={room.id} style={{ borderBottom: roomIdx < rooms.length - 1 ? '1px solid #000' : 'none' }}>
                {/* Room Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 16px',
                  background: isExpanded ? '#f8f8f8' : '#fff',
                  gap: '12px',
                }}>
                  <div
                    onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
                    style={{ cursor: 'pointer', fontSize: '10px', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'none', userSelect: 'none' }}
                  >
                    ▶
                  </div>

                  {isEditingName ? (
                    <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                      <input
                        value={editingRoomName}
                        onChange={e => setEditingRoomName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleRenameRoom(room.id)}
                        autoFocus
                        style={{ flex: 1, padding: '4px 8px', fontSize: '14px', fontWeight: '600' }}
                      />
                      <Btn variant="primary" onClick={() => handleRenameRoom(room.id)}>✓</Btn>
                      <Btn onClick={() => setEditingRoomId(null)}>✕</Btn>
                    </div>
                  ) : (
                    <>
                      <div
                        onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
                        style={{ flex: 1, cursor: 'pointer' }}
                      >
                        <span style={{ fontWeight: '600', fontSize: '15px' }}>{room.name}</span>
                        <span style={{ color: '#999', fontSize: '12px', marginLeft: '10px' }}>
                          {renos.length} renovatie{renos.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <span style={{ fontWeight: '700', fontSize: '15px', marginRight: '16px' }}>
                        €{Math.round(total).toLocaleString()}
                      </span>
                      <Btn onClick={() => { setEditingRoomId(room.id); setEditingRoomName(room.name) }} style={{ fontSize: '11px', padding: '4px 10px' }}>
                        Naam
                      </Btn>
                      <Btn onClick={() => onDeleteRoom(room.id)} style={{ fontSize: '11px', padding: '4px 10px', color: '#999', borderColor: '#ccc' }}>
                        Verwijder
                      </Btn>
                    </>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #e0e0e0', background: '#fafafa', padding: '16px' }}>
                    {/* Renovations */}
                    {renos.length > 0 && (
                      <div style={{ marginBottom: '16px', border: '1px solid #e0e0e0', background: '#fff' }}>
                        {renos.map((reno, i) => (
                          <div key={reno.id} style={{ borderBottom: i < renos.length - 1 ? '1px solid #e0e0e0' : 'none', padding: '12px 14px' }}>
                            {editingRenoId === reno.id ? (
                              <RenoForm
                                initial={{
                                  renovation_type: reno.renovation_type,
                                  cost: reno.cost,
                                  status: reno.status,
                                  start_date: reno.start_date || '',
                                  notes: reno.notes || '',
                                  urls: reno.urls?.length ? reno.urls : [''],
                                }}
                                onSave={(form) => handleUpdateReno(reno.id, form)}
                                onCancel={() => setEditingRenoId(null)}
                              />
                            ) : (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: '600', fontSize: '13px' }}>{reno.renovation_type}</span>
                                    <Tag status={reno.status} />
                                  </div>
                                  <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>
                                    €{Math.round(parseFloat(reno.cost) || 0).toLocaleString()}
                                  </div>
                                  {reno.start_date && (
                                    <div style={{ fontSize: '11px', color: '#666' }}>
                                      {new Date(reno.start_date).toLocaleDateString('nl-NL')}
                                    </div>
                                  )}
                                  {reno.notes && (
                                    <div style={{ fontSize: '12px', color: '#555', marginTop: '4px', fontStyle: 'italic' }}>
                                      {reno.notes}
                                    </div>
                                  )}
                                  {reno.urls?.filter(u => u).length > 0 && (
                                    <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                      {reno.urls.filter(u => u).map((url, i) => (
                                        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                          style={{ fontSize: '11px', color: '#000', textDecoration: 'underline', border: '1px solid #ddd', padding: '2px 8px' }}>
                                          🔗 Link {i + 1}
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div style={{ display: 'flex', gap: '6px', marginLeft: '12px' }}>
                                  <Btn onClick={() => setEditingRenoId(reno.id)} style={{ fontSize: '11px', padding: '4px 10px' }}>
                                    Aanpassen
                                  </Btn>
                                  <Btn onClick={() => onDeleteRenovation(reno.id)} style={{ fontSize: '11px', padding: '4px 10px', color: '#999', borderColor: '#ccc' }}>
                                    ✕
                                  </Btn>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Renovation */}
                    {addingRenoInRoom === room.id ? (
                      <div style={{ border: '1px solid #000', padding: '16px', background: '#fff' }}>
                        <div style={{ fontWeight: '600', fontSize: '12px', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
                          Renovatie toevoegen
                        </div>
                        <RenoForm
                          onSave={(form) => handleAddReno(room.id, form)}
                          onCancel={() => setAddingRenoInRoom(null)}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingRenoInRoom(room.id)}
                        style={{ width: '100%', padding: '10px', border: '1px dashed #999', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#555', letterSpacing: '0.5px' }}
                      >
                        + Renovatie toevoegen
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
