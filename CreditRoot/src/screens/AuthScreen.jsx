import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePollar } from '@pollar/react'
import Footer from './components/Footer'
import LandingNavbar from './components/LandingNavbar'
import { conectarWallet } from '../lib/wallet'
import ardilla from '../assets/Ardilla_vector.png'
import { usePollarSession } from '../hooks/usePollarSession'

export function AuthScreen({ onAuth, onVolver }) {
    const { t } = useTranslation()
    const [paso, setPaso] = useState('inicio') // 'inicio' | 'freighter' | 'nombre'
    const [walletAddressFreighter, setWalletAddressFreighter] = useState(null)
    const [nombre, setNombre] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const pollar = usePollarSession()

    const { login, walletAddress, isAuthenticated } = usePollar()

    console.log('keys:', Object.keys(pollar ?? {}))


    useEffect(() => {
        if (isAuthenticated && walletAddress) {
            onAuth({
                nombre: walletAddress.slice(0, 8),
                walletAddress: walletAddress,
            })
        }
    }, [isAuthenticated, walletAddress])

    // Si Pollar ya tiene sesión activa, autenticar directo
    /*if (wallet && paso === 'inicio') {
        onAuth({
            nombre: wallet.user?.name ?? wallet.user?.email ?? wallet.address.slice(0, 8),
            walletAddress: wallet.address,
        })
    }*/

    async function handleLoginGoogle() {
        setLoading(true)
        setError(null)
        try {
            await login({ provider: 'google' })
            // Si llegó aquí sin error, el login fue exitoso
            // Reload para que Pollar restaure la sesión desde storage
            window.location.reload()
        } catch (e) {
            setError(e.message ?? 'No se pudo iniciar sesión. Intenta de nuevo.')
            setLoading(false)
        }
    }

    async function handleLoginEmail() {
        setLoading(true)
        setError(null)
        try {
            await login({ provider: 'email' })
        } catch (e) {
            setError(e.message ?? 'No se pudo iniciar sesión. Intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    async function handleConectarFreighter() {
        setLoading(true)
        setError(null)
        try {
            const address = await conectarWallet()
            setWalletAddressFreighter(address)
            setPaso('nombre')
        } catch (e) {
            if (e.message.includes('Freighter no está disponible')) {
                setError('Freighter no está instalado. Instálalo desde freighter.app')
            } else if (e.message.includes('Cancelaste')) {
                setError('Cancelaste la conexión. Intenta de nuevo.')
            } else {
                setError(e.message ?? 'No se pudo conectar la wallet. Intenta de nuevo.')
            }
        } finally {
            setLoading(false)
        }
    }

    function handleSubmit(e) {
        e.preventDefault()
        if (!nombre.trim()) {
            setError(t('auth.nombreLabel') + ' requerido')
            return
        }
        onAuth({ nombre: nombre.trim(), walletAddress: walletAddressFreighter })
    }

    const tituloIzq = paso === 'nombre'
        ? <>{t('auth.tituloNombre')}<br /><em className="text-brand italic">{t('auth.tituloNombreAccent')}</em></>
        : <>{t('auth.tituloWallet')}<br /><em className="text-brand italic">{t('auth.tituloWalletAccent')}</em></>

    const descIzq = paso === 'nombre' ? t('auth.descNombre') : t('auth.descWallet')

    return (
        <div className="bg-surface dark:bg-[#0f0e0d] min-h-screen overflow-x-hidden">
            <LandingNavbar soloVolver onVolver={onVolver} />

            <div className="container mx-auto px-4 py-16 lg:py-24">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* Copy izquierda */}
                    <div className="hidden lg:flex flex-col justify-center anim-fade-up-1">
                        <span className="inline-block bg-brand/10 text-brand-dark border border-brand/20 rounded-lg px-4 py-1.5 text-xs font-semibold tracking-wide mb-6">
                            🛡️ {t('auth.badge')}
                        </span>
                        <h1 className="font-display font-black text-ink dark:text-white tracking-tight mb-4"
                            style={{ fontSize: 'clamp(2.4rem,5vw,3.6rem)', lineHeight: 1.05 }}>
                            {tituloIzq}
                        </h1>
                        <p className="text-ink/50 dark:text-white/50 text-lg leading-relaxed max-w-md mb-8">
                            {descIzq}
                        </p>
                        <div className="mt-4">
                            <img src={ardilla} alt="Mascota Mañana Seguro" className="h-48 object-contain float-squirrel" />
                        </div>
                    </div>

                    {/* Card */}
                    <div className="anim-fade-up-2">
                        <div className="bg-white dark:bg-white/5 rounded-3xl p-8 lg:p-10 border border-ink/8 dark:border-white/8 shadow-xl shadow-ink/5">

                            {/* ── Paso inicio — Pollar + Freighter ── */}
                            {paso === 'inicio' && (
                                <div className="flex flex-col gap-4">

                                    <div className="text-center mb-2">
                                        <h3 className="font-display font-black text-ink dark:text-white text-2xl mb-2">
                                            {t('auth.tituloWallet')}
                                        </h3>
                                        <p className="text-ink/45 dark:text-white/45 text-sm leading-relaxed">
                                            {t('auth.descWallet')}
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="bg-red-500/8 border border-dashed border-red-400/40 text-red-500 text-sm text-center px-4 py-3 rounded-xl">
                                            ⚠️ {error}
                                        </div>
                                    )}

                                    {/* Google */}
                                    <button
                                        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-white/5 border border-ink/10 dark:border-white/10 hover:border-ink/20 dark:hover:border-white/20 text-ink dark:text-white font-semibold py-3.5 rounded-xl transition-all hover:-translate-y-px hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={handleLoginGoogle}
                                        disabled={loading}>
                                        {loading ? (
                                            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                        )}
                                        {t('auth.continuarGoogle')}
                                    </button>


                                    {/* Divisor */}
                                    <div className="flex items-center gap-3 my-1">
                                        <div className="flex-1 h-px bg-ink/8 dark:bg-white/8" />
                                        <span className="text-xs text-ink/30 dark:text-white/30">o</span>
                                        <div className="flex-1 h-px bg-ink/8 dark:bg-white/8" />
                                    </div>

                                    {/* Freighter */}
                                    <button
                                        className="w-full flex items-center justify-center gap-3 border border-ink/10 dark:border-white/10 hover:border-brand/30 text-ink/50 dark:text-white/50 hover:text-brand font-medium py-3 rounded-xl transition-all cursor-pointer text-sm disabled:opacity-50"
                                        onClick={() => setPaso('freighter')}
                                        disabled={loading}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="7" width="20" height="14" rx="2" />
                                            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                                        </svg>
                                        {t('auth.usarFreighter')}
                                    </button>

                                </div>
                            )}

                            {/* ── Paso freighter ── */}
                            {paso === 'freighter' && (
                                <div className="flex flex-col items-center text-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e3730d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="7" width="20" height="14" rx="2" />
                                            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                                            <line x1="12" y1="12" x2="12" y2="16" />
                                            <line x1="10" y1="14" x2="14" y2="14" />
                                        </svg>
                                    </div>

                                    <div>
                                        <h3 className="font-display font-black text-ink dark:text-white text-2xl mb-2">
                                            {t('auth.conectar')}
                                        </h3>
                                        <p className="text-ink/45 dark:text-white/45 text-sm leading-relaxed max-w-xs mx-auto">
                                            {t('auth.descWallet')}
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="w-full bg-red-500/8 border border-dashed border-red-400/40 text-red-500 text-sm text-center px-4 py-3 rounded-xl">
                                            ⚠️ {error}
                                            {error.includes('freighter.app') && (
                                                <a href="https://freighter.app" target="_blank" rel="noopener noreferrer"
                                                    className="block mt-2 text-brand underline font-medium">
                                                    {t('auth.instalar')} →
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-4 rounded-xl transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-brand/30 cursor-pointer disabled:opacity-50"
                                        onClick={handleConectarFreighter}
                                        disabled={loading}>
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                                </svg>
                                                {t('auth.conectando')}
                                            </span>
                                        ) : t('auth.conectar')}
                                    </button>

                                    <button
                                        className="text-sm text-ink/30 dark:text-white/30 hover:text-ink/60 transition-colors cursor-pointer"
                                        onClick={() => { setPaso('inicio'); setError(null) }}>
                                        ← {t('auth.cambiarWallet')}
                                    </button>
                                </div>
                            )}

                            {/* ── Paso nombre (solo Freighter) ── */}
                            {paso === 'nombre' && (
                                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                    <div className="bg-green-500/8 border border-green-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
                                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-green-700 font-semibold mb-0.5">{t('auth.walletConectada')}</p>
                                            <p className="text-xs text-ink/40 dark:text-white/40 font-mono truncate">{walletAddressFreighter}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-display font-black text-ink dark:text-white text-2xl mb-1">
                                            {t('auth.tituloNombreAccent')}
                                        </h3>
                                        <p className="text-ink/40 dark:text-white/40 text-sm">{t('auth.descNombre')}</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-ink/40 dark:text-white/40 uppercase tracking-widest mb-2">
                                            {t('auth.nombreLabel')}
                                        </label>
                                        <input
                                            className="w-full rounded-xl px-5 py-3.5 text-base bg-white dark:bg-white/5 outline-none transition-all duration-200 border border-ink/10 dark:border-white/10 focus:border-brand focus:ring-2 focus:ring-brand/20 text-ink dark:text-white"
                                            placeholder={t('auth.nombrePlaceholder')}
                                            value={nombre}
                                            onChange={e => setNombre(e.target.value)}
                                            autoFocus
                                        />
                                    </div>

                                    {error && (
                                        <div className="bg-red-500/8 border border-dashed border-red-400/40 text-red-500 text-sm text-center px-4 py-3 rounded-xl">
                                            ⚠️ {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-4 rounded-xl transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-brand/30 cursor-pointer">
                                        {t('auth.entrar')}
                                    </button>

                                    <button
                                        type="button"
                                        className="text-sm text-ink/30 dark:text-white/30 hover:text-ink/60 dark:hover:text-white/60 transition-colors cursor-pointer"
                                        onClick={() => { setPaso('inicio'); setError(null) }}>
                                        {t('auth.cambiarWallet')}
                                    </button>
                                </form>
                            )}

                        </div>
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    )
}