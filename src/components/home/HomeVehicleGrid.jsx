import { useState } from 'react'
import { ALL_VEHICLES } from './VehicleList'
import useAuthStore from '../../store/useAuthStore'

export default function HomeVehicleGrid({ activeCategory = '', query = '', isMobile = false }) {
  const { setSelectedVehicle, setStep } = useAuthStore()
  const [showAll, setShowAll] = useState(false)

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle)
    setStep('vehicle-detail')
  }

  // Filter by category & query
  const filtered = ALL_VEHICLES.filter((v) => {
    const matchCat = !activeCategory || v.type === activeCategory
    const matchQ =
      !query ||
      v.name.toLowerCase().includes(query.toLowerCase()) ||
      v.displayName.toLowerCase().includes(query.toLowerCase()) ||
      v.category.toLowerCase().includes(query.toLowerCase())
    return matchCat && matchQ
  })

  // Default: show 4 on desktop/tablet, 4 on mobile (2×2)
  const defaultCount = 4
  const displayedVehicles = showAll || query ? filtered : filtered.slice(0, defaultCount)

  return (
    <section id="popular-vehicles" style={{ width: '100%' }}>
      {/* ── Section Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: isMobile ? '14px' : '20px',
        }}
      >
        <h2
          style={{
            fontSize: isMobile ? '17px' : '20px',
            fontWeight: 800,
            color: '#142A59',
            letterSpacing: '-0.3px',
            margin: 0,
          }}
        >
          Popular Vehicles
        </h2>

        <button
          onClick={() => setShowAll((prev) => !prev)}
          style={{
            background: 'none', border: 'none',
            fontSize: '13px', fontWeight: 700, color: '#142A59',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: '4px', padding: 0, transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#2463D9')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#142A59')}
        >
          {showAll ? 'Show Less ←' : 'See All →'}
        </button>
      </div>

      {/* ── Responsive Vehicle Card Grid ── */}
      {displayedVehicles.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #EAEFF5',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🚗🔍</div>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
            Tidak ada kendaraan yang sesuai dengan kriteria pencarian.
          </p>
        </div>
      ) : (
        <div className="vc-vehicle-grid">
          {displayedVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              onClick={() => handleSelectVehicle(vehicle)}
              style={{
                background: '#ffffff',
                border: '1px solid #EAEFF5',
                borderRadius: '20px',
                padding: isMobile ? '14px 12px 12px' : '20px 18px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(20, 42, 89, 0.09)'
                e.currentTarget.style.borderColor = '#2463D9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.03)'
                e.currentTarget.style.borderColor = '#EAEFF5'
              }}
            >
              {/* Vehicle Image */}
              <div
                style={{
                  height: isMobile ? '80px' : '115px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: isMobile ? '10px' : '14px',
                  padding: '4px',
                }}
              >
                <img
                  src={vehicle.image}
                  alt={vehicle.displayName}
                  style={{
                    maxHeight: isMobile ? '70px' : '105px',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.08))',
                  }}
                />
              </div>

              {/* Info: Name, Type/Seats, Price, Action Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  paddingTop: '4px',
                }}
              >
                <div style={{ minWidth: 0, flex: 1, paddingRight: '6px' }}>
                  <h3
                    style={{
                      fontSize: isMobile ? '13px' : '15px',
                      fontWeight: 700,
                      color: '#142A59',
                      margin: '0 0 2px',
                      letterSpacing: '-0.2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {vehicle.displayName}
                  </h3>
                  <div
                    style={{
                      fontSize: isMobile ? '11px' : '12px',
                      color: '#64748B',
                      marginBottom: isMobile ? '5px' : '8px',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {vehicle.category} · {vehicle.seats}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                    <span style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: 800, color: '#142A59' }}>
                      {vehicle.priceText}
                    </span>
                    <span style={{ fontSize: isMobile ? '10px' : '11.5px', color: '#64748B', fontWeight: 500 }}>
                      {vehicle.periodText}
                    </span>
                  </div>
                </div>

                {/* Circular Action Button */}
                <button
                  aria-label={`Sewa ${vehicle.displayName}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectVehicle(vehicle)
                  }}
                  style={{
                    width: isMobile ? '30px' : '34px',
                    height: isMobile ? '30px' : '34px',
                    borderRadius: '50%',
                    background: '#142A59',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxShadow: '0 4px 10px rgba(20, 42, 89, 0.25)',
                    transition: 'background 0.2s, transform 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2463D9'
                    e.currentTarget.style.transform = 'scale(1.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#142A59'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  <svg
                    width="13" height="13" viewBox="0 0 24 24"
                    fill="none" stroke="#ffffff" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
