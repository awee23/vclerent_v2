import { useState } from 'react'
import logo from '../../assets/logo/logo.png'
import useAuthStore from '../../store/useAuthStore'

export default function PhoneLoginScreen() {
  const { phone, setPhone, setStep, setAuthMode } = useAuthStore()
  const [isFocused, setIsFocused] = useState(false)
  const ok = phone.trim().length >= 8

  const handleContinue = () => {
    if (ok) {
      setAuthMode('login')
      setStep('otp')
    }
  }

  return (
    <div>
      {/* Header with Back button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button className="vc-btn-back" onClick={() => setStep('welcome')} aria-label="Kembali">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Masuk dengan Telepon</span>
      </div>

      {/* Logo */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
        <img src={logo} alt="VICLERENT" style={{ width: 54, height: 54, objectFit: 'contain' }} />
      </div>

      <h2 style={{ fontSize: 21, fontWeight: 800, color: '#0f172a', textAlign: 'center', margin: '0 0 8px', letterSpacing: '-0.3px' }}>
        Nomor Telepon
      </h2>
      <p style={{ fontSize: 13.5, color: '#64748b', textAlign: 'center', margin: '0 0 24px', lineHeight: 1.5 }}>
        Masukkan nomor WhatsApp aktif Anda untuk menerima kode OTP verifikasi
      </p>

      {/* Phone input row */}
      <div style={{ marginBottom: 20 }}>
        <label className="vc-field-label">Nomor WhatsApp / Telepon</label>
        <div style={{
          display: 'flex',
          border: `1.5px solid ${isFocused ? '#1B2D6B' : '#e2e8f0'}`,
          borderRadius: 10,
          overflow: 'hidden',
          background: '#ffffff',
          transition: 'border-color 0.2s',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 14px', background: '#f8fafc',
            borderRight: '1.5px solid #e2e8f0',
            fontSize: 14, fontWeight: 700, color: '#374151',
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14v2.92z" />
            </svg>
            +62
          </div>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="812-xxxx-xxxx"
            value={phone}
            autoFocus
            onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
              flex: 1, border: 'none', outline: 'none',
              padding: '13px 15px', fontSize: 14, color: '#0f172a',
              background: 'transparent',
            }}
          />
        </div>
      </div>

      <button
        className="vc-btn-primary"
        data-disabled={!ok}
        disabled={!ok}
        onClick={handleContinue}
      >
        Kirim OTP
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </div>
  )
}
