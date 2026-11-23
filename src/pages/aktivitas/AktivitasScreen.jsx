import { useState } from 'react'
import useAuthStore from '../../store/useAuthStore'
import GoogleMapTracking from '../../components/maps/GoogleMapTracking'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatRp = (val) =>
  val ? 'Rp ' + val.toLocaleString('id-ID') : 'Rp -'

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(null)
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(null)}
          style={{
            fontSize: readonly ? '16px' : '28px',
            cursor: readonly ? 'default' : 'pointer',
            color: (hovered || value) >= star ? '#F59E0B' : '#D1D5DB',
            transition: 'color 0.15s',
          }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyCard({ text }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '16px',
      border: '1px solid #DCE4F2', padding: '28px',
      textAlign: 'center', color: '#94A3B8', fontSize: '14px',
      boxShadow: '0 2px 8px rgba(20,42,89,0.04)',
    }}>
      {text}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AktivitasScreen({ onBack }) {
  const {
    bookingLogs,
    updateBookingLogStatus,
    updateBookingLogRating,
  } = useAuthStore()

  // Separate active vs completed from real store
  const activeBookings = bookingLogs.filter((b) => b.status === 'active')
  const historyBookings = bookingLogs.filter((b) => b.status === 'completed')

  // Local view state
  const [view, setView] = useState('list') // 'list' | 'detail' | 'nota' | 'tracking'
  const [selectedBooking, setSelectedBooking] = useState(null)

  // Rating modal
  const [ratingTarget, setRatingTarget] = useState(null)
  const [ratingValue, setRatingValue] = useState(0)
  const [ratingComment, setRatingComment] = useState('')

  const openDetail = (booking) => {
    setSelectedBooking(booking)
    setView('detail')
  }

  const openNota = (booking) => {
    setSelectedBooking(booking)
    setView('nota')
  }

  const openTracking = (booking) => {
    setSelectedBooking(booking)
    setView('tracking')
  }

  const handleConfirmSelesai = (booking) => {
    updateBookingLogStatus(booking.id, 'completed')
    // Update local selected too
    setSelectedBooking((prev) => prev ? { ...prev, status: 'completed' } : prev)
  }

  const submitRating = () => {
    if (!ratingTarget || ratingValue === 0) return
    updateBookingLogRating(ratingTarget.id, ratingValue)
    setRatingTarget(null)
    setRatingValue(0)
    setRatingComment('')
  }

  // ── View: TRACKING ──
  if (view === 'tracking' && selectedBooking) {
    return (
      <div style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '16px' }}>
          <button
            onClick={() => setView('detail')}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              border: '1.5px solid #DCE4F2', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '18px', color: '#142A59', flexShrink: 0,
            }}
          >
            ←
          </button>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#142A59' }}>
            Lacak Pengiriman
          </div>
        </div>

        {/* Tracking info bar */}
        <div style={{
          background: '#EEF3FF', borderRadius: '14px', padding: '14px 20px',
          marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: '13px', color: '#142A59' }}>
            🚗 <strong>{selectedBooking.vehicle.displayName}</strong>
          </div>
          <div style={{ fontSize: '13px', color: '#64748B' }}>
            📍 Tujuan: <strong>{selectedBooking.deliveryLoc ?? '-'}</strong>
          </div>
        </div>

        {/* Map */}
        <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #DCE4F2', height: '70vh' }}>
          <GoogleMapTracking
            vehicle={selectedBooking.vehicle}
            destination={selectedBooking.deliveryCoords ?? { lat: -7.3235, lng: 108.2255 }}
            poolLocation={{ lat: -7.3685, lng: 108.2328 }}
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', minHeight: '100%', background: 'transparent' }}>

      {/* ── View: LIST ── */}
      {view === 'list' && (
        <>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#142A59', marginBottom: '28px', letterSpacing: '-0.3px' }}>
            Aktivitas
          </div>

          {/* Sedang Disewa */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#14213D', marginBottom: '14px' }}>
              Sedang disewa
            </div>

            {activeBookings.length === 0 ? (
              <EmptyCard text="Tidak ada kendaraan yang sedang disewa." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    isActive
                    onDetail={() => openDetail(booking)}
                    onTrack={() => openTracking(booking)}
                  />
                ))}
              </div>
            )}
          </div>

          <div style={{ height: '1px', background: '#EEF1F6', marginBottom: '28px' }} />

          {/* Riwayat Sewa */}
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#14213D', marginBottom: '14px' }}>
              Riwayat Sewa
            </div>

            {historyBookings.length === 0 ? (
              <EmptyCard text="Belum ada riwayat sewa." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {historyBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    isActive={false}
                    onDetail={() => openDetail(booking)}
                    onRating={booking.rating == null
                      ? () => { setRatingTarget(booking); setRatingValue(0); setRatingComment('') }
                      : null
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── View: DETAIL ── */}
      {view === 'detail' && selectedBooking && (
        <DetailView
          booking={
            // Always read latest from store
            bookingLogs.find((b) => b.id === selectedBooking.id) ?? selectedBooking
          }
          onBack={() => setView('list')}
          onOpenNota={() => openNota(selectedBooking)}
          onConfirmSelesai={() =>
            handleConfirmSelesai(selectedBooking)
          }
          onTrack={() => openTracking(selectedBooking)}
        />
      )}

      {/* ── View: NOTA ── */}
      {view === 'nota' && selectedBooking && (
        <NotaView
          booking={selectedBooking}
          onBack={() => setView('detail')}
        />
      )}

      {/* ── Rating Modal ── */}
      {ratingTarget && (
        <div
          onClick={() => setRatingTarget(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '24px',
              padding: '32px 28px', maxWidth: '420px', width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>⭐</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#142A59', marginBottom: '4px' }}>
                Beri Rating
              </div>
              <div style={{ fontSize: '13px', color: '#64748B' }}>
                Bagaimana pengalaman Anda dengan {ratingTarget.vehicle.displayName}?
              </div>
            </div>

            {/* Vehicle card */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: '#F8FAFC', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px',
            }}>
              {ratingTarget.vehicle.image && (
                <img src={ratingTarget.vehicle.image} alt={ratingTarget.vehicle.name}
                  style={{ width: '64px', height: '44px', objectFit: 'contain' }} />
              )}
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#142A59' }}>
                  {ratingTarget.vehicle.displayName}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>{ratingTarget.durationLabel}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <StarRating value={ratingValue} onChange={setRatingValue} />
            </div>

            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Tulis ulasan Anda (opsional)..."
              rows={3}
              style={{
                width: '100%', borderRadius: '10px', border: '1.5px solid #DCE4F2',
                padding: '10px 14px', fontSize: '13px', color: '#14213D',
                resize: 'none', outline: 'none', marginBottom: '16px',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setRatingTarget(null)}
                style={{
                  flex: 1, height: '44px', borderRadius: '10px',
                  border: '1.5px solid #DCE4F2', background: '#fff',
                  color: '#64748B', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                Batal
              </button>
              <button
                onClick={submitRating}
                disabled={ratingValue === 0}
                style={{
                  flex: 1, height: '44px', borderRadius: '10px', border: 'none',
                  background: ratingValue > 0 ? '#142A59' : '#CBD5E1',
                  color: '#fff', fontSize: '14px', fontWeight: 700,
                  cursor: ratingValue > 0 ? 'pointer' : 'not-allowed',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                Kirim Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Booking Card ─────────────────────────────────────────────────────────────
function BookingCard({ booking, isActive, onDetail, onTrack, onRating }) {
  const [hov, setHov] = useState(null)
  return (
    <div style={{
      background: '#fff', border: '1px solid #DCE4F2', borderRadius: '18px',
      padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '20px',
      boxShadow: '0 2px 10px rgba(20,42,89,0.06)',
    }}>
      {/* Vehicle image */}
      <div style={{
        width: '120px', height: '76px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#F0F5FF', borderRadius: '12px', overflow: 'hidden', padding: '8px',
      }}>
        {booking.vehicle.image ? (
          <img src={booking.vehicle.image} alt={booking.vehicle.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <span style={{ fontSize: '32px' }}>🚗</span>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#142A59', marginBottom: '4px' }}>
          {booking.vehicle.name}
        </div>
        <div style={{ fontSize: '12px', color: '#94A3B8' }}>{booking.durationLabel}</div>
        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
          {booking.deliveryMethod === 'delivery' ? '🚚 Antar-Jemput' : '📍 Langsung di Lokasi'}
          {' · '}
          <span style={{ color: booking.paymentStatus === 'Lunas' ? '#059669' : '#94A3B8', fontWeight: 600 }}>
            {booking.paymentStatus}
          </span>
        </div>
        {booking.rating != null && (
          <div style={{ marginTop: '4px' }}>
            <StarRating value={booking.rating} readonly />
          </div>
        )}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
        {isActive && booking.deliveryMethod === 'delivery' && onTrack && (
          <PillBtn label="Lacak" hov={hov === 'lacak'} onME={() => setHov('lacak')} onML={() => setHov(null)} onClick={onTrack} accent />
        )}
        {!isActive && booking.rating == null && onRating && (
          <PillBtn label="Beri Rating" hov={hov === 'rating'} onME={() => setHov('rating')} onML={() => setHov(null)} onClick={onRating} />
        )}
        <PillBtn label="Selengkapnya" hov={hov === 'detail'} onME={() => setHov('detail')} onML={() => setHov(null)} onClick={onDetail} />
      </div>
    </div>
  )
}

function PillBtn({ label, onClick, hov, onME, onML, accent }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onME}
      onMouseLeave={onML}
      style={{
        height: '38px', padding: '0 18px', borderRadius: '99px',
        border: accent ? '1.5px solid #2463D9' : '1.5px solid #DCE4F2',
        background: hov ? (accent ? '#EEF3FF' : '#F0F5FF') : '#fff',
        color: accent ? '#2463D9' : '#142A59',
        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
        whiteSpace: 'nowrap', transition: 'background 0.15s',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      }}
    >
      {label}
    </button>
  )
}

// ─── DETAIL VIEW ──────────────────────────────────────────────────────────────
function DetailView({ booking, onBack, onOpenNota, onConfirmSelesai, onTrack }) {
  const isActive = booking.status === 'active'
  const isDelivery = booking.deliveryMethod === 'delivery'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px', gap: '16px' }}>
        <button
          onClick={onBack}
          style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '1.5px solid #DCE4F2', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '18px', color: '#142A59', flexShrink: 0,
          }}
        >
          ←
        </button>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#142A59' }}>Aktivitas</div>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Left: booking card */}
        <div style={{
          flex: '1 1 360px', background: '#fff', borderRadius: '20px',
          border: '1px solid #DCE4F2', boxShadow: '0 4px 14px rgba(20,42,89,0.08)', overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #EEF1F6', fontSize: '14px', fontWeight: 700, color: '#64748B' }}>
            {isActive ? 'Sedang disewa' : 'Riwayat sewa'}
          </div>

          {/* Vehicle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 24px', borderBottom: '1px solid #EEF1F6' }}>
            <div style={{ width: '140px', height: '90px', flexShrink: 0, background: '#F0F5FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', overflow: 'hidden' }}>
              {booking.vehicle.image
                ? <img src={booking.vehicle.image} alt={booking.vehicle.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <span style={{ fontSize: '40px' }}>🚗</span>
              }
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#142A59', letterSpacing: '-0.3px' }}>
                {booking.vehicle.name}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                {isDelivery ? '🚚 Antar-Jemput' : '📍 Langsung di Lokasi'}
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div style={{ padding: '8px 24px 20px' }}>
            <InfoRow icon="🪪" label="Nomor Plat Kendaraan" value={booking.vehicle.nomorPlat} />
            <InfoRow icon="📅" label="Durasi Sewa" value={booking.durationLabel} />
            <InfoRow icon="💰" label="Total" value={formatRp(booking.grandTotal)} />
            <InfoRow icon="💳" label="Status Pembayaran" value={booking.paymentStatus} valueColor="#059669" />
            {isDelivery && booking.deliveryLoc && (
              <InfoRow icon="📍" label="Lokasi Antar" value={booking.deliveryLoc} />
            )}
            {isDelivery && booking.pickupLoc && (
              <InfoRow icon="🏠" label="Lokasi Jemput" value={booking.pickupLoc} />
            )}

            <button
              onClick={onOpenNota}
              style={{
                marginTop: '8px', background: 'none', border: 'none',
                color: '#2463D9', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', padding: '4px 0',
                textDecoration: 'underline',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              Lihat Struk Pembayaran
            </button>
          </div>
        </div>

        {/* Right: status panel */}
        <div style={{
          flex: '0 0 220px', background: '#fff', borderRadius: '20px',
          border: '1.5px solid #DCE4F2', boxShadow: '0 4px 14px rgba(20,42,89,0.08)',
          padding: '24px',
        }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>
              Status Pesanan :
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: isActive ? '#2463D9' : '#059669' }}>
              {isActive ? 'Sedang Berjalan' : 'Selesai'}
            </div>
          </div>

          <div style={{ height: '1px', background: '#EEF1F6', marginBottom: '16px' }} />

          <div style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '16px', textAlign: 'center' }}>
            Apakah pesanan anda sudah selesai?
          </div>

          {isActive ? (
            <button
              onClick={onConfirmSelesai}
              style={{
                width: '100%', height: '44px', borderRadius: '12px',
                background: '#142A59', border: 'none', color: '#fff',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                marginBottom: '12px', boxShadow: '0 4px 12px rgba(20,42,89,0.3)',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              Konfirmasi Pesanan Selesai
            </button>
          ) : (
            <div style={{
              width: '100%', height: '44px', borderRadius: '12px',
              background: '#F0FDF4', border: '1.5px solid #BBF7D0',
              color: '#059669', fontSize: '13px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '12px',
            }}>
              ✓ Pesanan Selesai
            </div>
          )}

          {isDelivery && isActive && (
            <button
              onClick={onTrack}
              style={{
                width: '100%', height: '40px', borderRadius: '12px',
                border: '1.5px solid #2463D9', background: '#EEF3FF',
                color: '#2463D9', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              🗺️ Lacak Pengiriman
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value, valueColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 0', borderBottom: '1px solid #F1F5F9' }}>
      <div style={{ width: '36px', height: '36px', flexShrink: 0, background: '#EEF3FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: valueColor || '#142A59' }}>{value}</div>
      </div>
    </div>
  )
}

// ─── NOTA VIEW ────────────────────────────────────────────────────────────────
function NotaView({ booking, onBack }) {
  const { customer, vehicle, biaya, noTransaksi, durationLabel, durationDays, startDate, endDate } = booking

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px', gap: '16px' }}>
        <button
          onClick={onBack}
          style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '1.5px solid #DCE4F2', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '18px', color: '#142A59', flexShrink: 0,
          }}
        >
          ←
        </button>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#142A59' }}>Nota Pesanan</div>
      </div>

      <div style={{
        background: '#fff', borderRadius: '20px',
        border: '1px solid #DCE4F2',
        boxShadow: '0 4px 14px rgba(20,42,89,0.08)', padding: '28px',
      }}>
        <div style={{ display: 'flex', gap: '40px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {/* Left */}
          <div style={{ flex: '1 1 240px' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingBottom: '16px', borderBottom: '1px solid #EEF1F6', marginBottom: '20px',
            }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#142A59' }}>Nomor Transaksi</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#142A59' }}>
                {String(noTransaksi).padStart(2, '0')}
              </span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#142A59', marginBottom: '14px' }}>
              Informasi Pelanggan
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <NotaRow label="Nama Pemesan:" value={customer?.nama ?? '-'} />
              <NotaRow label="No. Hp:" value={customer?.noHp ?? '-'} />
              <NotaRow label="Alamat:" value={customer?.alamat ?? '-'} />
              <NotaRow label="Email:" value={customer?.email ?? '-'} />
              <NotaRow label="No. Identitas (KTP/SIM/Paspor):" value={customer?.noIdentitas ?? '-'} />
            </div>
          </div>

          {/* Right */}
          <div style={{ flex: '1 1 220px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#142A59', marginBottom: '14px' }}>
              Detail Kendaraan
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <NotaRow label="Merk/Model:" value={vehicle.merk} />
              <NotaRow label="Tahun Produksi:" value={vehicle.tahunProduksi ?? '20xx'} />
              <NotaRow label="Nomor Plat Kendaraan:" value={vehicle.nomorPlat} />
              <NotaRow label="Tanggal Mulai Sewa:" value={formatDate(startDate)} />
              <NotaRow label="Tanggal Berakhir Sewa:" value={formatDate(endDate)} />
              <NotaRow label="Durasi Total:" value={`${durationDays} Hari`} />
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: '#EEF1F6', marginBottom: '24px' }} />

        <div style={{ fontSize: '14px', fontWeight: 800, color: '#142A59', marginBottom: '16px' }}>
          Rincian Biaya
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <BiayaRow label="Total Harga Sewa" value={formatRp(biaya?.hargaSewa)} />
          <BiayaRow label="Biaya Layanan & Admin" value={formatRp(biaya?.layananAdmin)} />
          <BiayaRow label="Diskon" value={biaya?.diskon > 0 ? formatRp(biaya.diskon) : 'Rp -'} />
          <BiayaRow label="PPN (10%)" value={formatRp(biaya?.ppn)} />
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '14px', marginTop: '4px', borderTop: '1.5px solid #EEF1F6' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#142A59' }}>TOTAL HARGA</span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#2463D9' }}>{formatRp(biaya?.total)}</span>
          </div>
        </div>

        <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => window.print()}
            style={{
              height: '42px', padding: '0 24px', borderRadius: '10px',
              border: '1.5px solid #DCE4F2', background: '#F8FAFC',
              color: '#142A59', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            🖨️ Cetak / Unduh
          </button>
        </div>
      </div>
    </div>
  )
}

function NotaRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <span style={{ fontSize: '13px', color: '#64748B', minWidth: '170px', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '13px', color: '#142A59', fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function BiayaRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '13px', color: '#64748B' }}>{label}</span>
      <span style={{ fontSize: '13px', color: '#142A59', fontWeight: 600 }}>{value}</span>
    </div>
  )
}
