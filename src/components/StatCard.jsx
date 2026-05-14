export default function StatCard({ label, value, sub, icon, color = 'var(--primary)', iconBg = 'var(--primary-lt)' }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg, color }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="stat-num">{value}</p>
        <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-h)' }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-m)' }}>{sub}</p>}
      </div>
    </div>
  )
}
