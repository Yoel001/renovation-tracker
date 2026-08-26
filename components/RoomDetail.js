'use client'

import { useState } from 'react'

const MONO = { fontFamily: "'DM Mono', monospace" }
const RED = '#8B1A1A'
const BLUE = '#1B3F8B'
const YELLOW = '#C8991A'

const RENO_TYPES = [
  'Schilderwerk', 'Elektriciteit', 'Loodgwerk / Water',
  'Vloeren', 'Dakwerk', 'Ramen / Deuren', 'Isolatie',
  'Verwarming / Koeling', 'Keuken', 'Badkamer', 'Overig'
]
const STATUS_OPTIONS = ['Idee', 'Gepland', 'Uitgevoerd']
const emptyForm = { renovation_type: '', custom_type: '', cost: '', status: 'Idee', start_date: '', notes: '', urls: [''] }

const statusColor = (s) => s === 'Gepland' ? RED : s === 'Uitgevoerd' ? BLUE : YELLOW

function FieldLabel({ text }) {
  return (
    <label style={{ ...MONO, display: 'block', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: '#bbb', marginBottom: '5px' }}>
      {text}
    </label>
  )
}

function RenoForm({ initial = emptyForm, onSave, onCancel }) {
  const [form, setForm] = useState({ ...emptyForm, ...initial, urls: initial.urls?.length ? initial.urls : [''] })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ display: 'grid', gap: '12px', padding: '16px', background: '#fafafa', border: '1px solid #ebebeb' }}>
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
            {form.urls.length > 1 && (
              <button onClick={() => set('urls', form.urls.filter((_, j) => j !== i))}
                style={{ padding: '6px 10px', background: 'transparent', border: '1px solid #e0e0e0', color: '#ccc' }}>✕</button>
            )}
          </div>
        ))}
        <button onClick={() => set('urls', [...form.urls, ''])}
          style={{ ...MONO, fontSize: '10px', color: '#bbb', background: 'transparent', border: '1px solid #e0e0e0', padding: '4px 10px' }}>
          + link
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid #ebebeb' }}>
        <button onClick={() => onSave(form)}
          style={{ padding: '8px 18px', background: '#1a1916', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '400' }}>
          Opslaan
        </button>
        <button onClick={onCancel}
          style={{ padding: '8px 18px', background: 'transparent', border: '1px solid #e0e0e0', color: '#999', fontSize: '12px' }}>
          Annuleren
        </button>
      </div>
    </div>
  )
}

export default function RoomDetail({ room, renovations, onRenameRoom, onDeleteRoom, onAddRenovation, onDeleteRenovation, onUpdateRenovation }) {
  const [editingName, setEditingName] = useState(false)
  const [roomName, setRoomName] = useState(room.name)
  const [addingReno, setAddingReno] = useState(false)
  const [editingRenoId, setEditingRenoId] = useState(null)

  const totalGepland = renovations.filter(r => r.status === 'Gepland').reduce((s, r) => s + (parseFloat(r.cost) || 0), 0)
  const totalUitgevoerd = renovations.filter(r => r.status === 'Uitgevoerd').reduce((s, r) => s + (parseFloat(r.cost) || 0), 0)

  return (
    <div>
      {/* Room header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #ebebeb' }}>
        <div>
          {editingName ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input value={roomName} onChange={e => setRoomName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { onRenameRoom(room.id, roomName); setEditingName(false) } }}
                autoFocus style={{ fontSize: '18px', fontWeight: '500', padding: '4px 8px' }} />
              <button onClick={() => { onRenameRoom(room.id, roomName); setEditingName(false) }}
                style={{ padding: '6px 12px', background: '#1a1916', color: '#fff', border: 'none' }}>✓</button>
              <button onClick={() => setEditingName(false)}
                style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #e0e0e0', color: '#999' }}>✕</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#1a1916', margin: 0 }}>{room.name}</h2>
              <button onClick={() => { setEditingName(true); setRoomName(room.name) }}
                style={{ ...MONO, fontSize: '9px', color: '#bbb', background: 'transparent', border: 'none', textDecoration: 'underline', padding: 0 }}>
                naam
              </button>
            </div>
          )}
          <div style={{ ...MONO, fontSize: '9px', color: '#ccc', marginTop: '4px', letterSpacing: '0.5px' }}>
            {renovations.length} renovatie{renovations.length !== 1 ? 's' : ''}
            {totalGepland > 0 && <span style={{ color: RED }}> · €{Math.round(totalGepland).toLocaleString()} gepland</span>}
            {totalUitgevoerd > 0 && <span style={{ color: BLUE }}> · €{Math.round(totalUitgevoerd).toLocaleString()} uitgevoerd</span>}
          </div>
        </div>
        <button onClick={() => onDeleteRoom(room.id)}
          style={{ ...MONO, fontSize: '9px', color: '#ccc', background: 'transparent', border: '1px solid #e8e8e8', padding: '5px 10px' }}>
          Verwijder
        </button>
      </div>

      {/* Renovations list */}
      <div style={{ marginBottom: '12px' }}>
        {renovations.length === 0 && !addingReno ? (
          <div style={{ ...MONO, fontSize: '11px', color: '#ccc', padding: '20px 0', textAlign: 'center', border: '1px dashed #ebebeb' }}>
            Geen renovaties
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
                  <div style={{ padding: '10px 0', borderBottom: '1px solid #f2f2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '400', color: reno.status === 'Idee' ? '#bbb' : '#1a1916', marginBottom: '2px' }}>
                        {displayName}
                      </div>
                      {reno.start_date && (
                        <div style={{ ...MONO, fontSize: '9px', color: '#ccc' }}>
                          {new Date(reno.start_date).toLocaleDateString('nl-NL')}
                        </div>
                      )}
                      {reno.notes && (
                        <div style={{ fontSize: '11px', color: '#bbb', marginTop: '2px' }}>{reno.notes}</div>
                      )}
                      {reno.urls?.filter(u => u).length > 0 && (
                        <div style={{ marginTop: '4px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {reno.urls.filter(u => u).map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                              style={{ ...MONO, fontSize: '9px', color: '#aaa', textDecoration: 'underline' }}>
                              ↗ link {i + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '16px' }}>
                      <span style={{ ...MONO, fontSize: '12px', fontWeight: '400', color: reno.status === 'Idee' ? '#ccc' : '#1a1916' }}>
                        €{Math.round(parseFloat(reno.cost) || 0).toLocaleString()}
                      </span>
                      <div style={{ width: '8px', height: '8px', background: statusColor(reno.status), flexShrink: 0 }} title={reno.status} />
                      <button onClick={() => setEditingRenoId(reno.id)}
                        style={{ ...MONO, fontSize: '9px', color: '#bbb', background: 'transparent', border: 'none', textDecoration: 'underline', padding: 0 }}>
                        aanpassen
                      </button>
                      <button onClick={() => onDeleteRenovation(reno.id)}
                        style={{ ...MONO, fontSize: '9px', color: '#ddd', background: 'transparent', border: 'none', padding: 0 }}>
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}

        {addingReno && (
          <div style={{ marginTop: '8px' }}>
            <RenoForm
              onSave={(form) => { onAddRenovation(room.id, form); setAddingReno(false) }}
              onCancel={() => setAddingReno(false)}
            />
          </div>
        )}
      </div>

      {!addingReno && (
        <button onClick={() => setAddingReno(true)}
          style={{ ...MONO, fontSize: '10px', color: '#bbb', background: 'transparent', border: '1px dashed #e0e0e0', padding: '8px 0', width: '100%', letterSpacing: '0.5px' }}>
          + renovatie toevoegen
        </button>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f2f2f2' }}>
        {[['Idee', YELLOW], ['Gepland', RED], ['Uitgevoerd', BLUE]].map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '7px', height: '7px', background: color }} />
            <span style={{ ...MONO, fontSize: '9px', color: '#bbb', letterSpacing: '0.5px' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
