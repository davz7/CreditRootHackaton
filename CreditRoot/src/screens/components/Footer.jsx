function Footer() {
    return (
        <>
            {/* Footer */}
            <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: '#050505' }} className="py-4">
                <div className="container d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <span className="fw-black" style={{ letterSpacing: '-1px' }}>
                        MAÑANA<span style={{ color: '#f59e0b' }}>SEGURO</span>
                    </span>
                    <div className="d-flex gap-4 flex-wrap">
                        <span className="text-white-50 small">Construido sobre Stellar</span>
                        <span className="text-white-50 small">Powered by Etherfuse</span>
                        <span className="text-white-50 small">Genesis Hackathon 2025</span>
                    </div>
                </div>
            </footer>
        </>
    );
}
export default Footer;