'use client'

export default function RenovationsList({ renovations, onDelete }) {
  // Group by location
  const grouped = renovations.reduce((acc, r) => {
    if (!acc[r.location]) {
      acc[r.location] = []
    }
    acc[r.location].push(r)
    return acc
  }, {})

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {Object.entries(grouped).map(([location, items]) => {
        const locationBudget = items.reduce((sum, r) => sum + (parseFloat(r.budget) || 0), 0)
        const locationActual = items.reduce((sum, r) => sum + (parseFloat(r.actual) || 0), 0)
        const diff = locationActual - locationBudget

        return (
          <div
            key={location}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#fafafa',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>
                {location}
              </h3>
              <span
                style={{
                  backgroundColor: diff > 0 ? '#fcebeb' : '#eaf3de',
                  color: diff > 0 ? '#a32d2d' : '#3b6d11',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              >
                {diff > 0 ? '⚠️' : '✓'} €{Math.round(Math.abs(diff)).toLocaleString()}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
              marginBottom: '12px',
            }}>
              <div style={{ backgroundColor: '#f0f0f0', padding: '8px', borderRadius: '6px', textAlign: 'center', fontSize: '12px' }}>
                <div style={{ color: '#666', marginBottom: '2px' }}>Budget</div>
                <div style={{ fontWeight: '600' }}>€{Math.round(locationBudget).toLocaleString()}</div>
              </div>
              <div style={{ backgroundColor: '#f0f0f0', padding: '8px', borderRadius: '6px', textAlign: 'center', fontSize: '12px' }}>
                <div style={{ color: '#666', marginBottom: '2px' }}>Werkelijk</div>
                <div style={{ fontWeight: '600' }}>€{Math.round(locationActual).toLocaleString()}</div>
              </div>
              <div style={{ backgroundColor: '#f0f0f0', padding: '8px', borderRadius: '6px', textAlign: 'center', fontSize: '12px' }}>
                <div style={{ color: '#666', marginBottom: '2px' }}>Items</div>
                <div style={{ fontWeight: '600' }}>{items.length}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '12px' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '2px' }}>
                      {item.renovation_type}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {item.start_date || 'geen datum'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      €{Math.round(parseFloat(item.budget) || 0).toLocaleString()} → €{Math.round(parseFloat(item.actual) || 0).toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      <span
                        style={{
                          backgroundColor:
                            item.status === 'Afgerond' ? '#eaf3de' :
                            item.status === 'In uitvoering' ? '#faeeda' : '#e6f1fb',
                          color:
                            item.status === 'Afgerond' ? '#3b6d11' :
                            item.status === 'In uitvoering' ? '#ba7517' : '#185fa5',
                          fontSize: '10px',
                          padding: '2px 8px',
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
                          padding: '0 4px',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
