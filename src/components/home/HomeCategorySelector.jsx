import catMobilImg from '../../assets/icons/cat_mobil1.png'
import catMotorImg from '../../assets/icons/cat_motor1.png'

const CATEGORIES = [
  { id: 'mobil', label: 'Car', image: catMobilImg },
  { id: 'motor', label: 'Motorcycle', image: catMotorImg },
]

export default function HomeCategorySelector({ activeCategory, onSelectCategory, isMobile = false, isTablet = false }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '10px' : '16px',
        marginBottom: isMobile ? '20px' : '32px',
        width: '100%',
      }}
    >
      {CATEGORIES.map((cat) => {
        const isSelected = activeCategory === cat.id || (!activeCategory && cat.id === 'mobil')
        const btnWidth = isMobile ? undefined : isTablet ? '130px' : '155px'
        const btnHeight = isMobile ? '72px' : isTablet ? '80px' : '92px'

        return (
          <button
            key={cat.id}
            onClick={() => {
              onSelectCategory(activeCategory === cat.id ? '' : cat.id)
            }}
            style={{
              width: isMobile ? undefined : btnWidth,
              flex: isMobile ? 1 : undefined,
              height: btnHeight,
              borderRadius: '20px',
              background: isSelected
                ? 'linear-gradient(135deg, #2463D9 0%, #1A54C2 100%)'
                : '#F1F4F9',
              border: isSelected ? 'none' : '1px solid #E2E8F0',
              boxShadow: isSelected ? '0 8px 20px rgba(36, 99, 217, 0.28)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 12px',
              transition: 'all 0.25s ease',
              transform: isSelected ? 'translateY(-2px)' : 'none',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.background = '#E8EDF5'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.background = '#F1F4F9'
                e.currentTarget.style.transform = 'none'
              }
            }}
          >
            {/* Vehicle Thumbnail */}
            <div style={{
              width: isMobile ? '44px' : '52px',
              height: isMobile ? '30px' : '36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img
                src={cat.image}
                alt={cat.label}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  filter: isSelected ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' : 'none',
                }}
              />
            </div>

            {/* Label */}
            <span style={{
              fontSize: isMobile ? '12px' : '13px',
              fontWeight: 700,
              color: isSelected ? '#ffffff' : '#142A59',
              letterSpacing: '0.2px',
            }}>
              {cat.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
