import { useState, useCallback } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import ConfigPanel from './components/ConfigPanel';
import FilterBar from './components/FilterBar';
import AttendanceTable from './components/AttendanceTable';
import { parseExcelFile } from './utils/excelParser';
import { calculateRecord } from './utils/calculations';
import { exportToExcel } from './utils/exportExcel';

export default function App() {
  const [rawRecords, setRawRecords] = useState([]);
  const [jornadaBase, setJornadaBase] = useState(480);
  const [search, setSearch] = useState('');
  const [soloAlertas, setSoloAlertas] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const records = rawRecords.map(r => calculateRecord(r, jornadaBase));

  const filteredRecords = records.filter(r => {
    if (soloAlertas && !r.hasAlert) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.id.toLowerCase().includes(q) || r.nombre.toLowerCase().includes(q);
    }
    return true;
  });

  const handleFileLoad = useCallback(async (file) => {
    setLoading(true);
    setError('');
    try {
      const parsed = await parseExcelFile(file);
      setRawRecords(parsed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdate = useCallback((uid, field, value) => {
    setRawRecords(prev => prev.map(r => r.uid === uid ? { ...r, [field]: value } : r));
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Cálculo de Asistencia</h1>
        <div className="header-actions">
          <FileUpload onFileLoad={handleFileLoad} loading={loading} />
          {rawRecords.length > 0 && (
            <button className="btn btn-success" onClick={() => exportToExcel(records)}>
              📥 Exportar a Excel
            </button>
          )}
        </div>
      </header>

      {error && <div className="error-banner">❌ {error}</div>}

      <main className="app-main">
        <ConfigPanel jornadaBase={jornadaBase} onJornadaBaseChange={setJornadaBase} />
        <FilterBar
          search={search}
          onSearch={setSearch}
          soloAlertas={soloAlertas}
          onSoloAlertas={setSoloAlertas}
          total={records.length}
          filtered={filteredRecords.length}
        />
        <AttendanceTable
          records={filteredRecords}
          onUpdate={handleUpdate}
        />
      </main>
    </div>
  );
}
