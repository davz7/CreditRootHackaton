import logoCompleto from '../../assets/LOGO_MS.png'

function Footer() {
    return (
        <footer className="bg-cream border-t border-ink/8 py-8">
            <div className="container mx-auto px-4 flex flex-wrap justify-between items-center gap-4">

                <div className="flex items-center gap-2">
                    <img src={logoCompleto} alt="Logo Mañana Seguro" className="h-8 w-auto rounded-lg" />
                    <span className="font-display font-bold text-lg text-ink tracking-tight">
                        Mañana <span className="text-brand">Seguro</span>
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-gray">
                    <span>Construido sobre Stellar</span>
                    <span className="text-ink/20">·</span>
                    <span>Powered by Etherfuse</span>
                    <span className="text-ink/20">·</span>
                    <span>Genesis Hackathon 2025</span>
                </div>

            </div>
        </footer>
    )
}
export default Footer