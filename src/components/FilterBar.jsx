export default function FilterBar({ search, onSearch, soloAlertas, onSoloAlertas, total, filtered }) {
  return (
    <div className="filter-bar">
      <input
        type="text"
        placeholder="Buscar por ID o nombre..."
        value={search}
        onChange={e => onSearch(e.target.value)}
        className="search-input"
      />
      <label className="alert-toggle">
        <input
          type="checkbox"
          checked={soloAlertas}
          onChange={e => onSoloAlertas(e.target.checked)}
        />
        ⚠️ Solo alertas
      </label>
      <span className="record-count">
        {filtered} / {total} registros
      </span>
    </div>
  );
}
