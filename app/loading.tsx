export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900"
      // Mulai opacity-0, fade-in hanya setelah 250ms.
      // Kalau halaman selesai load sebelum 250ms → loading tak pernah terlihat.
      style={{ opacity: 0, animation: 'kl-fadein 0.15s ease 0.25s forwards' }}
    >
      <style>{`
        @keyframes kl-fadein { to { opacity: 1; } }
        @keyframes kl-spin   { to { transform: rotate(360deg); } }
        @keyframes kl-bar    { 0%,100% { transform: translateX(-100%); } 50% { transform: translateX(200%); } }
      `}</style>

      <div className="flex flex-col items-center gap-6">
        {/* Spinner — pure CSS border, no SVG, no gradient, no blur */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-electric-400"
            style={{ animation: 'kl-spin 1s linear infinite' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display font-bold text-base text-electric-400">K</span>
          </div>
        </div>

        {/* Brand */}
        <div className="flex flex-col items-center gap-1">
          <span className="font-display font-bold text-xl tracking-[0.3em] text-white">
            KROENG
          </span>
          <span className="text-electric-400/60 text-xs tracking-widest uppercase">
            Memuat...
          </span>
        </div>

        {/* Progress shimmer — 1 div, no gradient class */}
        <div className="w-32 h-px bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full w-1/3 bg-electric-400/70 rounded-full"
            style={{ animation: 'kl-bar 1.4s ease-in-out infinite' }}
          />
        </div>
      </div>
    </div>
  );
}
