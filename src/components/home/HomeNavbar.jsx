import { useState } from 'react'
import useAuthStore from '../../store/useAuthStore'

export default function HomeNavbar({ query, onQueryChange, onOpenNotifications, isMobile = false, isTablet = false }) {
  const { setStep, userData, phone } = useAuthStore()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const displayName = userData?.namaLengkap || 'Pengguna'
  const displayPhone = userData?.phone || phone || '0812-xxxx-xxxx'

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: isMobile ? '10px' : '16px',
        marginBottom: isMobile ? '16px' : '28px',
        width: '100%',
        position: 'relative',
      }}
    >
      {/* ── Search Field ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#ffffff',
          borderRadius: '9999px',
          padding: isMobile ? '10px 16px' : '12px 22px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
          minWidth: 0,
        }}
      >
        <svg
          width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>

        <input
          type="text"
          placeholder={isMobile ? 'Cari kendaraan...' : 'Search car, motorcycle, or van...'}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontSize: isMobile ? '13px' : '14px',
            color: '#0F172A',
            outline: 'none',
            fontFamily: 'inherit',
            minWidth: 0,
          }}
        />

        {query && (
          <button
            onClick={() => onQueryChange('')}
            aria-label="Clear search"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#94A3B8', padding: 0, display: 'flex', flexShrink: 0,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Right: Notification + Profile ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', flexShrink: 0 }}>
        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          aria-label="Notifikasi"
          style={{
            width: isMobile ? '40px' : '44px',
            height: isMobile ? '40px' : '44px',
            borderRadius: '50%',
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
            color: '#142A59',
            position: 'relative',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span style={{
            position: 'absolute', top: '9px', right: '10px',
            width: '7px', height: '7px', borderRadius: '50%', background: '#2463D9',
          }} />
        </button>

        {/* Profile Avatar */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu(v => !v)}
            aria-label="Menu Pengguna"
            style={{
              width: isMobile ? '40px' : '44px',
              height: isMobile ? '40px' : '44px',
              borderRadius: '50%',
              background: '#142A59',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 8px rgba(20, 42, 89, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#ffffff',
              overflow: 'hidden', padding: 0, flexShrink: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: isMobile ? '48px' : '52px',
                width: '220px',
                background: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                border: '1px solid #E2E8F0',
                padding: '16px',
                zIndex: 60,
              }}
            >
              <div style={{ paddingBottom: '12px', borderBottom: '1px solid #F1F5F9', marginBottom: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{displayName}</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>{displayPhone}</div>
                <span style={{
                  display: 'inline-block', fontSize: '11px', fontWeight: 600,
                  color: '#059669', background: '#ECFDF5', padding: '2px 8px',
                  borderRadius: '99px', marginTop: '6px',
                }}>✓ Terverifikasi</span>
              </div>

              <button
                onClick={() => { setShowProfileMenu(false); setStep('welcome') }}
                style={{
                  width: '100%', padding: '9px 12px',
                  background: '#FEE2E2', color: '#B91C1C',
                  border: 'none', borderRadius: '10px',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                Keluar / Ganti Akun
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
