import logoImg from '../../assets/logo/logo.png'
import homeIconImg from '../../assets/Icon_navigation/Home (3).png'
import voucherIconImg from '../../assets/Icon_navigation/Voucher.png'
import activityIconImg from '../../assets/Icon_navigation/Activity.png'
import notifIconImg from '../../assets/Icon_navigation/Notification.png'

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: homeIconImg },
  { id: 'voucher', label: 'Voucher', icon: voucherIconImg },
  { id: 'activity', label: 'Aktivitas', icon: activityIconImg },
  { id: 'notification', label: 'Notifikasi', icon: notifIconImg },
]

export default function HomeSidebar({ activeTab, onSelectTab, isTablet = false, isMobile = false }) {
  if (isMobile) return null

  return (
    <aside
      style={{
        width: isTablet ? '72px' : '210px',
        minHeight: '100vh',
        height: '100%',
        background: '#ffffff',
        borderRight: '1px solid #EEF1F6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isTablet ? 'center' : 'flex-start',
        paddingTop: '24px',
        paddingBottom: '24px',
        paddingLeft: isTablet ? '0' : '0',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'width 0.3s ease',
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isTablet ? '0' : '10px',
          paddingLeft: isTablet ? '0' : '24px',
          paddingRight: isTablet ? '0' : '16px',
          marginBottom: '32px',
          justifyContent: isTablet ? 'center' : 'flex-start',
          width: '100%',
        }}
      >
        <img
          src={logoImg}
          alt="VICLERENT"
          style={{
            width: isTablet ? '36px' : '36px',
            height: isTablet ? '36px' : '36px',
            objectFit: 'contain',
            flexShrink: 0,
          }}
        />
        {!isTablet && (
          <div>
            <div
              className="vc-sidebar-logo-text"
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: '#142A59',
                letterSpacing: '-0.3px',
                lineHeight: 1.1,
              }}
            >
              VICLERENT
            </div>
            <div
              style={{
                fontSize: '9px',
                fontWeight: 600,
                color: '#94A3B8',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                marginTop: '1px',
              }}
            >
              Vehicle Rental
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation Items ── */}
      <nav style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: isTablet ? '0' : '12px', paddingRight: isTablet ? '0' : '12px' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={isTablet ? item.label : undefined}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '12px',
                background: isActive ? '#EBF1FF' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: isTablet ? 'center' : 'flex-start',
                gap: '10px',
                padding: isTablet ? '0' : '0 12px',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = '#F7F8FA'
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent'
              }}
            >
              {/* Active indicator bar */}
              {isActive && !isTablet && (
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px',
                    height: '20px',
                    background: '#2463D9',
                    borderRadius: '0 4px 4px 0',
                  }}
                />
              )}

              {/* Icon */}
              <div
                style={{
                  width: isTablet ? '36px' : '20px',
                  height: isTablet ? '36px' : '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: isTablet ? '10px' : '0',
                  background: isTablet && isActive ? '#EBF1FF' : 'transparent',
                  flexShrink: 0,
                }}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  style={{
                    width: '20px',
                    height: '20px',
                    objectFit: 'contain',
                    filter: isActive
                      ? 'invert(31%) sepia(99%) saturate(1500%) hue-rotate(206deg) brightness(85%)'
                      : 'invert(50%) sepia(10%) saturate(400%) hue-rotate(185deg) brightness(85%)',
                    transition: 'filter 0.2s ease',
                  }}
                />
              </div>

              {/* Label (hidden on tablet) */}
              {!isTablet && (
                <span
                  className="vc-sidebar-label"
                  style={{
                    fontSize: '13.5px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#2463D9' : '#64748B',
                    letterSpacing: '-0.1px',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {item.label}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
