import { useState } from 'react'
import useAuthStore from '../../store/useAuthStore'

export default function RegisterScreen() {
  const { setStep, userData, updateUserData } = useAuthStore()
  const [form, setForm] = useState({
    name: userData.namaLengkap || '',
    phone: userData.phone || '',
    email: userData.email || '',
    password: userData.password || '',
  })
  const [showPass, setShowPass] = useState(false)

  const set = key => e => {
    const val = e.target.value
    setForm(f => ({ ...f, [key]: val }))
  }

  const isValid =
    form.name.trim().length >= 3 &&
    form.phone.trim().length >= 8 &&
    form.email.includes('@') &&
    form.password.length >= 6

  const handleContinue = (e) => {
    e.preventDefault()
    if (!isValid) return

    updateUserData({
      namaLengkap: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      password: form.password,
    })

    setStep('ktp')
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <button className="vc-btn-back" onClick={() => setStep('welcome')} aria-label="Kembali ke Beranda">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="vc-badge">
          Tahap 1 dari 4: Data Diri
        </span>
      </div>

      <h2 style={{ fontSize: 21, fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
        Pengisian Data Diri
      </h2>
      <p style={{ fontSize: 13.5, color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
        Lengkapi informasi data diri akun Anda sebelum melanjutkan ke pengisian dokumen identitas.
      </p>

      {/* Form Fields */}
      <form onSubmit={handleContinue}>
        <div style={{ marginBottom: 14 }}>
          <label className="vc-field-label">Nama Lengkap</label>
          <input
            className="vc-field-input"
            type="text"
            placeholder="Sesuai nama KTP (cth. Budi Santoso)"
            value={form.name}
            onChange={set('name')}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="vc-field-label">Nomor WhatsApp / Telepon</label>
          <input
            className="vc-field-input"
            type="tel"
            placeholder="08123456789"
            value={form.phone}
            onChange={(e) => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="vc-field-label">Alamat E-mail</label>
          <input
            className="vc-field-input"
            type="email"
            placeholder="budi@email.com"
            value={form.email}
            onChange={set('email')}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="vc-field-label">Kata Sandi</label>
          <div style={{ position: 'relative' }}>
            <input
              className="vc-field-input"
              type={showPass ? 'text' : 'password'}
              placeholder="Minimal 6 karakter"
              value={form.password}
              onChange={set('password')}
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              aria-label="Toggle password visibility"
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}
            >
              {showPass
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="13" r="3" /></svg>
              }
            </button>
          </div>
          {form.password.length > 0 && form.password.length < 6 && (
            <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>Minimal 6 karakter</p>
          )}
        </div>

        <button
          type="submit"
          className="vc-btn-primary"
          data-disabled={!isValid}
          disabled={!isValid}
        >
          Lanjut ke Dokumen KTP
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </form>
    </div>
  )
}
