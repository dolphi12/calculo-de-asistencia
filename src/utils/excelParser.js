import * as XLSX from 'xlsx';

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' });
        const sheet = workbook.Sheets['JORNADAS_CIERRE'];
        if (!sheet) {
          reject(new Error('Hoja JORNADAS_CIERRE no encontrada'));
          return;
        }
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        const records = rows.map(row => processRow(row));
        resolve(records);
      } catch(err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
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
  const str = String(val);
  // If it's a date string like "2024-01-15" or "2024-01-15T..."
  if (str.includes('T')) return str.split('T')[0];
  if (str.match(/^\d{4}-\d{2}-\d{2}/)) return str.substring(0, 10);
  // If it's a number (Excel serial date)
  const num = Number(str);
  if (!isNaN(num) && num > 40000) {
    const date = XLSX.SSF.parse_date_code(num);
    if (date) {
      return `${date.y}-${String(date.m).padStart(2,'0')}-${String(date.d).padStart(2,'0')}`;
    }
  }
  return str.length >= 10 ? str.substring(0, 10) : str;
}

function processRow(row) {
  const events = [];
  for (let i = 1; i <= 12; i++) {
    const key = `E${String(i).padStart(2,'0')}`;
    const val = row[key];
    if (val && String(val).trim() !== '') {
      events.push(String(val).trim());
    }
  }

  const fields = assignEvents(events);
  const dateStr = extractDate(row.start_local || row.fecha_registro);

  const codes = String(row.incidencia_codes || '').split(/[,;]/).map(c => c.trim()).filter(Boolean);
  const alertCodes = ['FALTA_SALIDA','JORNADA_ABIERTA','EVENTO_SUELTO','PAUSA_LARGA'];
  const hasCodeAlert = codes.some(c => alertCodes.includes(c));

  return {
    id: String(row.employee_id || ''),
    fecha: dateStr,
    nombre: String(row.employee_name || ''),
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
    uid: String(row.jornada_uid || row.__jornada_id || Math.random()),
  };
}
