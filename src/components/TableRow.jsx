import { useState } from 'react';

function EditableTime({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleBlur = () => {
    setEditing(false);
    // validate HH:MM
    if (draft === '' || /^\d{1,2}:\d{2}$/.test(draft)) {
      // validate ranges
      if (draft !== '') {
        const [h, m] = draft.split(':').map(Number);
        if (h > 23 || m > 59) { setDraft(value); return; }
      }
      onChange(draft);
    } else {
      setDraft(value);
    }
  };

  if (editing) {
    return (
      <input
        type="text"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={e => {
          if (e.key === 'Enter') e.target.blur();
          if (e.key === 'Escape') { setDraft(value); setEditing(false); }
        }}
        autoFocus
        className="cell-input time-input"
        placeholder="HH:MM"
      />
    );
  }

  return (
    <span
      className={`cell-value ${!value ? 'cell-empty' : ''}`}
      onClick={() => { setDraft(value); setEditing(true); }}
      title="Click para editar"
    >
      {value || '—'}
    </span>
  );
}

export default function TableRow({ record, onUpdate }) {
  const update = (field, value) => onUpdate(record.uid, field, value);

  const rowClass = record.hasAlert ? 'row-alert' : '';

  return (
    <tr className={rowClass} title={record.alerts?.join('\n')}>
      <td className="col-alert">{record.hasAlert ? <span title={record.alerts?.join('\n')}>⚠️</span> : ''}</td>
      <td>{record.id}</td>
      <td>{record.fecha}</td>
      <td>{record.nombre}</td>
      <td><EditableTime value={record.entrada} onChange={v => update('entrada', v)} /></td>
      <td><EditableTime value={record.salidaComer} onChange={v => update('salidaComer', v)} /></td>
      <td><EditableTime value={record.regresoComer} onChange={v => update('regresoComer', v)} /></td>
      <td><EditableTime value={record.salidaCenar} onChange={v => update('salidaCenar', v)} /></td>
      <td><EditableTime value={record.regresoCenar} onChange={v => update('regresoCenar', v)} /></td>
      <td><EditableTime value={record.salida} onChange={v => update('salida', v)} /></td>
      <td>
        <input
          type="number"
          value={record.permiso}
          onChange={e => update('permiso', Number(e.target.value))}
          min="0"
          className="cell-input number-input"
        />
      </td>
      <td className="col-calc">{record.descuentoNoLaborado ?? ''}</td>
      <td className="col-calc">{record.tiempoTrabajado ?? ''}</td>
      <td className="col-calc">{record.horasExtra ?? ''}</td>
    </tr>
  );
}
