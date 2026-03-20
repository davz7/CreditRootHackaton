import { ConnectButton, useAccesly } from 'accesly'
import { SectionCard } from '../../../components/common/SectionCard'

export function ConnectAccountCard() {
  const { wallet, balance } = useAccesly()

  return (
    <SectionCard className="connect-card">
      <div>
        <span className="status-pill status-pill--positive">Acceso wallet listo</span>
        <h3>Onboarding con Accesly</h3>
        <p className="section-description">
          Esta caja representa el bloque de entrada al producto: login, wallet
          Stellar y acceso al ahorro voluntario.
        </p>
      </div>

      <ConnectButton />

      <div className="connect-card__wallet">
        <div className="mini-panel">
          <span className="mini-panel__label">Estado de cuenta</span>
          <p className="mini-panel__value">
            {wallet ? 'Wallet conectada' : 'Pendiente de conectar'}
          </p>
        </div>

        <div className="mini-panel">
          <span className="mini-panel__label">Balance visible</span>
          <p className="mini-panel__value">{balance ? `${balance} XLM` : 'Sin datos'}</p>
        </div>

        <div className="mini-panel">
          <span className="mini-panel__label">Direccion Stellar</span>
          <p className="mini-panel__value mini-panel__value--mono">
            {wallet ? wallet.stellarAddress : 'Se muestra al completar onboarding'}
          </p>
        </div>
      </div>
    </SectionCard>
  )
}
