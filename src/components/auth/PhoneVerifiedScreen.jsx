import { useEffect } from 'react'
import useAuthStore from '../../store/useAuthStore'

export default function PhoneVerifiedScreen() {
  const { setStep } = useAuthStore()

  useEffect(() => {
    const t = setTimeout(() => setStep('home'), 1600)
    return () => clearTimeout(t)
  }, [setStep])

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <button className="vc-btn-back" onClick={() => setStep('otp')} aria-label="Kembali">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      {/* Centered Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 8px 24px',
          textAlign: 'center',
        }}
      >
        {/* Checkmark circle */}
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: '50%',
            background: '#1B2D6B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            boxShadow: '0 12px 28px rgba(27,45,107,0.25)',
          }}
        >
          <svg width="40" height="32" viewBox="0 0 52 40" fill="none">
            <path d="M4 20L18 34L48 4" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 style={{ fontSize: 21, fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.3px' }}>
          Login Berhasil!
        </h2>
        <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.6, maxWidth: 300, margin: '0 0 24px' }}>
          Nomor telepon Anda terverifikasi. Mengalihkan Anda langsung ke halaman Beranda...
        </p>

        {/* Action button */}
        <button
          className="vc-btn-primary"
          onClick={() => setStep('home')}
          style={{ maxWidth: 220, padding: '12px 20px', fontSize: 14, marginBottom: 16 }}
        >
          Masuk Sekarang →
        </button>

        {/* Animated bounce dots */}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#1B2D6B',
                animation: 'vc-bounce 0.9s infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes vc-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}
