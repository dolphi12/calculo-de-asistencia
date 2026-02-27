import * as XLSX from 'xlsx';

export function exportToExcel(records) {
  const data = records.map(r => ({
    'ID': r.id,
    'FECHA': r.fecha,
    'NOMBRE': r.nombre,
    'ENTRADA': r.entrada,
    'SALIDA A COMER': r.salidaComer,
    'REGRESO DE COMER': r.regresoComer,
    'SALIDA A CENAR': r.salidaCenar,
    'REGRESO DE CENAR': r.regresoCenar,
    'SALIDA': r.salida,
    'PERMISO (min)': r.permiso,
    'DESCUENTO NO LABORADO (min)': r.descuentoNoLaborado ?? '',
    'TIEMPO TRABAJADO (min)': r.tiempoTrabajado ?? '',
    'HORAS EXTRA (min)': r.horasExtra ?? '',
    'ALERTAS': (r.alerts || []).join('; '),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ASISTENCIA');
  XLSX.writeFile(wb, 'asistencia_calculada.xlsx');
}
