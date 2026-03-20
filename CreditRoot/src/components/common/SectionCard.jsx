export function SectionCard({ className = '', children }) {
  const composedClassName = ['section-card', className].filter(Boolean).join(' ')

  return <article className={composedClassName}>{children}</article>
}
