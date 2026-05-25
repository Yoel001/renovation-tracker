'use client'

export default function DashboardStats({ renovations }) {
  const totalBudget = renovations.reduce((sum, r) => sum + (parseFloat(r.budget) || 0), 0)
  const totalActual = renovations.reduce((sum, r) => sum + (parseFloat(r.actual) || 0), 0)
  const diff = totalActual - totalBudget
  const rooms = new Set(renovations.map(r => r.location)).size

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '12px',
      marginBottom: '24px',
    }}>
      <div style={{
        background: '#e6f1fb',
        padding: '16px',
        borderRadius: '8px',
      }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
          Totaal budget
        </div>
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#185fa5' }}>
          €{Math.round(totalBudget).toLocaleString()}
        </div>
      </div>

      <div style={{
        background: '#eaf3de',
        padding: '16px',
        borderRadius: '8px',
      }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
          Daadwerkelijk
        </div>
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#3b6d11' }}>
          €{Math.round(totalActual).toLocaleString()}
        </div>
      </div>

      <div style={{
        background: diff > 0 ? '#fcebeb' : '#eaf3de',
        padding: '16px',
        borderRadius: '8px',
      }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
          Verschil
        </div>
        <div style={{
          fontSize: '20px',
          fontWeight: '600',
          color: diff > 0 ? '#a32d2d' : '#3b6d11',
        }}>
          {diff > 0 ? '+' : ''}€{Math.round(diff).toLocaleString()}
        </div>
      </div>

      <div style={{
        background: '#faeeda',
        padding: '16px',
        borderRadius: '8px',
      }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
          Ruimtes
        </div>
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#ba7517' }}>
          {rooms}
        </div>
      </div>
    </div>
  )
}
