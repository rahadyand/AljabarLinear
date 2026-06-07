export default function StatCard({ icon, label, value, loading, colorClass }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorClass}`}>
        <span>{icon}</span>
      </div>
      <div className="stat-value">
        {loading ? (
          <span className="spinner-border spinner-border-sm text-secondary" role="status" />
        ) : (
          value ?? '—'
        )}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
