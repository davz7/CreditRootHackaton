import LandingNavbar from './components/LandingNavbar'
import Footer from './components/Footer'
import CalculadoraHero from "./landingScreenComponents/CalculadoraHero";
import TresPasos from "./landingScreenComponents/TresPasos";
import CtaFinal from "./landingScreenComponents/CtaFinal";
import Marquee from './landingScreenComponents/Marquee';


export function LandingScreen({ onLogin, onRegister }) {
  return (
    <div className="bg-surface min-h-screen overflow-x-hidden">

      <LandingNavbar onLogin={onLogin} onRegister={onRegister} />

      {/* Hero */}
      <header className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Copy */}
          <div>
            <span className="inline-block bg-green-500/10 text-green-700 border border-green-500/20 rounded-lg px-4 py-1.5 text-xs font-semibold mb-6"
              style={{ animation: 'fadeUp .6s .08s both' }}>
              Stellar Testnet · Contrato Soroban
            </span>

            <h1 className="font-display font-black text-ink tracking-tight mb-4"
              style={{ fontSize: 'clamp(2.6rem,6vw,4rem)', lineHeight: 1.05, animation: 'fadeUp .7s .18s both' }}>
              Tu retiro,<br />
              <em className="text-brand italic">en tus manos.</em>
            </h1>

            <p className="text-ink/55 text-lg leading-relaxed max-w-md mb-8"
              style={{ animation: 'fadeUp .7s .28s both' }}>
              Ahorra en USDC desde $2 al mes. Tu dinero crece con la tasa
              CETES real y nadie — ni nosotros — puede tocarlo.
            </p>

            {/* Puntos clave */}
            <div className="flex flex-col gap-3 mb-10"
              style={{ animation: 'fadeUp .7s .38s both' }}>
              {[
                '~4.70% APY neto en USDC (tasa CETES real vía Etherfuse)',
                'Fondos bloqueados en contrato Soroban — nadie los mueve',
                'Autopréstamo de emergencia hasta 30% sin romper tu ahorro',
              ].map(texto => (
                <div key={texto} className="flex items-start gap-3 group">
                  <span className="w-5 h-5 rounded-full bg-brand group-hover:bg-brand flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                    <svg width="9" height="9" viewBox="0 0 10 10">
                      <polyline points="1,5 4,8 9,2" fill="none" stroke="#e3730d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-sm text-ink/55 leading-relaxed">{texto}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 flex-wrap" style={{ animation: 'fadeUp .7s .48s both' }}>
              <button
                className="bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-3.5 rounded-xl transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-brand/30"
                onClick={onRegister}>
                Comenzar ahora →
              </button>
              <button
                className="border-[1.5px] border-ink/20 text-ink font-semibold px-6 py-3.5 rounded-xl hover:bg-ink/5 hover:border-ink/30 hover:-translate-y-px transition-all"
                onClick={onLogin}>
                Ya tengo cuenta
              </button>
            </div>
          </div>

          {/* Calculadora */}
          <div style={{ animation: 'fadeUp .7s .3s both' }}>
            <CalculadoraHero onRegister={onRegister} />
          </div>

        </div>
      </header>

      <Marquee />
      <TresPasos />
      <CtaFinal onRegister={onRegister} onLogin={onLogin} />
      <Footer />
    </div>
  )
}