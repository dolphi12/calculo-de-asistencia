import { useState } from 'react';
import TableRow from './TableRow';

const COLUMNS = [
  { key: 'hasAlert', label: 'ALERTA', sortable: false },
  { key: 'id', label: 'ID', sortable: true },
  { key: 'fecha', label: 'FECHA', sortable: true },
  { key: 'nombre', label: 'NOMBRE', sortable: true },
  { key: 'entrada', label: 'ENTRADA', sortable: true },
  { key: 'salidaComer', label: 'SALIDA A COMER', sortable: false },
  { key: 'regresoComer', label: 'REGRESO DE COMER', sortable: false },
  { key: 'salidaCenar', label: 'SALIDA A CENAR', sortable: false },
  { key: 'regresoCenar', label: 'REGRESO DE CENAR', sortable: false },
  { key: 'salida', label: 'SALIDA', sortable: true },
  { key: 'permiso', label: 'PERMISO (min)', sortable: true },
  { key: 'descuentoNoLaborado', label: 'DESCUENTO NO LABORADO', sortable: true },
  { key: 'tiempoTrabajado', label: 'TIEMPO TRABAJADO', sortable: true },
  { key: 'horasExtra', label: 'HORAS EXTRA', sortable: true },
];

export default function AttendanceTable({ records, onUpdate }) {
  const [sortKey, setSortKey] = useState('fecha');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = [...records].sort((a, b) => {
    const av = a[sortKey] ?? '';
    const bv = b[sortKey] ?? '';
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  if (records.length === 0) {
    return (
      <div className="empty-state">
        <p>📋 No hay datos cargados. Sube un archivo Excel para comenzar.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="attendance-table">
        <thead>
          <tr>
            {COLUMNS.map(col => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={col.sortable ? 'sortable' : ''}
              >
                {col.label}
                {col.sortable && sortKey === col.key && (sortDir === 'asc' ? ' ▲' : ' ▼')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map(record => (
            <TableRow
              key={record.uid}
              record={record}
              onUpdate={onUpdate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
