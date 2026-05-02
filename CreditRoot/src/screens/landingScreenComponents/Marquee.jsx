function Marquee() {
    const items = ['USDC nativo', 'Tasa CETES real', 'Soroban contracts', 'Self-custody', 'Etherfuse', 'Stellar Testnet', 'Sin comisiones ocultas']
    const loop = [...items, ...items]
    return (
        <div className="border-y border-ink/8 bg-cream py-4 overflow-hidden">
            <div className="flex gap-12 whitespace-nowrap animate-marquee">
                {loop.map((t, i) => (
                    <span key={i} className="text-sm font-medium text-ink/40 flex items-center gap-3 shrink-0">
                        {t} <span className="text-brand text-xs">✦</span>
                    </span>
                ))}
            </div>
        </div>
    );
}
export default Marquee;