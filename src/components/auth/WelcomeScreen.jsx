import { useState } from 'react'
import logo from '../../assets/logo/logo.png'
import useAuthStore from '../../store/useAuthStore'

export default function WelcomeScreen() {
  const { phone, setPhone, setStep, setAuthMode } = useAuthStore()
  const [isFocused, setIsFocused] = useState(false)

  const handleContinue = () => {
    setAuthMode('login')
    if (phone.trim().length >= 8) setStep('otp')
    else setStep('phone')
  }

  const handleRegister = () => {
    setAuthMode('register')
    setStep('register')
  }

  return (
    <div>
      {/* Logo */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <img
          src={logo}
          alt="VICLERENT"
          style={{ width: 56, height: 56, objectFit: 'contain' }}
        />
      </div>

      {/* Heading */}
      <h2 style={{
        fontSize: 22, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', margin: '0 0 8px', letterSpacing: '-0.4px',
      }}>
        Selamat Datang di VICLERENT
      </h2>
      <p style={{
        fontSize: 14, color: '#64748b', textAlign: 'center',
        margin: '0 0 28px', lineHeight: 1.5,
      }}>
        Masuk untuk melanjutkan ke akun Anda
      </p>

      {/* Phone Input */}
      <div style={{ marginBottom: 16 }}>
        <label className="vc-field-label">
          Nomor Telepon
        </label>
        <div style={{
          display: 'flex',
          border: `1.5px solid ${isFocused ? '#1B2D6B' : '#e2e8f0'}`,
          borderRadius: 10,
          overflow: 'hidden',
          background: '#ffffff',
          transition: 'border-color 0.2s',
        }}>
          {/* Country code pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 14px', background: '#f8fafc',
            borderRight: '1.5px solid #e2e8f0',
            fontSize: 14, fontWeight: 700, color: '#374151',
            flexShrink: 0, whiteSpace: 'nowrap',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14v2.92z" />
            </svg>
            +62
          </div>
          {/* Number input */}
          <input
            type="tel"
            inputMode="numeric"
            placeholder="812-xxxx-xxxx"
            value={phone}
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

      {/* Continue Button */}
      <button className="vc-btn-primary" onClick={handleContinue} style={{ marginBottom: 18 }}>
        Lanjutkan
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
        </svg>
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>atau</span>
        <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
      </div>

      {/* Register Link */}
      <p style={{ textAlign: 'center', fontSize: 14, color: '#64748b', margin: 0 }}>
        Belum punya akun?{' '}
        <button
          onClick={handleRegister}
          style={{
            color: '#1B2D6B', fontWeight: 700,
            background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 14,
            padding: 0, textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}
        >
          Buat Akun
        </button>
      </p>
    </div>
  )
}
