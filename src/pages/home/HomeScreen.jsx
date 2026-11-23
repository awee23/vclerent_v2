import { useState, useEffect } from 'react'
import HomeSidebar from '../../components/home/HomeSidebar'
import HomeNavbar from '../../components/home/HomeNavbar'
import HomeHeroBanner from '../../components/home/HomeHeroBanner'
import HomeCategorySelector from '../../components/home/HomeCategorySelector'
import HomeVehicleGrid from '../../components/home/HomeVehicleGrid'
import AktivitasScreen from '../aktivitas/AktivitasScreen'

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440)
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return width
}

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('home')
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('mobil')
  const [activeModal, setActiveModal] = useState(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const width = useWindowWidth()
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId)
    if (tabId === 'home') {
      setActiveModal(null)
    } else {
      setActiveModal(tabId)
    }
    if (isMobile) setMobileSidebarOpen(false)
  }

  const handleRentNow = () => {
    const el = document.getElementById('popular-vehicles')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  // Compute dynamic sidebar width
  const sidebarWidth = isMobile ? 0 : isTablet ? 72 : 210

  // Main content left padding based on sidebar
  const contentPadding = isMobile
    ? '20px 16px 80px'      // bottom 80px for bottom nav
    : isTablet
      ? '20px 20px 40px'
      : '28px 36px 48px'

  return (
    <>
      <style>{`
        .vc-dashboard-root * {
          box-sizing: border-box;
        }

        /* ── Vehicle Grid Responsive ── */
        .vc-vehicle-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          width: 100%;
        }
        @media (max-width: 1280px) {
          .vc-vehicle-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 1023px) {
          .vc-vehicle-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 480px) {
          .vc-vehicle-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        }

        /* ── Bottom Nav (Mobile) ── */
        .vc-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: #ffffff;
          border-top: 1px solid #E8EDF5;
          display: none;
          flex-direction: row;
          align-items: center;
          justify-content: space-around;
          z-index: 90;
          box-shadow: 0 -4px 16px rgba(20, 42, 89, 0.08);
          padding: 0 8px;
        }
        @media (max-width: 767px) {
          .vc-bottom-nav { display: flex; }
        }

        /* ── Sidebar Tablet Icon-only ── */
        @media (min-width: 768px) and (max-width: 1023px) {
          .vc-sidebar-label { display: none !important; }
          .vc-sidebar-logo-text { display: none !important; }
        }

        /* ── Modal animation ── */
        @keyframes vcModalPop {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* ── Scrollbar ── */
        .vc-dashboard-root ::-webkit-scrollbar { width: 5px; }
        .vc-dashboard-root ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
      `}</style>

      <div
        className="vc-dashboard-root"
        style={{
          minHeight: '100vh',
          width: '100vw',
          background: '#F7F8FA',
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'hidden',
          position: 'relative',
        }}
      >
        {/* ─── Sidebar (hidden on mobile, icon-only on tablet, full on desktop) ─── */}
        {!isMobile && (
          <div
            style={{
              width: sidebarWidth,
              flexShrink: 0,
              transition: 'width 0.3s ease',
              overflowX: 'hidden',
            }}
          >
            <HomeSidebar
              activeTab={activeTab}
              onSelectTab={handleSelectTab}
              isTablet={isTablet}
              isMobile={false}
            />
          </div>
        )}

        {/* ─── Main Content ─── */}
        <main
          style={{
            flex: 1,
            minHeight: '100vh',
            padding: contentPadding,
            width: 0,         // flex child: let flex: 1 control actual width
            overflowX: 'hidden',
          }}
        >
          {/* ── AKTIVITAS PAGE (full-page replace) ── */}
          {activeTab === 'activity' ? (
            <AktivitasScreen
              onBack={() => handleSelectTab('home')}
            />
          ) : (
            <>
              <HomeNavbar
                query={query}
                onQueryChange={setQuery}
                onOpenNotifications={() => setActiveModal('notification')}
                isMobile={isMobile}
                isTablet={isTablet}
              />

              <HomeHeroBanner onRentNow={handleRentNow} isMobile={isMobile} />

              <HomeCategorySelector
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                isMobile={isMobile}
                isTablet={isTablet}
              />

              <HomeVehicleGrid
                activeCategory={activeCategory}
                query={query}
                isMobile={isMobile}
              />
            </>
          )}
        </main>
      </div>

      {/* ─── Bottom Navigation Bar (Mobile Only) ─── */}
      <BottomNav activeTab={activeTab} onSelectTab={handleSelectTab} />

      {/* ─── Modals (Voucher, Notification only – Activity is now a full page) ─── */}
      {activeModal && activeModal !== 'activity' && (
        <div
          onClick={() => { setActiveModal(null); setActiveTab('home') }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: isMobile ? '24px 20px' : '32px 28px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              animation: 'vcModalPop 0.25s ease-out',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#142A59' }}>
                {activeModal === 'voucher' && '🎟️ Voucher Saya'}
                {activeModal === 'notification' && '🔔 Notifikasi'}
              </div>
              <button
                onClick={() => { setActiveModal(null); setActiveTab('home') }}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: '#F1F5F9', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#64748B', fontSize: '16px',
                }}
              >✕</button>
            </div>

            {/* Modal Content */}
            {activeModal === 'voucher' && (
              <div>
                <div style={{ background: 'linear-gradient(135deg, #142A59, #2463D9)', borderRadius: '16px', padding: '20px 24px', color: '#ffffff', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', opacity: 0.75, marginBottom: '4px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Voucher Aktif</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px' }}>VCRENT25</div>
                  <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '4px' }}>Diskon 25% untuk sewa pertama</div>
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.2)', fontSize: '12px', opacity: 0.7 }}>Berlaku hingga 31 Des 2025</div>
                </div>
                <p style={{ fontSize: '13px', color: '#64748B', textAlign: 'center', margin: 0 }}>Voucher akan otomatis diterapkan saat checkout.</p>
              </div>
            )}

            {activeModal === 'notification' && (
              <div>
                {[
                  { dot: '#2463D9', title: 'Pesanan dikonfirmasi', desc: 'Toyota Fortuner siap diantar ke lokasi Anda.', time: '2 menit lalu' },
                  { dot: '#059669', title: 'Pembayaran berhasil', desc: 'Rp 850.000 untuk sewa 1 hari.', time: '1 jam lalu' },
                  { dot: '#94A3B8', title: 'Promo terbaru', desc: 'Dapatkan diskon 20% akhir pekan ini!', time: '1 hari lalu' },
                ].map((n, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: i < 2 ? '1px solid #F1F5F9' : 'none' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.dot, marginTop: '5px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#142A59', marginBottom: '2px' }}>{n.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{n.desc}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ── Bottom Navigation (Mobile) ──────────────────────────────────────────────
import homeIconImg from '../../assets/Icon_navigation/Home (3).png'
import voucherIconImg from '../../assets/Icon_navigation/Voucher.png'
import activityIconImg from '../../assets/Icon_navigation/Activity.png'
import notifIconImg from '../../assets/Icon_navigation/Notification.png'

const BOTTOM_NAV_ITEMS = [
  { id: 'home', label: 'Beranda', icon: homeIconImg },
  { id: 'voucher', label: 'Voucher', icon: voucherIconImg },
  { id: 'activity', label: 'Aktivitas', icon: activityIconImg },
  { id: 'notification', label: 'Notifikasi', icon: notifIconImg },
]

function BottomNav({ activeTab, onSelectTab }) {
  return (
    <nav className="vc-bottom-nav">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              flex: 1,
              height: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 4px',
              color: isActive ? '#2463D9' : '#94A3B8',
              position: 'relative',
            }}
          >
            {isActive && (
              <span style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '32px',
                height: '3px',
                background: '#2463D9',
                borderRadius: '0 0 4px 4px',
              }} />
            )}
            <div
              style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                background: isActive ? '#EBF1FF' : 'transparent',
                padding: '4px',
                transition: 'all 0.2s ease',
              }}
            >
              <img
                src={item.icon}
                alt={item.label}
                style={{
                  width: '18px',
                  height: '18px',
                  objectFit: 'contain',
                  filter: isActive
                    ? 'invert(31%) sepia(99%) saturate(1500%) hue-rotate(206deg) brightness(85%)'
                    : 'invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%)',
                  transition: 'filter 0.2s ease',
                }}
              />
            </div>
            <span style={{ fontSize: '10px', fontWeight: isActive ? 700 : 500, lineHeight: 1 }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
