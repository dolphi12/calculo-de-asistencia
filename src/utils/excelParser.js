import readXlsxFile from 'read-excel-file/browser';

export async function parseExcelFile(file) {
  // Read the JORNADAS_CIERRE sheet as raw rows (array of arrays)
  let rows;
  try {
    rows = await readXlsxFile(file, { sheet: 'JORNADAS_CIERRE', dateFormat: 'yyyy-mm-dd' });
  } catch (err) {
    if (err.message && err.message.includes('not found')) {
      throw new Error('Hoja JORNADAS_CIERRE no encontrada');
    }
    throw err;
  }

  if (!rows || rows.length < 2) return [];

  // First row is the header
  const headers = rows[0].map(h => (h == null ? '' : String(h).trim()));

  const records = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Build an object keyed by header name
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx] ?? '';
    });
    records.push(processRow(obj));
  }
  return records;
}

function assignEvents(events) {
  const fields = {
    entrada: '',
    salidaComer: '',
    regresoComer: '',
    salidaCenar: '',
    regresoCenar: '',
    salida: '',
    permiso: 0,
  };

  const count = events.length;

  if (count === 2) {
    fields.entrada = events[0];
    fields.salida = events[1];
  } else if (count === 4) {
    fields.entrada = events[0];
    fields.salidaComer = events[1];
    fields.regresoComer = events[2];
    fields.salida = events[3];
  } else if (count === 6) {
    fields.entrada = events[0];
    fields.salidaComer = events[1];
    fields.regresoComer = events[2];
    fields.salidaCenar = events[3];
    fields.regresoCenar = events[4];
    fields.salida = events[5];
  } else if (count > 0) {
    // Odd or > 6: assign up to 6, rest → permiso
    const slots = ['entrada','salidaComer','regresoComer','salidaCenar','regresoCenar','salida'];
    for (let i = 0; i < Math.min(count, 6); i++) {
      fields[slots[i]] = events[i];
    }
    // Extra events beyond 6: sum durations (consecutive pairs)
    if (count > 6) {
      let extra = 0;
      for (let i = 6; i + 1 < count; i += 2) {
        const start = timeToMinutes(events[i]);
        const end = timeToMinutes(events[i+1]);
        if (start !== null && end !== null && end > start) {
          extra += end - start;
        }
      }
      fields.permiso = extra;
    }
  }

  return fields;
}

function timeToMinutes(timeStr) {
  if (!timeStr || !timeStr.includes(':')) return null;
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

function extractDate(val) {
  if (!val) return '';
  // read-excel-file returns Date objects for date cells
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(val);
  if (str.includes('T')) return str.split('T')[0];
  if (str.match(/^\d{4}-\d{2}-\d{2}/)) return str.substring(0, 10);
  return str.length >= 10 ? str.substring(0, 10) : str;
}

function cellToString(val) {
  if (val == null || val === '') return '';
  // read-excel-file returns Date for time-formatted cells
  if (val instanceof Date) {
    const h = String(val.getUTCHours()).padStart(2, '0');
    const m = String(val.getUTCMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
  return String(val).trim();
}

function processRow(row) {
  const events = [];
  for (let i = 1; i <= 12; i++) {
    const key = `E${String(i).padStart(2, '0')}`;
    const val = cellToString(row[key]);
    if (val !== '') events.push(val);
  }

  const fields = assignEvents(events);
  const dateStr = extractDate(row.start_local || row.fecha_registro);

  const codes = cellToString(row.incidencia_codes).split(/[,;]/).map(c => c.trim()).filter(Boolean);
  const alertCodes = ['FALTA_SALIDA','JORNADA_ABIERTA','EVENTO_SUELTO','PAUSA_LARGA'];
  const hasCodeAlert = codes.some(c => alertCodes.includes(c));

  return {
    id: cellToString(row.employee_id),
    fecha: dateStr,
    nombre: cellToString(row.employee_name),
    entrada: fields.entrada,
    salidaComer: fields.salidaComer,
    regresoComer: fields.regresoComer,
    salidaCenar: fields.salidaCenar,
    regresoCenar: fields.regresoCenar,
    salida: fields.salida,
    permiso: fields.permiso,
    incidenciaCodes: codes,
    eventCount: events.length,
    hasCodeAlert,
    uid: cellToString(row.jornada_uid || row.__jornada_id) || crypto.randomUUID(),
  };
}
