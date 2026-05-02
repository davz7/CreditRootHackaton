import { WithdrawalFlow } from '../features/withdrawal/components/WithdrawalFlow'

export function WithdrawalScreen() {
  const pasos = [
    { icon: '💵', step: 'Depositas USDC', desc: 'Desde $2 USDC, cuando quieras' },
    { icon: '🔒', step: 'Contrato bloquea', desc: 'Soroban en Stellar testnet' },
    { icon: '📈', step: 'Etherfuse rinde', desc: '4.7% APY en USDC vía CETES' },
    { icon: '🎁', step: 'Incentivos c/5 años', desc: 'Hasta 9% extra por fidelidad' },
    { icon: '🏆', step: 'Retiras al llegar', desc: 'Todo a tu wallet, sin banco' },
  ]

  return (
    <section className="bg-surface py-16 lg:py-24">
      <div className="container mx-auto px-4">

        <div className="mb-8 anim-fade-up-1">
          <span className="inline-block bg-green-500/10 text-green-700 border border-green-500/20 rounded-lg px-4 py-1.5 text-xs font-semibold tracking-wide mb-4">
            Retiro · Mañana Seguro
          </span>
          <h2 className="font-display font-black text-ink tracking-tight mb-2"
            style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', lineHeight: 1.05 }}>
            Flujo de retiro
          </h2>
          <p className="text-ink/50 text-lg max-w-xl">
            Al alcanzar tu meta, el contrato libera todos tus fondos directamente a tu wallet.
            Sin intermediarios, sin esperas, sin banco.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 anim-fade-up-2">

          {/* WithdrawalFlow */}
          <div className="lg:col-span-8">
            <WithdrawalFlow meta={10000} />
          </div>

          {/* Pasos */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-ink/8 rounded-2xl p-6 h-full">
              <h6 className="font-semibold text-ink mb-5">El flujo completo</h6>
              <div className="flex flex-col gap-0">
                {pasos.map((item, i) => (
                  <div key={item.step} className="flex gap-3 items-start">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-xs font-bold text-brand">
                        {i + 1}
                      </div>
                      {i < pasos.length - 1 && (
                        <div className="w-px h-5 bg-ink/8 my-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-semibold text-ink mb-0.5">{item.icon} {item.step}</p>
                      <p className="text-xs text-ink/45">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}