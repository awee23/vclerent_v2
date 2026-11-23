import { useState, useEffect } from 'react'
import slideImage from '../../assets/images/slidekonten_beranda.png'


export default function HeroSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setCurrent(p => (p + 1) % slides.length), 4500)
    return () => clearInterval(t)
  }, [])

  const slide = slides[current]

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1180px',
        margin: '0 auto',
        padding: '28px 24px 20px',
      }}
    >
      {/* Banner Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #13224f 0%, #172a63 50%, #1c3274 100%)',
          borderRadius: '24px',
          padding: '16px 28px 16px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 16px 36px -10px rgba(10, 18, 48, 0.45)',
          position: 'relative',
          overflow: 'hidden',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        {/* Left: Car image */}
        <div
          style={{
            width: 'clamp(220px, 32vw, 340px)',
            height: '140px',
            borderRadius: '16px',
            overflow: 'hidden',
            flexShrink: 0,
            background: 'rgba(0,0,0,0.1)',
          }}
        >
          <img
            src={slide.image}
            alt="Flash Sale Kendaraan"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'left center',
              display: 'block',
            }}
          />
        </div>

        {/* Center: Text & Pagination */}
        <div
          style={{
            flex: '1 1 260px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '17px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '0.8px',
              fontFamily: 'inherit',
              marginBottom: '6px',
              textTransform: 'uppercase',
            }}
          >
            {slide.badge}
          </div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.95)',
              lineHeight: 1.35,
            }}
          >
            {slide.title}
          </div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.95)',
              lineHeight: 1.35,
              marginBottom: '10px',
            }}
          >
            {slide.titleLine2}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '14px',
            }}
          >
            {slide.subtitle}
          </div>

          {/* Dots Pill Indicator */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  height: '6px',
                  width: i === current ? '36px' : '36px',
                  borderRadius: '99px',
                  background: i === current ? '#ffffff' : '#22386d',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'background 0.3s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Right: CTA Button */}
        <div style={{ flexShrink: 0 }}>
          <button
            style={{
              padding: '11px 28px',
              background: '#3730A3',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(55, 48, 163, 0.4)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#312E81'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#3730A3'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {slide.btnLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
