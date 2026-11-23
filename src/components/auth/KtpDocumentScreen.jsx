import { useState } from 'react'
import useAuthStore from '../../store/useAuthStore'

export default function KtpDocumentScreen() {
  const { setStep, userData, updateUserData } = useAuthStore()
  const [preview, setPreview] = useState(userData.ktpFile || null)
  const [form, setForm] = useState({
    nik: userData.nik || '',
    namaLengkap: userData.ktpNama || userData.namaLengkap || '',
    tanggalLahir: userData.ktpTglLahir || '',
    alamat: userData.ktpAlamat || '',
  })

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const isValid =
    preview &&
    form.nik.trim().length === 16 &&
    form.namaLengkap.trim() &&
    form.tanggalLahir &&
    form.alamat.trim()

  const handleContinue = () => {
    if (!isValid) return
    updateUserData({
      nik: form.nik.trim(),
      ktpNama: form.namaLengkap.trim(),
      ktpTglLahir: form.tanggalLahir,
      ktpAlamat: form.alamat.trim(),
      ktpFile: preview,
    })
    setStep('sim')
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="vc-btn-back" onClick={() => setStep('register')} aria-label="Kembali ke Data Diri">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>Dokumen KTP</h2>
            <span style={{ fontSize: 12, color: '#64748b' }}>Kartu Tanda Penduduk</span>
          </div>
        </div>
        <span className="vc-badge">
          Tahap 2 dari 4
        </span>
      </div>

      <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>
        Unggah foto KTP asli dan pastikan identitas terbaca dengan jelas untuk verifikasi instan.
      </p>

      {/* Upload Box */}
      <label style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed #1B2D6B',
        borderRadius: 12,
        padding: preview ? 6 : '20px 16px',
        cursor: 'pointer',
        background: '#f8faff',
        marginBottom: 16,
        transition: 'all 0.2s',
      }}>
        {preview ? (
          <div style={{ width: '100%', position: 'relative' }}>
            <img
              src={preview}
              alt="KTP Preview"
              style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, display: 'block' }}
            />
            <div style={{
              position: 'absolute', bottom: 8, right: 8,
              background: 'rgba(27,45,107,0.85)', color: '#fff',
              fontSize: 11, fontWeight: 600, padding: '4px 10px',
              borderRadius: 6, backdropFilter: 'blur(4px)',
            }}>
              Ganti Foto
            </div>
          </div>
        ) : (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: 10,
              background: '#1B2D6B', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 10, color: '#fff',
              boxShadow: '0 4px 12px rgba(27,45,107,0.2)',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <span style={{ fontSize: 13.5, color: '#1B2D6B', fontWeight: 700, marginBottom: 2 }}>
              Ambil Foto / Unggah KTP
            </span>
            <span style={{ fontSize: 11.5, color: '#64748b' }}>Format JPG, PNG (maks. 5MB)</span>
          </>
        )}
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </label>

      {/* Form Inputs */}
      <div style={{ marginBottom: 14 }}>
        <label className="vc-field-label">Nomor Induk Kependudukan (NIK)</label>
        <input
          className="vc-field-input"
          type="text"
          maxLength={16}
          placeholder="16 digit angka NIK"
          value={form.nik}
          onChange={(e) => setForm((prev) => ({ ...prev, nik: e.target.value.replace(/\D/g, '') }))}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label className="vc-field-label">Nama Lengkap Sesuai KTP</label>
        <input
          className="vc-field-input"
          type="text"
          placeholder="Nama lengkap di KTP"
          value={form.namaLengkap}
          onChange={handleChange('namaLengkap')}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label className="vc-field-label">Tanggal Lahir</label>
        <input
          className="vc-field-input"
          type="date"
          value={form.tanggalLahir}
          onChange={handleChange('tanggalLahir')}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label className="vc-field-label">Alamat Sesuai KTP</label>
        <textarea
          className="vc-field-input"
          rows={2}
          placeholder="Alamat domisili lengkap"
          value={form.alamat}
          onChange={handleChange('alamat')}
          style={{ resize: 'vertical' }}
        />
      </div>

      <button
        className="vc-btn-primary"
        data-disabled={!isValid}
        disabled={!isValid}
        onClick={handleContinue}
      >
        Lanjut ke Dokumen SIM
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </div>
  )
}
