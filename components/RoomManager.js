'use client'

import { useState } from 'react'

export default function RoomManager({ rooms, renovations, onAddRoom, onDeleteRoom, onAddRenovation, onDeleteRenovation, onUpdateRenovation }) {
  const [expandedRoom, setExpandedRoom] = useState(null)
  const [newRoomName, setNewRoomName] = useState('')
  const [editingRenovation, setEditingRenovation] = useState(null)

  const [formData, setFormData] = useState({
    renovation_type: '',
    cost: '',
    status: 'Gepland',
    start_date: '',
    notes: '',
  })

  const handleAddRoom = async (e) => {
    e.preventDefault()
    if (!newRoomName.trim()) return
    await onAddRoom(newRoomName)
    setNewRoomName('')
  }

  const handleAddRenovation = async (roomId) => {
    if (!formData.renovation_type || !formData.cost) {
      alert('Vul Type en Bedrag in!')
      return
    }
    await onAddRenovation(roomId, formData)
    setFormData({
      renovation_type: '',
      cost: '',
      status: 'Gepland',
      start_date: '',
      notes: '',
    })
  }

  const getRenovationsForRoom = (roomId) => {
    return renovations.filter(r => r.room_id === roomId)
  }

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {/* Add Room Section */}
      <div style={{ background: 'white', border: '0.5px solid #e0e0e0', borderRadius: '12px', padding: '16px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '600' }}>Nieuwe ruimte toevoegen</h3>
        <form onSubmit={handleAddRoom} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="bijv. Woonkamer, Badkamer, Buitengevel..."
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            style={{
              background: '#378add',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            + Toevoegen
          </button>
        </form>
      </div>

      {/* Rooms List */}
      {rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#999' }}>
          Geen ruimtes toegevoegd
        </div>
      ) : (
        rooms.map(room => {
          const roomRenovations = getRenovationsForRoom(room.id)
          const totalCost = roomRenovations.reduce((sum, r) => sum + (parseFloat(r.cost) || 0), 0)
          const isExpanded = expandedRoom === room.id

          return (
            <div key={room.id} style={{ background: 'white', border: '0.5px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden' }}>
              {/* Room Header */}
              <div
                onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: isExpanded ? '#f5f5f5' : 'white',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                  ▶
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{room.name}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#999' }}>
                    {roomRenovations.length} renovatie{roomRenovations.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div style={{ textAlign: 'right', marginRight: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#999' }}>Totaal</div>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>€{Math.round(totalCost).toLocaleString()}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteRoom(room.id)
                  }}
                  style={{
                    background: '#fcebeb',
                    color: '#a32d2d',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  Verwijderen
                </button>
              </div>

              {/* Room Details */}
              {isExpanded && (
                <div style={{ borderTop: '0.5px solid #e0e0e0', padding: '16px', background: '#fafafa' }}>
                  {/* Add Renovation Form */}
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '0.5px solid #e0e0e0' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600' }}>Renovatie toevoegen</h4>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <select
                        value={formData.renovation_type}
                        onChange={(e) => setFormData({ ...formData, renovation_type: e.target.value })}
                        style={{ padding: '8px' }}
                      >
                        <option value="">-- Type selecteren --</option>
                        <option value="Schilderwerk">Schilderwerk</option>
                        <option value="Elektriciteit">Elektriciteit</option>
                        <option value="Loodgwerk">Loodgwerk / Water</option>
                        <option value="Vloeren">Vloeren</option>
                        <option value="Dakwerk">Dakwerk</option>
                        <option value="Ramen/Deuren">Ramen / Deuren</option>
                        <option value="Isolatie">Isolatie</option>
                        <option value="HVAC">Verwarming / Koeling</option>
                        <option value="Keukens">Keuken renovatie</option>
                        <option value="Badkamers">Badkamer renovatie</option>
                        <option value="Overig">Overig</option>
                      </select>

                      <input
                        type="number"
                        placeholder="Kosten (€)"
                        min="0"
                        step="100"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        style={{ padding: '8px' }}
                      />

                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        style={{ padding: '8px' }}
                      >
                        <option value="Gepland">Gepland</option>
                        <option value="In uitvoering">In uitvoering</option>
                        <option value="Afgerond">Afgerond</option>
                      </select>

                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        style={{ padding: '8px' }}
                      />

                      <textarea
                        placeholder="Opmerkingen (optioneel)"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        style={{ padding: '8px', minHeight: '60px', fontFamily: 'inherit' }}
                      />

                      <button
                        onClick={() => handleAddRenovation(room.id)}
                        style={{
                          background: '#378add',
                          color: 'white',
                          border: 'none',
                          padding: '10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500',
                        }}
                      >
                        + Renovatie toevoegen
                      </button>
                    </div>
                  </div>

                  {/* Renovations List */}
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {roomRenovations.length === 0 ? (
                      <p style={{ margin: 0, color: '#999', fontSize: '13px' }}>Geen renovaties in deze ruimte</p>
                    ) : (
                      roomRenovations.map(reno => (
                        <div
                          key={reno.id}
                          style={{
                            background: 'white',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '0.5px solid #e0e0e0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                              {reno.renovation_type}
                            </div>
                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                              €{Math.round(parseFloat(reno.cost) || 0).toLocaleString()}
                            </div>
                            {reno.start_date && (
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {new Date(reno.start_date).toLocaleDateString('nl-NL')}
                              </div>
                            )}
                            {reno.notes && (
                              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', fontStyle: 'italic' }}>
                                "{reno.notes}"
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span
                              style={{
                                background:
                                  reno.status === 'Afgerond' ? '#eaf3de' :
                                  reno.status === 'In uitvoering' ? '#faeeda' : '#e6f1fb',
                                color:
                                  reno.status === 'Afgerond' ? '#3b6d11' :
                                  reno.status === 'In uitvoering' ? '#ba7517' : '#185fa5',
                                fontSize: '10px',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {reno.status}
                            </span>
                            <button
                              onClick={() => onDeleteRenovation(reno.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#a32d2d',
                                cursor: 'pointer',
                                fontSize: '14px',
                                padding: '0',
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
