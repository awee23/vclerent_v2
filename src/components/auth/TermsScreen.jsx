import { useState } from 'react'
import useAuthStore from '../../store/useAuthStore'

const permissions = [
  {
    icon: '📍',
    title: 'Akses Lokasi & GPS',
    desc: 'Diperlukan untuk memantau titik unit sewa real-time dan kalkulasi radius antar-jemput kendaraan.',
  },
  {
    icon: '📷',
    title: 'Akses Kamera & Berkas Dokumen',
    desc: 'Diperlukan untuk verifikasi keaslian foto identitas KTP dan SIM.',
  },
  {
    icon: '🔔',
    title: 'Notifikasi Layanan & Transaksi',
    desc: 'Untuk mengirim konfirmasi pembayaran QRIS, batas waktu sewa, dan info darurat 24/7.',
  },
]

const terms = [
  'Pengguna wajib membuat akun dengan data diri yang benar, lengkap, dan dapat dipertanggungjawabkan.',
  'Setiap pemesanan kendaraan wajib dilakukan melalui aplikasi resmi Viclerent.',
  'Pengguna bertanggung jawab atas keaslian dokumen yang digunakan, seperti KTP dan SIM.',
  'Kendaraan hanya boleh digunakan sesuai perjanjian, tidak untuk tindakan ilegal atau melanggar hukum.',
  'Pengguna wajib mengembalikan kendaraan dalam kondisi baik, sesuai waktu yang telah disepakati.',
  'Biaya sewa, denda keterlambatan, dan biaya tambahan lainnya harus dibayarkan sesuai ketentuan aplikasi.',
  'Viclerent berhak menolak atau membatalkan penyewaan apabila ditemukan data tidak valid.',
  'Semua data pribadi pengguna akan dijaga kerahasiaannya sesuai kebijakan privasi.',
]

export default function TermsScreen() {
  const { setStep, updateUserData } = useAuthStore()
  const [agreed, setAgreed] = useState(false)

  const handleAgreeAndFinish = () => {
    if (!agreed) return
    updateUserData({ servicePermissionsAgreed: true })
    setStep('done')
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button className="vc-btn-back" onClick={() => setStep('sim')} aria-label="Kembali ke Dokumen SIM">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="vc-badge">
          Tahap 4 dari 4: Ketentuan
        </span>
      </div>

      <h2 style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
        Perizinan Layanan &amp; Ketentuan
      </h2>
      <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>
        Sebelum dapat mengakses Beranda dan menyewa unit, izinkan fitur layanan penting berikut:
      </p>

      {/* Permissions Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
        {permissions.map((p, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '12px 14px',
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: 12,
            }}
          >
            <div style={{ fontSize: 20, lineHeight: 1, marginTop: 2 }}>{p.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
                {p.title}
              </div>
              <div style={{ fontSize: 11.5, color: '#64748b', lineHeight: 1.45 }}>
                {p.desc}
              </div>
            </div>
            <div style={{ color: '#10b981', fontSize: 15, fontWeight: 'bold' }}>✓</div>
          </div>
        ))}
      </div>

      {/* Terms Box */}
      <p style={{ fontSize: 13, fontWeight: 700, color: '#1B2D6B', margin: '0 0 8px' }}>
        Ringkasan Ketentuan Sewa Kendaraan:
      </p>
      <div
        style={{
          maxHeight: 120,
          overflowY: 'auto',
          padding: '10px 14px',
          background: '#ffffff',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          marginBottom: 16,
        }}
      >
        <ol style={{ paddingLeft: 16, margin: 0 }}>
          {terms.map((t, i) => (
            <li key={i} style={{ fontSize: 11.5, color: '#334155', lineHeight: 1.55, marginBottom: 6 }}>
              {t}
            </li>
          ))}
        </ol>
      </div>

      {/* Checkbox agreement */}
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 20 }}>
        <div
          onClick={() => setAgreed(v => !v)}
          style={{
            marginTop: 2, width: 20, height: 20, flexShrink: 0,
            border: `2px solid ${agreed ? '#1B2D6B' : '#94a3b8'}`,
            borderRadius: 6,
            background: agreed ? '#1B2D6B' : '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          {agreed && (
            <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
              <path d="M1 4l3 3L10 1" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.5, fontWeight: 500 }}>
          Saya memberikan seluruh perizinan layanan di atas dan menyetujui Syarat &amp; Ketentuan Pengguna Viclerent.
        </span>
      </label>

      {/* Action button */}
      <button
        className="vc-btn-primary"
        data-disabled={!agreed}
        disabled={!agreed}
        onClick={handleAgreeAndFinish}
      >
        Setujui &amp; Selesaikan Pendaftaran
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </div>
  )
}
