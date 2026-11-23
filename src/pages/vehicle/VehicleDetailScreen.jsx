import { useState } from 'react'
import useAuthStore from '../../store/useAuthStore'
import { ALL_VEHICLES } from '../../components/home/VehicleList'
import BookingFlowModals from '../../components/booking/BookingFlowModals'
import bgLatar from '../../assets/LatarDetailkendaraan/Latardetailkendaraan.png'

export default function VehicleDetailScreen() {
  const { selectedVehicle, setStep, setSelectedVehicle } = useAuthStore()
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Fallback to Range Rover if none selected
  const vehicle = selectedVehicle || ALL_VEHICLES[0]

  // Find index in ALL_VEHICLES for gallery navigation
  const currentIndex = ALL_VEHICLES.findIndex((v) => v.id === vehicle.id)

  const handlePrevVehicle = () => {
    const prevIndex = (currentIndex - 1 + ALL_VEHICLES.length) % ALL_VEHICLES.length
    setSelectedVehicle(ALL_VEHICLES[prevIndex])
  }

  const handleNextVehicle = () => {
    const nextIndex = (currentIndex + 1) % ALL_VEHICLES.length
    setSelectedVehicle(ALL_VEHICLES[nextIndex])
  }

  // Spec icons matching design
  const specs = [
    {
      id: 'kecepatan',
      label: 'KECEPATAN',
      value: vehicle.specs?.kecepatan || '200 km/h',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B2D6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 14l3-3" />
          <path d="M3.34 19a10 10 0 1 1 17.32 0" />
        </svg>
      ),
    },
    {
      id: 'ac',
      label: vehicle.type === 'motor' ? 'BAGASI' : 'AC',
      value: vehicle.specs?.ac || 'AC',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B2D6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
          <circle cx="12" cy="12" r="2" fill="#1B2D6B" />
        </svg>
      ),
    },
    {
      id: 'kursi',
      label: 'KURSI',
      value: vehicle.specs?.kursi || '4',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B2D6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="2" />
          <path d="M9 20h6" />
          <path d="M10 20v-5h4v5" />
          <path d="M14 15l1.5-6H8" />
        </svg>
      ),
    },
    {
      id: 'transmisi',
      label: vehicle.specs?.transmisi || 'MATIC',
      value: vehicle.specs?.transmisi || 'MATIC',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B2D6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="2" />
          <circle cx="12" cy="6" r="2" />
          <circle cx="18" cy="6" r="2" />
          <circle cx="6" cy="18" r="2" />
          <circle cx="18" cy="18" r="2" />
          <path d="M6 8v8M18 8v8M6 12h12M12 8v4" />
        </svg>
      ),
    },
    {
      id: 'bluetooth',
      label: 'BLUETOOTH',
      value: vehicle.specs?.bluetooth || '4.0',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B2D6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5" />
        </svg>
      ),
    },
    {
      id: 'pintu',
      label: vehicle.type === 'motor' ? 'TANGKI' : 'PINTU',
      value: vehicle.specs?.pintu || '4',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B2D6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4" />
          <path d="M4 12h3" />
          <circle cx="8" cy="12" r="1" fill="#1B2D6B" />
          <line x1="4" y1="4" x2="4" y2="22" />
        </svg>
      ),
    },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundImage: `url(${bgLatar})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#1d4ed8',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        color: '#ffffff',
      }}
    >
      {/* ── Top Header Navigation ── */}
      <header
        style={{
          width: '100%',
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          zIndex: 10,
        }}
      >
        <button
          onClick={() => setStep('home')}
          aria-label="Kembali ke Beranda"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#ffffff',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <h1 style={{ fontSize: '19px', fontWeight: 700, letterSpacing: '0.3px', margin: 0 }}>
          {vehicle.displayName || vehicle.name}
        </h1>
      </header>

      {/* ── Main Content Container (Responsive Split on Desktop / Stack on Mobile) ── */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '12px 28px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <div className="vehicle-detail-grid" style={{ width: '100%' }}>
          {/* ── Left Column: Vehicle Image Carousel ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              padding: '20px 0',
            }}
          >
            {/* Left Chevron */}
            <button
              onClick={handlePrevVehicle}
              aria-label="Kendaraan Sebelumnya"
              style={{
                position: 'absolute',
                left: '0',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.7)',
                zIndex: 5,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Big Vehicle Photo */}
            <div
              style={{
                width: '100%',
                maxWidth: '480px',
                height: 'clamp(200px, 32vw, 320px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 20px',
              }}
            >
              <img
                src={vehicle.image}
                alt={vehicle.name}
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.35))',
                  transition: 'all 0.3s ease',
                }}
              />
            </div>

            {/* Right Chevron */}
            <button
              onClick={handleNextVehicle}
              aria-label="Kendaraan Selanjutnya"
              style={{
                position: 'absolute',
                right: '0',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.7)',
                zIndex: 5,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* ── Right Column: Specs, Price, & CTA Button ── */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Title & Price Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '10px',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 'clamp(22px, 2.5vw, 28px)',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    color: '#ffffff',
                    margin: 0,
                  }}
                >
                  {vehicle.name}
                </h2>
                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <span style={{ color: '#fbbf24', fontSize: '15px' }}>★</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                    {vehicle.rating || 4.9}
                  </span>
                  <span style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.8)' }}>
                    ({vehicle.reviewsCount || 1} Ulasan)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: 'clamp(20px, 2.2vw, 26px)',
                    fontWeight: 800,
                    color: '#ffffff',
                    lineHeight: 1.2,
                  }}
                >
                  Rp. {(vehicle.price || 350000).toLocaleString('id-ID')}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 500 }}>
                  / per hari
                </div>
              </div>
            </div>

            {/* Divider line */}
            <div
              style={{
                height: '1px',
                background: 'rgba(255, 255, 255, 0.25)',
                margin: '14px 0 20px',
              }}
            />

            {/* Heading Spesifikasi */}
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '16px',
              }}
            >
              Spesifikasi
            </div>

            {/* 6 Specification Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '28px',
              }}
            >
              {specs.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'rgba(240, 244, 252, 0.95)',
                    borderRadius: '16px',
                    padding: '16px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                  }}
                >
                  <div style={{ height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#1B2D6B',
                      letterSpacing: '0.4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#1B2D6B',
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Sewa Sekarang CTA Button */}
            <button
              onClick={() => setShowBookingModal(true)}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: '#13224f',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '16px',
                fontWeight: 800,
                letterSpacing: '0.4px',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(10, 18, 48, 0.4)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#0e1a3d'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(10, 18, 48, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#13224f'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(10, 18, 48, 0.4)'
              }}
            >
              Sewa Sekarang
            </button>
          </div>
        </div>
      </main>

      {/* ── Phase 3: Scheduling & Logistics Modal ── */}
      {showBookingModal && (
        <BookingFlowModals vehicle={vehicle} onClose={() => setShowBookingModal(false)} />
      )}

      {/* Responsive layout CSS */}
      <style>{`
        .vehicle-detail-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 1024px) {
          .vehicle-detail-grid {
            grid-template-columns: 1.1fr 1fr;
            gap: 48px;
            align-items: center;
          }
        }
      `}</style>
    </div>
  )
}
