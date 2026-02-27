import writeXlsxFile from 'write-excel-file/browser';

const SCHEMA = [
  { column: 'ID',                        type: String, value: r => r.id },
  { column: 'FECHA',                     type: String, value: r => r.fecha },
  { column: 'NOMBRE',                    type: String, value: r => r.nombre },
  { column: 'ENTRADA',                   type: String, value: r => r.entrada },
  { column: 'SALIDA A COMER',            type: String, value: r => r.salidaComer },
  { column: 'REGRESO DE COMER',          type: String, value: r => r.regresoComer },
  { column: 'SALIDA A CENAR',            type: String, value: r => r.salidaCenar },
  { column: 'REGRESO DE CENAR',          type: String, value: r => r.regresoCenar },
  { column: 'SALIDA',                    type: String, value: r => r.salida },
  { column: 'PERMISO (min)',             type: Number, value: r => r.permiso ?? 0 },
  { column: 'DESCUENTO NO LABORADO (min)', type: Number, value: r => r.descuentoNoLaborado ?? 0 },
  { column: 'TIEMPO TRABAJADO (min)',    type: Number, value: r => r.tiempoTrabajado ?? 0 },
  { column: 'HORAS EXTRA (min)',         type: Number, value: r => r.horasExtra ?? 0 },
  { column: 'ALERTAS',                   type: String, value: r => (r.alerts || []).join('; ') },
];

export async function exportToExcel(records) {
  await writeXlsxFile(records, {
    schema: SCHEMA,
    fileName: 'asistencia_calculada.xlsx',
  });
}
