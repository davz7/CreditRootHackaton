import { useEffect, useState } from 'react'
import logoCompleto from '../../assets/LOGO_MS.png'
function LandingNavbar({ onLogin, onRegister, onVolver, soloVolver }) {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <nav className={`sticky top-0 z-50 px-4 py-3 transition-shadow duration-300 bg-surface/90 backdrop-blur-md border-b border-ink/8 ${scrolled ? 'shadow-md' : ''}`}>
            <div className="container mx-auto flex justify-between items-center">

                <div className="flex items-center gap-2">
                    <img src={logoCompleto} alt="Logo Mañana Seguro" className="h-8 w-auto rounded-lg" />
                    <span className="font-display font-bold text-xl text-ink tracking-tight">
                        Mañana <span className="text-brand">Seguro</span>
                    </span>
                </div>

                {soloVolver ? (
                    <button className="text-gray hover:text-ink text-sm font-medium transition-colors" onClick={onVolver}>
                        ← Volver al inicio
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            className="hidden md:block text-gray hover:text-ink text-sm font-medium px-4 py-2 rounded-lg hover:bg-ink/5 transition-all"
                            onClick={onLogin}>
                            Iniciar sesión
                        </button>
                        <button
                            className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-brand"
                            onClick={onRegister}>
                            Comenzar gratis
                        </button>
                    </div>
                )}

            </div>
        </nav>
    )
}
export default LandingNavbar