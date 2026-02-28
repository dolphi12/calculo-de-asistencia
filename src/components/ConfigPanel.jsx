import { useState } from 'react';

export default function ConfigPanel({ jornadaBase, onJornadaBaseChange }) {
  const [open, setOpen] = useState(false);

  const hours = Math.floor(jornadaBase / 60);
  const minutes = jornadaBase % 60;
  const display = `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}`;

  const handleChange = (e) => {
    const val = e.target.value;
    if (!val.includes(':')) return;
    const [h, m] = val.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      onJornadaBaseChange(h * 60 + m);
    }
  };

  return (
    <div className="config-panel">
      <button className="btn btn-secondary" onClick={() => setOpen(!open)}>
        ⚙️ Configuración {open ? '▲' : '▼'}
      </button>
      {open && (
        <div className="config-content">
          <label>
            Jornada base (HH:MM):
            <input
              type="text"
              value={display}
              onChange={handleChange}
              pattern="\d{1,2}:\d{2}"
              className="config-input"
            />
          </label>
          <span className="config-hint">({jornadaBase} minutos)</span>
        </div>
      )}
    </div>
  );
}
