import catMobil from '../../assets/icons/cat_mobil1.png'
import catMotor from '../../assets/icons/cat_motor1.png'

const categories = [
  {
    id: 'mobil',
    label: 'Mobil',
    image: catMobil,
  },
  {
    id: 'motor',
    label: 'Motor',
    image: catMotor,
  },
]

export default function CategoryFilter({ active, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: '14px', marginBottom: '28px' }}>
      {categories.map((cat) => {
        const isActive = active === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(isActive ? '' : cat.id)}
            style={{
              width: '78px',
              height: '78px',
              borderRadius: '18px',
              background: '#ffffff',
              border: isActive ? '2px solid #1B2D6B' : '1.5px solid #e2e8f0',
              boxShadow: isActive
                ? '0 6px 18px rgba(27, 45, 107, 0.16)'
                : '0 2px 8px rgba(0, 0, 0, 0.04)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '6px',
              transition: 'all 0.2s ease',
              transform: isActive ? 'translateY(-2px)' : 'none',
            }}
          >
            <div style={{ width: '40px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={cat.image}
                alt={cat.label}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#1B2D6B' : '#475569',
              }}
            >
              {cat.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
