'use client'

import { useState } from 'react'

export default function RoomOverview({ renovations, onDelete }) {
  const [expandedRooms, setExpandedRooms] = useState({})

  // Group renovations by room
  const roomsData = renovations.reduce((acc, r) => {
    if (!acc[r.location]) {
      acc[r.location] = []
    }
    acc[r.location].push(r)
    return acc
  }, {})

  const toggleRoom = (room) => {
    setExpandedRooms(prev => ({
      ...prev,
      [room]: !prev[room]
    }))
  }

  const rooms = Object.keys(roomsData).sort()

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#999', fontSize: '14px' }}>
          Geen renovaties toegevoegd
        </div>
      ) : (
        rooms.map(room => {
          const items = roomsData[room]
          const roomBudget = items.reduce((sum, r) => sum + (parseFloat(r.budget) || 0), 0)
          const roomActual = items.reduce((sum, r) => sum + (parseFloat(r.actual) || 0), 0)
          const roomDiff = roomActual - roomBudget
          const isExpanded = expandedRooms[room]
          const overage = roomDiff > 0

          return (
            <div
              key={room}
              style={{
                background: 'white',
                border: '0.5px solid #e0e0e0',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              {/* Room Header - Clickable Toggle */}
              <div
                onClick={() => toggleRoom(room)}
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
                {/* Toggle Arrow */}
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  }}
                >
                  ▶
                </div>

                {/* Room Info */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                    {room}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                    {items.length} item{items.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Summary Stats */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '2px' }}>Budget</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                      €{Math.round(roomBudget).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '2px' }}>Werkelijk</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                      €{Math.round(roomActual).toLocaleString()}
                    </div>
                  </div>
                  <div
                    style={{
                      background: overage ? '#fcebeb' : '#eaf3de',
                      color: overage ? '#a32d2d' : '#3b6d11',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {overage ? '⚠️ +€' : '✓ €'}{Math.round(Math.abs(roomDiff)).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div style={{ borderTop: '0.5px solid #e0e0e0', padding: '16px', background: '#fafafa' }}>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {items.map((item, idx) => (
                      <div
                        key={item.id || idx}
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
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: '#1a1a1a' }}>
                            {item.renovation_type}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                            {item.start_date ? new Date(item.start_date).toLocaleDateString('nl-NL') : 'Geen datum'}
                          </div>
                          {item.notes && (
                            <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', marginTop: '4px' }}>
                              "{item.notes}"
                            </div>
                          )}
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                          <div>
                            <div style={{ fontSize: '11px', color: '#999', marginBottom: '2px' }}>Budget → Werkelijk</div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                              €{Math.round(parseFloat(item.budget) || 0).toLocaleString()} → €{Math.round(parseFloat(item.actual) || 0).toLocaleString()}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <span
                              style={{
                                background:
                                  item.status === 'Afgerond' ? '#eaf3de' :
                                  item.status === 'In uitvoering' ? '#faeeda' : '#e6f1fb',
                                color:
                                  item.status === 'Afgerond' ? '#3b6d11' :
                                  item.status === 'In uitvoering' ? '#ba7517' : '#185fa5',
                                fontSize: '10px',
                                padding: '3px 8px',
                                borderRadius: '4px',
                              }}
                            >
                              {item.status}
                            </span>
                            <button
                              onClick={() => onDelete(item.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#a32d2d',
                                cursor: 'pointer',
                                fontSize: '14px',
                                padding: '0',
                              }}
                              aria-label="Verwijder"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
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
