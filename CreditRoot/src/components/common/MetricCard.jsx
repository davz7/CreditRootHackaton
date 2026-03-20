export function MetricCard({ label, value, caption, tone = 'default' }) {
  const classes = ['metric-card']

  if (tone !== 'default') {
    classes.push(`metric-card--${tone}`)
  }

  return (
    <article className={classes.join(' ')}>
      <span className="metric-card__label">{label}</span>
      <p className="metric-card__value">{value}</p>
      {caption ? <p className="metric-card__caption">{caption}</p> : null}
    </article>
  )
}
