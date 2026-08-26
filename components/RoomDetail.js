'use client'

import { useState } from 'react'

const RENO_TYPES = [
  'Schilderwerk', 'Elektriciteit', 'Loodgwerk / Water',
  'Vloeren', 'Dakwerk', 'Ramen / Deuren', 'Isolatie',
  'Verwarming / Koeling', 'Keuken', 'Badkamer', 'Overig'
]
const STATUS_OPTIONS = ['Idee', 'Gepland', 'Uitgevoerd']
const emptyForm = { renovation_type: '', custom_type: '', cost: '', status: 'Idee', start_date: '', notes: '', urls: [''] }

const mono = { fontFamily: "'DM Mono', monospace" }
const serif = { fontFamily: "'DM Serif Display', serif" }

function FieldLabel({ text }) {
  return <label style={{ ...mono, display: 'block', fontSize: '9px', letterSpacing: '0.8px', textTransform: 'uppercase', color: '#888', marginBottom: '5px' }}>{text}</label>
}

function StatusTag({ status }) {
  const map = {
    'Idee':      { bg: '#f0f0f0', color: '#888' },
    'Gepland':   { bg: '#1a1a18', color: '#f2efe6' },
    'Uitgevoerd':{ bg: '#e8f0e4', color: '#3a6b2a' },
  }
  const s = map[status] || map['Idee']
  return <span style={{ ...mono, background: s.bg, color: s.color, fontSize: '9px', padding: '3px 8px', letterSpacing: '0.8px', textTransform: 'uppercase', borderRadius: '2px' }}>{status}</span>
}

function RenoForm({ initial = emptyForm, onSave, onCancel }) {
  const [form, setForm] = useState({ ...emptyForm, ...initial, urls: initial.urls?.length ? initial.urls : [''] })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ display: 'grid', gap: '14px', padding: '16px', background: 'white', border: '1px solid #e0ddd5', borderRadius: '2px' }}>
      <div>
        <FieldLabel text="Type werk *" />
        <select value={form.renovation_type} onChange={e => set('renovation_type', e.target.value)}>
          <option value="">— Selecteer —</option>
          {RENO_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {form.renovation_type === 'Overig' && (
        <div>
          <FieldLabel text="Specificeer *" />
          <input type="text" placeholder="Bijv. Pergola, Tuinaanleg..." value={form.custom_type} onChange={e => set('custom_type', e.target.value)} autoFocus />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <FieldLabel text="Kosten (€) *" />
          <input type="number" placeholder="0" min="0" step="100" value={form.cost} onChange={e => set('cost', e.target.value)} />
        </div>
        <div>
          <FieldLabel text="Status" />
          <select value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <FieldLabel text="Datum (optioneel)" />
        <input type="date" value={form.start_date || ''} onChange={e => set('start_date', e.target.value)} />
      </div>

      <div>
        <FieldLabel text="Opmerkingen" />
        <textarea placeholder="Details..." value={form.notes} onChange={e => set('notes', e.target.value)} style={{ minHeight: '56px', resize: 'vertical' }} />
      </div>

      <div>
        <FieldLabel text="Links" />
        {form.urls.map((url, i) => (
          <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
            <input type="url" placeholder="https://..." value={url} onChange={e => { const u = [...form.urls]; u[i] = e.target.value; set('urls', u) }} style={{ flex: 1 }} />
            {form.urls.length > 1 && <button onClick={() => set('urls', form.urls.filter((_, j) => j !== i))} style={{ padding: '6px 10px', background: 'transparent', border: '1px solid #e0ddd5', cursor: 'pointer', color: '#999', borderRadius: '2px' }}>✕</button>}
          </div>
        ))}
        <button onClick={() => set('urls', [...form.urls, ''])} style={{ ...mono, fontSize: '10px', color: '#999', background: 'transparent', border: '1px dashed #ccc', padding: '4px 10px', cursor: 'pointer', borderRadius: '2px' }}>
          + link
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', paddingTop: '4px', borderTop: '1px solid #e0ddd5' }}>
        <button onClick={() => onSave(form)} style={{ ...mono, padding: '8px 18px', background: '#1a1a18', color: '#f2efe6', border: 'none', fontSize: '11px', letterSpacing: '0.5px', cursor: 'pointer', borderRadius: '2px' }}>Opslaan</button>
        <button onClick={onCancel} style={{ ...mono, padding: '8px 18px', background: 'transparent', border: '1px solid #e0ddd5', fontSize: '11px', letterSpacing: '0.5px', cursor: 'pointer', borderRadius: '2px' }}>Annuleren</button>
      </div>
    </div>
  )
}

export default function RoomDetail({ room, renovations, onRenameRoom, onDeleteRoom, onAddRenovation, onDeleteRenovation, onUpdateRenovation }) {
  const [editingName, setEditingName] = useState(false)
  const [roomName, setRoomName] = useState(room.name)
  const [addingReno, setAddingReno] = useState(false)
  const [editingRenoId, setEditingRenoId] = useState(null)

  const totalCost = renovations.filter(r => r.status !== 'Idee').reduce((s, r) => s + (parseFloat(r.cost) || 0), 0)
  const doneCost = renovations.filter(r => r.status === 'Uitgevoerd').reduce((s, r) => s + (parseFloat(r.cost) || 0), 0)

  return (
    <div>
      {/* Room header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
        <div>
          {editingName ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input value={roomName} onChange={e => setRoomName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { onRenameRoom(room.id, roomName); setEditingName(false) } }}
                autoFocus style={{ ...serif, fontSize: '22px', padding: '4px 8px', background: 'white' }} />
              <button onClick={() => { onRenameRoom(room.id, roomName); setEditingName(false) }}
                style={{ ...mono, padding: '6px 12px', background: '#1a1a18', color: '#f2efe6', border: 'none', fontSize: '11px', cursor: 'pointer', borderRadius: '2px' }}>✓</button>
              <button onClick={() => setEditingName(false)}
                style={{ ...mono, padding: '6px 12px', background: 'transparent', border: '1px solid #e0ddd5', fontSize: '11px', cursor: 'pointer', borderRadius: '2px' }}>✕</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <h2 style={{ ...serif, fontSize: '26px', fontWeight: 'normal', margin: 0 }}>{room.name}</h2>
              <button onClick={() => { setEditingName(true); setRoomName(room.name) }}
                style={{ ...mono, fontSize: '10px', color: '#999', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0', textDecoration: 'underline' }}>
                naam aanpassen
              </button>
            </div>
          )}
          <div style={{ ...mono, fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
            {renovations.length} renovatie{renovations.length !== 1 ? 's' : ''}
            {totalCost > 0 && <span> · €{Math.round(totalCost).toLocaleString()} geraamd · €{Math.round(doneCost).toLocaleString()} uitgevoerd</span>}
          </div>
        </div>
        <button onClick={() => onDeleteRoom(room.id)}
          style={{ ...mono, fontSize: '10px', color: '#bbb', background: 'transparent', border: '1px solid #e0ddd5', padding: '6px 12px', cursor: 'pointer', borderRadius: '2px' }}>
          Verwijder ruimte
        </button>
      </div>

      {/* Renovations */}
      <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
        {renovations.length === 0 && !addingReno ? (
          <div style={{ ...mono, fontSize: '12px', color: '#bbb', padding: '24px 0', textAlign: 'center', border: '1px dashed #e0ddd5', borderRadius: '2px' }}>
            Geen renovaties in deze ruimte
          </div>
        ) : (
          renovations.map(reno => {
            const displayName = reno.renovation_type === 'Overig' && reno.custom_type ? reno.custom_type : reno.renovation_type
            return (
              <div key={reno.id}>
                {editingRenoId === reno.id ? (
                  <RenoForm
                    initial={{ renovation_type: reno.renovation_type, custom_type: reno.custom_type || '', cost: reno.cost, status: reno.status, start_date: reno.start_date || '', notes: reno.notes || '', urls: reno.urls?.length ? reno.urls : [''] }}
                    onSave={(form) => { onUpdateRenovation(reno.id, form); setEditingRenoId(null) }}
                    onCancel={() => setEditingRenoId(null)}
                  />
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', padding: '14px 16px', background: 'white', border: '1px solid #e0ddd5', borderRadius: '2px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ ...serif, fontSize: '14px' }}>{displayName}</span>
                        <StatusTag status={reno.status} />
                      </div>
                      <div style={{ ...mono, fontSize: '13px', fontWeight: '500', marginBottom: '2px' }}>
                        €{Math.round(parseFloat(reno.cost) || 0).toLocaleString()}
                      </div>
                      {reno.start_date && <div style={{ ...mono, fontSize: '10px', color: '#aaa' }}>{new Date(reno.start_date).toLocaleDateString('nl-NL')}</div>}
                      {reno.notes && <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', fontStyle: 'italic' }}>{reno.notes}</div>}
                      {reno.urls?.filter(u => u).length > 0 && (
                        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {reno.urls.filter(u => u).map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                              style={{ ...mono, fontSize: '10px', color: '#1a1a18', border: '1px solid #e0ddd5', padding: '2px 8px', borderRadius: '2px', textDecoration: 'none', background: '#faf8f3' }}>
                              ↗ Link {i + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginLeft: '12px' }}>
                      <button onClick={() => setEditingRenoId(reno.id)} style={{ ...mono, fontSize: '10px', color: '#666', background: 'transparent', border: '1px solid #e0ddd5', padding: '5px 10px', cursor: 'pointer', borderRadius: '2px' }}>Aanpassen</button>
                      <button onClick={() => onDeleteRenovation(reno.id)} style={{ ...mono, fontSize: '10px', color: '#bbb', background: 'transparent', border: '1px solid #e0ddd5', padding: '5px 10px', cursor: 'pointer', borderRadius: '2px' }}>✕</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}

        {addingReno && (
          <RenoForm
            onSave={(form) => { onAddRenovation(room.id, form); setAddingReno(false) }}
            onCancel={() => setAddingReno(false)}
          />
        )}
      </div>

      {!addingReno && (
        <button onClick={() => setAddingReno(true)}
          style={{ ...mono, width: '100%', padding: '10px', background: 'transparent', border: '1px dashed #ccc', cursor: 'pointer', fontSize: '11px', color: '#999', letterSpacing: '0.5px', borderRadius: '2px' }}>
          + renovatie toevoegen
        </button>
      )}
    </div>
  )
}
