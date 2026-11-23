import useAuthStore from '../../store/useAuthStore'

export default function HomeBottomNav({ active }) {
  const { setStep } = useAuthStore()

  const items = [
    {
      id: 'home',
      label: 'Beranda',
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#1B2D6B' : 'none'} stroke={active ? '#1B2D6B' : '#94a3b8'} strokeWidth="2" strokeLinecap="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9,22 9,12 15,12 15,22" />
        </svg>
      ),
    },
    {
      id: 'search',
      label: 'Cari',
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#1B2D6B' : '#94a3b8'} strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      ),
    },
    {
      id: 'orders',
      label: 'Pesanan',
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#1B2D6B' : '#94a3b8'} strokeWidth="2" strokeLinecap="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#1B2D6B' : '#94a3b8'} strokeWidth="2" strokeLinecap="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ]

  return (
    <nav
      style={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#ffffff',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '8px 0 max(12px, env(safe-area-inset-bottom))',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
        zIndex: 100,
        flexShrink: 0,
      }}
    >
      {items.map(item => {
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            onClick={() => item.id === 'profile' ? setStep('welcome') : null}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 16px',
              borderRadius: '12px',
              transition: 'background 0.2s',
            }}
          >
            {item.icon(isActive)}
            <span
              style={{
                fontSize: '11px',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? '#1B2D6B' : '#94a3b8',
              }}
            >
              {item.label}
            </span>
            {isActive && (
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#1B2D6B', marginTop: '-2px' }} />
            )}
          </button>
        )
      })}
    </nav>
  )
}

