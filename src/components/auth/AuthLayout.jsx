import logo from '../../assets/logo/logo.png'
import ctaCarImg from '../../assets/images/showing car for CTA.png'

// ─── Benefit Icons (inline SVG) ───────────────────────────────────────────────
const KycIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
)

const GpsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v4M12 19v4M1 12h4M19 12h4" />
    <circle cx="12" cy="12" r="8" />
  </svg>
)

const SupportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.0 1.19 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z" />
    <path d="M14.5 2.5C16.5 3.5 18.5 5.5 19.5 7.5" />
    <path d="M12 2a9 9 0 019 9" />
  </svg>
)

const BENEFITS = [
  { icon: KycIcon,     label: 'Verifikasi KYC Cepat' },
  { icon: GpsIcon,     label: 'Lacak Lokasi Secara Real-Time' },
  { icon: SupportIcon, label: 'Layanan Pelanggan 24/7' },
]

export default function AuthLayout({ children, step = 'welcome' }) {
  // Atur card width agar form bertahap (register, ktp, sim, terms) punya ruang yang nyaman
  const isWideCard = ['register', 'ktp', 'sim', 'terms'].includes(step)
  const cardMaxWidth = isWideCard ? 500 : 440

  return (
    <>
      <style>{`
        .vc-auth-root * { box-sizing: border-box; }
        .vc-btn-primary {
          width: 100%; padding: 14px 20px;
          background: #1B2D6B; color: #ffffff;
          border: none; border-radius: 10px;
          font-size: 15px; font-weight: 700;
          cursor: pointer; letter-spacing: 0.2px;
          transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 14px rgba(27, 45, 107, 0.2);
        }
        .vc-btn-primary:hover:not(:disabled):not([data-disabled="true"]) {
          background: #142255;
          box-shadow: 0 6px 18px rgba(27, 45, 107, 0.3);
        }
        .vc-btn-primary:active:not(:disabled):not([data-disabled="true"]) {
          transform: scale(0.99);
        }
        .vc-btn-primary:disabled,
        .vc-btn-primary[data-disabled="true"] {
          background: #94a3b8 !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
          transform: none !important;
        }
        .vc-btn-back {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #334155;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .vc-btn-back:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }
        .vc-field-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }
        .vc-field-input {
          width: 100%;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          background-color: #ffffff;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .vc-field-input:focus {
          border-color: #1B2D6B;
          box-shadow: 0 0 0 3px rgba(27, 45, 107, 0.1);
        }
        .vc-badge {
          font-size: 12px;
          font-weight: 700;
          color: #1B2D6B;
          background: #eef2ff;
          padding: 4px 12px;
          border-radius: 99px;
          white-space: nowrap;
        }
        @media (max-width: 900px) {
          .vc-auth-left { display: none !important; }
          .vc-auth-right { width: 100% !important; padding: 24px 16px !important; }
          .vc-auth-root { flex-direction: column !important; }
          .vc-auth-card { padding: 32px 20px !important; }
        }
      `}</style>

      <div
        className="vc-auth-root"
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100vw',
          minHeight: '100vh',
        }}
      >
        {/* ════════════════════════════════════════════════════════
            LEFT PANEL — Deep Navy SaaS Brand Panel
        ════════════════════════════════════════════════════════ */}
        <div
          className="vc-auth-left"
          style={{
            width: '52%',
            minHeight: '100vh',
            background: 'linear-gradient(160deg, #0d1d4a 0%, #1B2D6B 55%, #1a3a8f 100%)',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            padding: '48px 56px 40px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle circles */}
          <div style={{
            position: 'absolute', top: -120, right: -120,
            width: 380, height: 380, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -100, left: -80,
            width: 320, height: 320, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, zIndex: 1 }}>
            <img src={logo} alt="VICLERENT" style={{ width: 44, height: 44, objectFit: 'contain' }} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.1 }}>VICLERENT</div>
              <div style={{ fontSize: 10, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: 2 }}>
                Vehicle Rental Solution
              </div>
            </div>
          </div>

          {/* Headline + Description */}
          <div style={{ marginTop: 52, zIndex: 1, flex: '0 0 auto' }}>
            <h1 style={{
              fontSize: 40, fontWeight: 800, lineHeight: 1.2,
              margin: '0 0 18px', letterSpacing: '-1px',
            }}>
              Sewa Mobil &amp; Motor<br />
              Lebih Cepat,{' '}
              <span style={{ color: '#60a5fa' }}>Aman, &amp; Terpercaya.</span>
            </h1>
            <p style={{
              fontSize: 15, color: '#cbd5e1', lineHeight: 1.7,
              maxWidth: 420, margin: 0,
            }}>
              Nikmati kemudahan penyewaan kendaraan dengan verifikasi instan,
              pelacakan live GPS, dan berbagai pilihan unit siap pakai.
            </p>
          </div>

          {/* Vehicle Fleet CTA Image */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            marginTop: 24,
            zIndex: 1,
            minHeight: 180,
          }}>
            <img
              src={ctaCarImg}
              alt="VICLERENT Fleet"
              style={{
                width: '100%',
                maxWidth: 480,
                objectFit: 'contain',
                filter: 'drop-shadow(0 20px 36px rgba(0,0,0,0.5))',
              }}
            />
          </div>

          {/* 3 Benefits at bottom */}
          <div style={{
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
            zIndex: 1,
            paddingTop: 28,
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            {BENEFITS.map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(255,255,255,0.1)',
                  color: '#93c5fd', flexShrink: 0,
                }}>
                  <Icon />
                </span>
                <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500, lineHeight: 1.3 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            RIGHT PANEL — Clean SaaS Card Container
        ════════════════════════════════════════════════════════ */}
        <div
          className="vc-auth-right"
          style={{
            width: '48%',
            minHeight: '100vh',
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '36px 32px',
          }}
        >
          <div
            className="vc-auth-card"
            style={{
              width: '100%',
              maxWidth: cardMaxWidth,
              background: '#ffffff',
              borderRadius: 18,
              padding: '40px 36px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
              maxHeight: '92vh',
              overflowY: 'auto',
              transition: 'max-width 0.25s ease',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
