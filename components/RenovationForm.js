'use client'

import { useState } from 'react'

export default function RenovationForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    location: '',
    renovation_type: '',
    budget: '',
    actual: '',
    status: 'Gepland',
    start_date: '',
    notes: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.location || !formData.renovation_type) {
      alert('Vul Ruimte en Type in!')
      return
    }
    await onSubmit(formData)
    setFormData({
      location: '',
      renovation_type: '',
      budget: '',
      actual: '',
      status: 'Gepland',
      start_date: '',
      notes: '',
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
          Ruimte/Onderdeel *
        </label>
        <input
          type="text"
          placeholder="bijv. Woonkamer, Buitengevel, Terras"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          required
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
          Type werk *
        </label>
        <select
          value={formData.renovation_type}
          onChange={(e) => setFormData({ ...formData, renovation_type: e.target.value })}
          required
        >
          <option value="">-- Selecteer --</option>
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
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
            Budget (€)
          </label>
          <input
            type="number"
            placeholder="0"
            min="0"
            step="100"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
            Werkelijk (€)
          </label>
          <input
            type="number"
            placeholder="0"
            min="0"
            step="100"
            value={formData.actual}
            onChange={(e) => setFormData({ ...formData, actual: e.target.value })}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="Gepland">Gepland</option>
            <option value="In uitvoering">In uitvoering</option>
            <option value="Afgerond">Afgerond</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
            Startdatum
          </label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
          Aantekeningen
        </label>
        <textarea
          placeholder="Details, bijzonderheden..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          style={{ minHeight: '80px' }}
        />
      </div>

      <button
        type="submit"
        style={{
          backgroundColor: '#378add',
          color: 'white',
          fontWeight: '500',
          padding: '12px',
        }}
      >
        + Toevoegen
      </button>
    </form>
  )
}
