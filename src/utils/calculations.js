export function timeToMinutes(timeStr) {
  if (!timeStr || !timeStr.includes(':')) return null;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

export function minutesToTime(minutes) {
  if (minutes === null || minutes === undefined || minutes < 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

export function detectAlerts(record) {
  const alerts = [];
  const count = record.eventCount;

  if (count > 0 && count !== 2 && count !== 4 && count !== 6) {
    alerts.push(`Número de eventos inusual: ${count}`);
  }

  if (!record.entrada) alerts.push('Falta ENTRADA');
  if (!record.salida) alerts.push('Falta SALIDA');

  const entradaMin = timeToMinutes(record.entrada);
  const salidaMin = timeToMinutes(record.salida);

  if (entradaMin !== null && salidaMin !== null && salidaMin <= entradaMin) {
    alerts.push('SALIDA antes o igual que ENTRADA');
  }

  if (record.salidaComer && !record.regresoComer) alerts.push('Falta REGRESO DE COMER');
  if (!record.salidaComer && record.regresoComer) alerts.push('Falta SALIDA A COMER');

  if (record.salidaComer && record.regresoComer) {
    const sc = timeToMinutes(record.salidaComer);
    const rc = timeToMinutes(record.regresoComer);
    if (sc !== null && rc !== null && rc <= sc) alerts.push('REGRESO DE COMER antes o igual que SALIDA A COMER');
  }

  if (record.salidaCenar && !record.regresoCenar) alerts.push('Falta REGRESO DE CENAR');
  if (!record.salidaCenar && record.regresoCenar) alerts.push('Falta SALIDA A CENAR');

  if (record.salidaCenar && record.regresoCenar) {
    const sc = timeToMinutes(record.salidaCenar);
    const rc = timeToMinutes(record.regresoCenar);
    if (sc !== null && rc !== null && rc <= sc) alerts.push('REGRESO DE CENAR antes o igual que SALIDA A CENAR');
  }

  if (record.hasCodeAlert) {
    record.incidenciaCodes.forEach(c => {
      const alertCodes = ['FALTA_SALIDA','JORNADA_ABIERTA','EVENTO_SUELTO','PAUSA_LARGA'];
      if (alertCodes.includes(c)) alerts.push(`Código de incidencia: ${c}`);
    });
  }

  return alerts;
}

export function calculateRecord(record, jornadaBase) {
  const entradaMin = timeToMinutes(record.entrada);
  const salidaMin = timeToMinutes(record.salida);
  const salidaComerMin = timeToMinutes(record.salidaComer);
  const regresoComerMin = timeToMinutes(record.regresoComer);
  const salidaCenarMin = timeToMinutes(record.salidaCenar);
  const regresoCenarMin = timeToMinutes(record.regresoCenar);
  const permiso = Number(record.permiso) || 0;

  let comidaDiscount = 0;
  if (salidaComerMin !== null && regresoComerMin !== null) {
    const dur = regresoComerMin - salidaComerMin;
    comidaDiscount = dur === 60 ? 30 : Math.max(0, dur);
  }

  let cenaDiscount = 0;
  if (salidaCenarMin !== null && regresoCenarMin !== null) {
    const dur = regresoCenarMin - salidaCenarMin;
    cenaDiscount = Math.max(0, dur);
  }

  const descuentoNoLaborado = comidaDiscount + cenaDiscount + permiso;

  let tiempoTrabajado = null;
  if (entradaMin !== null && salidaMin !== null) {
    tiempoTrabajado = (salidaMin - entradaMin) - descuentoNoLaborado;
  }

  const horasExtra = tiempoTrabajado !== null ? Math.max(0, tiempoTrabajado - jornadaBase) : 0;

  const alerts = detectAlerts(record);

  return {
    ...record,
    comidaDiscount,
    cenaDiscount,
    descuentoNoLaborado,
    tiempoTrabajado,
    horasExtra,
    alerts,
    hasAlert: alerts.length > 0,
  };
}
