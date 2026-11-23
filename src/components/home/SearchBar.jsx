import { useState } from 'react'
import useAuthStore from '../../store/useAuthStore'

export default function SearchBar({ query, onQueryChange }) {
  const { setStep, userData, phone } = useAuthStore()
  const [showMenu, setShowMenu] = useState(false)

  const displayName = userData?.namaLengkap || 'Pengguna'
  const displayPhone = userData?.phone || phone || '0812-xxxx-xxxx'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        position: 'relative',
      }}
    >
      {/* Pill Search Input */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          background: '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: '9999px',
          padding: '12px 24px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.2s ease',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#64748b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>

        <input
          type="text"
          placeholder="cari kendaraan"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontSize: '15px',
            color: '#1e293b',
            outline: 'none',
          }}
        />

        {query && (
          <button
            onClick={() => onQueryChange('')}
            aria-label="Hapus pencarian"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              display: 'flex',
              padding: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Profile Button */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowMenu(v => !v)}
          title="Profil Pengguna"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.06)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="#1B2D6B"
            stroke="#1B2D6B"
            strokeWidth="1.2"
          >
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '60px',
              width: '220px',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
              border: '1px solid #e2e8f0',
              padding: '14px',
              zIndex: 50,
            }}
          >
            <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{displayName}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{displayPhone}</div>
              <div style={{ fontSize: '10px', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                Akun Terverifikasi
              </div>
            </div>

            <button
              onClick={() => {
                setShowMenu(false)
                setStep('welcome')
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#fee2e2',
                color: '#b91c1c',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              Keluar / Ganti Akun
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
