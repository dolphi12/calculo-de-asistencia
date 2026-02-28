export default function FileUpload({ onFileLoad, loading }) {
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileLoad(file);
    e.target.value = '';
  };

  return (
    <div className="file-upload">
      <label className="btn btn-primary" htmlFor="file-input">
        {loading ? 'Cargando...' : '📂 Cargar Excel'}
      </label>
      <input
        id="file-input"
        type="file"
        accept=".xlsx,.xls"
        onChange={handleChange}
        disabled={loading}
        style={{ display: 'none' }}
      />
    </div>
  );
}
