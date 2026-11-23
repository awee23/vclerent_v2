import useAuthStore from '../../store/useAuthStore'
import verifyIcon from '../../assets/icons/Auth_icons/Verifiacation Icon.png'

export default function VerificationSuccessModal() {
  const { setStep, setVerified } = useAuthStore()

  const handleGoHome = () => {
    setVerified(true)
    setStep('home')
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <button className="vc-btn-back" onClick={() => setStep('terms')} aria-label="Kembali ke Perizinan">
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
          padding: '8px 4px 16px',
          textAlign: 'center',
        }}
      >
        <img
          src={verifyIcon}
          alt="Success Icon"
          style={{
            width: 100,
            height: 100,
            objectFit: 'contain',
            marginBottom: 18,
          }}
        />

        <h2 style={{ fontSize: 21, fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.3px' }}>
          Akun Berhasil Didaftarkan!
        </h2>
        <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.6, maxWidth: 320, margin: '0 0 20px' }}>
          Data diri, dokumen identitas (KTP &amp; SIM), serta perizinan layanan telah berhasil dicatat. Anda siap menjelajahi armada sewa.
        </p>

        {/* Status Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24, width: '100%', maxWidth: 320 }}>
          <div
            style={{
              padding: '10px 16px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 13, color: '#065f46', fontWeight: 600 }}>
              ✅ Perizinan Layanan Diaktifkan
            </span>
          </div>

          <div
            style={{
              padding: '10px 16px',
              background: '#fffbeb',
              border: '1px solid #fcd34d',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>
              ⏳ Verifikasi Dokumen Diproses
            </span>
          </div>
        </div>

        <button className="vc-btn-primary" onClick={handleGoHome}>
          Masuk ke Halaman Beranda
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  )
}
