import { navigationItems } from '../../app/navigation'

export function AppHeader() {
  return (
    <header className="app-header">
      <div className="shell-container app-header__inner">
        <div className="brand-lockup">
          <span className="brand-lockup__eyebrow">Retiro complementario</span>
          <h1 className="brand-lockup__name">RetiroChain</h1>
          <p className="brand-lockup__copy">
            Ahorro voluntario en USDC para trabajadores formales e informales.
          </p>
        </div>

        <nav className="app-nav" aria-label="Secciones principales">
          {navigationItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
