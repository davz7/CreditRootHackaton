import { useNavigate, useLocation } from 'react-router-dom'
import { navigationItems } from '../../app/navigation'
import { useEtherfuseRate } from '../../hooks/useEtherfuseRate'
import logoCompleto from '../../assets/LOGO_MS.png'

export function AppHeader({ usuario }) {
  const { userRate, isLive } = useEtherfuseRate()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="sticky top-0 z-50 px-4 py-3 bg-surface/90 backdrop-blur-md border-b border-ink/8 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">

        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
          <img src={logoCompleto} alt="Logo Mañana Seguro" className="h-8 w-auto rounded-lg" />
          <span className="font-display font-bold text-xl text-ink tracking-tight">
            Mañana <span className="text-brand">Seguro</span>
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navigationItems.map(item => (
            <button
              key={item.href}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-all cursor-pointer ${location.pathname === item.href
                  ? 'text-brand bg-brand/8'
                  : 'text-ink/45 hover:text-ink hover:bg-ink/5'
                }`}
              onClick={() => navigate(item.href)}>
              {item.label}
            </button>
          ))}
        </div>

        {/* Tasa en vivo + usuario */}
        <div className="flex items-center gap-3">

          <span className={`hidden lg:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${isLive
              ? 'bg-green-500/10 text-green-700 border-green-500/20'
              : 'bg-yellow-400/10 text-yellow-600 border-yellow-400/20'
            }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current pulse-dot" />
            {userRate}% APY
          </span>

          {usuario && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
                {usuario.nombre.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:block text-sm text-ink/50">
                {usuario.nombre.split(' ')[0]}
              </span>
            </div>
          )}

        </div>

      </div>
    </nav>
  )
}