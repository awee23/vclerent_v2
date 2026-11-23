import rangeRoverImg from '../../assets/vehicles/Mobil/rangerover.png'
import apvImg from '../../assets/vehicles/Mobil/apv1.png'
import embegehImg from '../../assets/vehicles/Mobil/embegeh.png'
import alphardImg from '../../assets/vehicles/Mobil/alphard.png'
import calyaImg from '../../assets/vehicles/Mobil/calya.png'
import hrvImg from '../../assets/vehicles/Mobil/HRV.png'
import rushImg from '../../assets/vehicles/Mobil/rush.png'
import wulingImg from '../../assets/vehicles/Mobil/wuling.png'
import varioImg from '../../assets/vehicles/Motor/vario160.png'
import beatImg from '../../assets/vehicles/Motor/beat1.png'
import useAuthStore from '../../store/useAuthStore'

export const ALL_VEHICLES = [
  {
    id: 1,
    type: 'mobil',
    name: 'TOYOTA FORTUNER',
    displayName: 'Toyota Fortuner',
    category: 'SUV',
    seats: '7 Seats',
    price: 850000,
    priceText: 'Rp 850.000',
    periodText: '/day',
    rating: 4.9,
    reviewsCount: 24,
    image: rushImg,
    available: true,
    specs: {
      kecepatan: '220 km/h',
      ac: 'Dual AC',
      kursi: '7',
      transmisi: 'MATIC',
      bluetooth: '5.0',
      pintu: '5',
    },
  },
  {
    id: 2,
    type: 'mobil',
    name: 'HONDA CIVIC',
    displayName: 'Honda Civic',
    category: 'Sedan',
    seats: '5 Seats',
    price: 650000,
    priceText: 'Rp 650.000',
    periodText: '/day',
    rating: 4.8,
    reviewsCount: 18,
    image: hrvImg,
    available: true,
    specs: {
      kecepatan: '240 km/h',
      ac: 'AC',
      kursi: '5',
      transmisi: 'MATIC',
      bluetooth: '5.0',
      pintu: '4',
    },
  },
  {
    id: 3,
    type: 'mobil',
    name: 'MITSUBISHI XPANDER',
    displayName: 'Mitsubishi Xpander',
    category: 'MPV',
    seats: '7 Seats',
    price: 600000,
    priceText: 'Rp 600.000',
    periodText: '/day',
    rating: 4.9,
    reviewsCount: 32,
    image: wulingImg,
    available: true,
    specs: {
      kecepatan: '180 km/h',
      ac: 'Dual AC',
      kursi: '7',
      transmisi: 'MATIC',
      bluetooth: '4.2',
      pintu: '5',
    },
  },
  {
    id: 4,
    type: 'mobil',
    name: 'TOYOTA AVANZA',
    displayName: 'Toyota Avanza',
    category: 'MPV',
    seats: '7 Seats',
    price: 550000,
    priceText: 'Rp 550.000',
    periodText: '/day',
    rating: 4.7,
    reviewsCount: 45,
    image: calyaImg,
    available: true,
    specs: {
      kecepatan: '170 km/h',
      ac: 'Dual AC',
      kursi: '7',
      transmisi: 'MANUAL',
      bluetooth: '4.0',
      pintu: '5',
    },
  },
  {
    id: 5,
    type: 'mobil',
    name: 'RANGE ROVER',
    displayName: 'Range Rover Vogue',
    category: 'Luxury SUV',
    seats: '4 Seats',
    price: 350000,
    priceText: 'Rp 350.000',
    periodText: '/day',
    rating: 4.9,
    reviewsCount: 14,
    image: rangeRoverImg,
    available: true,
    specs: {
      kecepatan: '280 km/h',
      ac: 'Quad AC',
      kursi: '4',
      transmisi: 'MATIC',
      bluetooth: '5.2',
      pintu: '4',
    },
  },
  {
    id: 6,
    type: 'mobil',
    name: 'TOYOTA ALPHARD',
    displayName: 'Toyota Alphard VIP',
    category: 'Luxury MPV',
    seats: '7 Seats',
    price: 1000000,
    priceText: 'Rp 1.000.000',
    periodText: '/day',
    rating: 5.0,
    reviewsCount: 20,
    image: alphardImg,
    available: true,
    specs: {
      kecepatan: '200 km/h',
      ac: 'Dual AC',
      kursi: '7',
      transmisi: 'MATIC',
      bluetooth: '5.0',
      pintu: '5',
    },
  },
  {
    id: 7,
    type: 'mobil',
    name: 'SUZUKI APV',
    displayName: 'Suzuki APV Arena',
    category: 'Minivan',
    seats: '7 Seats',
    price: 250000,
    priceText: 'Rp 250.000',
    periodText: '/day',
    rating: 4.6,
    reviewsCount: 16,
    image: apvImg,
    available: true,
    specs: {
      kecepatan: '160 km/h',
      ac: 'AC',
      kursi: '7',
      transmisi: 'MANUAL',
      bluetooth: '4.0',
      pintu: '5',
    },
  },
  {
    id: 8,
    type: 'motor',
    name: 'HONDA VARIO 160',
    displayName: 'Honda Vario 160',
    category: 'Motor Matic',
    seats: '2 Seats',
    price: 200000,
    priceText: 'Rp 200.000',
    periodText: '/day',
    rating: 4.9,
    reviewsCount: 28,
    image: varioImg,
    available: true,
    specs: {
      kecepatan: '120 km/h',
      ac: '18L Helm',
      kursi: '2',
      transmisi: 'MATIC',
      bluetooth: 'Smart Key',
      pintu: '5.5L',
    },
  },
  {
    id: 9,
    type: 'motor',
    name: 'HONDA BEAT DELUXE',
    displayName: 'Honda Beat Deluxe',
    category: 'Motor Matic',
    seats: '2 Seats',
    price: 150000,
    priceText: 'Rp 150.000',
    periodText: '/day',
    rating: 4.8,
    reviewsCount: 36,
    image: beatImg,
    available: true,
    specs: {
      kecepatan: '105 km/h',
      ac: '12L Bagasi',
      kursi: '2',
      transmisi: 'MATIC',
      bluetooth: 'USB Port',
      pintu: '4.2L',
    },
  },
  {
    id: 10,
    type: 'mobil',
    name: 'GRAN MAX BOX',
    displayName: 'Daihatsu Gran Max Box',
    category: 'Cargo Van',
    seats: '2 Seats',
    price: 150000,
    priceText: 'Rp 150.000',
    periodText: '/day',
    rating: 4.7,
    reviewsCount: 9,
    image: embegehImg,
    available: true,
    specs: {
      kecepatan: '140 km/h',
      ac: 'AC',
      kursi: '2',
      transmisi: 'MANUAL',
      bluetooth: '3.0',
      pintu: '2',
    },
  },
]

export default function VehicleList({ activeCategory, query }) {
  const { setSelectedVehicle, setStep } = useAuthStore()

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle)
    setStep('vehicle-detail')
  }

  const filtered = ALL_VEHICLES.filter((v) => {
    const matchCat = !activeCategory || v.type === activeCategory
    const matchQ =
      !query ||
      v.name.toLowerCase().includes(query.toLowerCase()) ||
      v.displayName.toLowerCase().includes(query.toLowerCase())
    return matchCat && matchQ
  })

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '18px',
        }}
      >
        {filtered.map((vehicle) => (
          <div
            key={vehicle.id}
            onClick={() => handleSelectVehicle(vehicle)}
            style={{
              background: '#ffffff',
              border: '1px solid #EAEFF5',
              borderRadius: '18px',
              padding: '16px 14px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 10px 24px rgba(20, 42, 89, 0.08)'
              e.currentTarget.style.borderColor = '#2463D9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.03)'
              e.currentTarget.style.borderColor = '#EAEFF5'
            }}
          >
            <div
              style={{
                height: '110px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                padding: '4px',
              }}
            >
              <img
                src={vehicle.image}
                alt={vehicle.displayName}
                style={{
                  maxHeight: '100px',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.06))',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                marginTop: '12px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#142A59',
                    marginBottom: '2px',
                  }}
                >
                  {vehicle.displayName}
                </div>
                <div
                  style={{
                    fontSize: '11.5px',
                    color: '#64748B',
                    marginBottom: '6px',
                  }}
                >
                  {vehicle.category} • {vehicle.seats}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#142A59' }}>
                    {vehicle.priceText}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    {vehicle.periodText}
                  </span>
                </div>
              </div>

              <button
                aria-label={`Pilih ${vehicle.displayName}`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelectVehicle(vehicle)
                }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#142A59',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(20, 42, 89, 0.25)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#2463D9'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#142A59'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
