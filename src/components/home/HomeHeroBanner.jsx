import { useState } from 'react'
import heroSlideImg from '../../assets/images/Heroslidefull.png'

export default function HomeHeroBanner({ onRentNow }) {
  const [activeSlide, setActiveSlide] = useState(0)

  return (
    <div style={{ marginBottom: '28px', width: '100%' }}>
      {/* ── Banner Card ── */}
      <div
        style={{
          width: '100%',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 12px 30px rgba(20, 42, 89, 0.12)',
          position: 'relative',
          background: 'linear-gradient(135deg, #0d389a 0%, #1752cf 50%, #1e63e9 100%)',
          cursor: 'pointer',
        }}
        onClick={onRentNow}
      >
        <img
          src={heroSlideImg}
          alt="Travel More Rent Better - Book your favorite vehicle today!"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            objectFit: 'cover',
          }}
        />

        {/* Interactive "Rent Now" clickable hotspot */}
        <div
          onClick={(e) => {
            e.stopPropagation()
            onRentNow()
          }}
          title="Rent Now"
          style={{
            position: 'absolute',
            left: '11.5%',
            bottom: '22%',
            width: '12%',
            height: '14%',
            minWidth: '110px',
            minHeight: '36px',
            cursor: 'pointer',
            borderRadius: '9999px',
          }}
        />
      </div>

      {/* ── Subtle Pagination Dots ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '14px',
        }}
      >
        <button
          onClick={() => setActiveSlide(0)}
          aria-label="Slide 1"
          style={{
            width: activeSlide === 0 ? '30px' : '8px',
            height: '6px',
            borderRadius: '999px',
            background: activeSlide === 0 ? '#142A59' : '#CBD5E1',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
        />
        <button
          onClick={() => setActiveSlide(1)}
          aria-label="Slide 2"
          style={{
            width: activeSlide === 1 ? '30px' : '8px',
            height: '6px',
            borderRadius: '999px',
            background: activeSlide === 1 ? '#142A59' : '#CBD5E1',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
        />
        <button
          onClick={() => setActiveSlide(2)}
          aria-label="Slide 3"
          style={{
            width: activeSlide === 2 ? '30px' : '8px',
            height: '6px',
            borderRadius: '999px',
            background: activeSlide === 2 ? '#142A59' : '#CBD5E1',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
        />
      </div>
    </div>
  )
}
