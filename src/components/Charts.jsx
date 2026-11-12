import { fmt } from '../utils/helpers'

export function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, padding: '9px 13px', fontSize: 12 }}>
      <div style={{ color: 'var(--text2)', marginBottom: 5 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--text)', fontFamily: 'var(--mono)', fontSize: 12 }}>
          {p.name}: {fmt(p.value, true)}
        </div>
      ))}
    </div>
  )
}

export function HealthScore({ score }) {
  const color = score >= 75 ? 'var(--green)' : score >= 55 ? 'var(--amber)' : 'var(--red)'
  const label = score >= 75 ? 'Excellent' : score >= 55 ? 'Moderate' : 'Needs Work'
  const D = 180, offset = D * (1 - score / 100)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
      <svg width={160} height={90} viewBox="0 0 160 90">
        <path d="M16,85 A64,64 0 0,1 144,85" fill="none" stroke="var(--bg4)" strokeWidth={12} strokeLinecap="round" />
        <path d="M16,85 A64,64 0 0,1 144,85" fill="none" stroke={color} strokeWidth={12} strokeLinecap="round"
          strokeDasharray={D} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1s ease' }} />
        <text x={80} y={80} textAnchor="middle" fill={color} fontSize={28} fontWeight={600} fontFamily="DM Mono,monospace">{score}</text>
      </svg>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{label} · Budget Health</div>
    </div>
  )
}

export function SparkLine({ data, color, height = 38 }) {
  if (!data || data.length < 2) return null
  const vals = data.map(d => d.net)
  const mn = Math.min(...vals), mx = Math.max(...vals), rng = mx - mn || 1
  const w = 110, h = height
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * w},${h - ((v - mn) / rng) * h}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color || 'var(--blue)'} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
