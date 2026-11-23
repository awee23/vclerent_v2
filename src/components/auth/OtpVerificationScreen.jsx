import { useState, useRef, useEffect } from 'react'
import otpIcon from '../../assets/icons/Auth_icons/icon_auth2.png'
import useAuthStore from '../../store/useAuthStore'

export default function OtpVerificationScreen() {
  const { phone, setStep, setVerified } = useAuthStore()
  const [digits, setDigits] = useState(['', '', '', ''])
  const [timer, setTimer] = useState(60)
  const refs = useRef([])

  useEffect(() => {
    if (timer <= 0) return
    const t = setTimeout(() => setTimer(v => v - 1), 1000)
    return () => clearTimeout(t)
  }, [timer])

  const handleChange = (val, i) => {
    if (!/^\d*$/.test(val)) return
    const next = [...digits]
    next[i] = val.slice(-1)
    setDigits(next)
    if (val && i < 3) refs.current[i + 1]?.focus()
    if (next.every(d => d) && val) {
      setVerified(true)
      setTimeout(() => setStep('phone-verified'), 300)
    }
  }

  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      const next = [...digits]
      next[i - 1] = ''
      setDigits(next)
      refs.current[i - 1]?.focus()
    }
  }

  const handleResend = () => {
    if (timer > 0) return
    setTimer(60)
    setDigits(['', '', '', ''])
    refs.current[0]?.focus()
  }

  const masked = phone
    ? `+62 ${phone.slice(0, 3)}-${phone.slice(3, 7)}-xxxx`
    : '+62 812-xxxx-xxxx'

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button className="vc-btn-back" onClick={() => setStep('phone')} aria-label="Kembali">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="vc-badge">Verifikasi OTP</span>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <img
          src={otpIcon}
          alt="OTP Illustration"
          style={{ width: 100, height: 80, objectFit: 'contain', marginBottom: 14 }}
        />

        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
          Kode Verifikasi Dikirim
        </h2>
        <p style={{ fontSize: 13.5, color: '#64748b', margin: '0 0 6px', lineHeight: 1.5, maxWidth: 320 }}>
          Masukkan 4 digit kode yang kami kirimkan via WhatsApp ke:
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1B2D6B' }}>{masked}</span>
          <button
            onClick={() => setStep('phone')}
            aria-label="Ubah nomor"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B2D6B', display: 'flex', padding: 2 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>

        {/* OTP boxes */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => refs.current[i] = el}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(e.target.value, i)}
              onKeyDown={e => handleKeyDown(e, i)}
              style={{
                width: 56,
                height: 56,
                border: `2px solid ${d ? '#1B2D6B' : '#e2e8f0'}`,
                borderRadius: 12,
                textAlign: 'center',
                fontSize: 22,
                fontWeight: 800,
                color: '#0f172a',
                outline: 'none',
                background: '#ffffff',
                boxShadow: d ? '0 0 0 3px rgba(27, 45, 107, 0.12)' : 'none',
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>

        <button
          onClick={handleResend}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: timer === 0 ? '#1B2D6B' : '#94a3b8',
            background: 'none',
            border: 'none',
            cursor: timer === 0 ? 'pointer' : 'default',
            padding: 4,
          }}
        >
          {timer === 0 ? 'Kirim Ulang Kode Verifikasi' : `Kirim Ulang dalam ${timer} detik`}
        </button>
      </div>
    </div>
  )
}
