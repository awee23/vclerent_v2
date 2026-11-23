import { useState, useRef } from 'react'
import useAuthStore from '../../store/useAuthStore'
import logo from '../../assets/logo/logo.png'
import qrisLogo from '../../assets/icons/qris_logo1.png'
import defaultVehicleImg from '../../assets/vehicles/Mobil/rush.png'
import qrCodeDummyImg from '../../assets/Qr_codedummy/Qrcodedummy.png'
import GoogleMapTracking from '../maps/GoogleMapTracking'
import PlaceAutocompleteInput from '../maps/PlaceAutocompleteInput'
import LocationPickerModal from '../maps/LocationPickerModal'

const RECEIPT_TIMESTAMP = '10 November 2025, 14:30 WIB'

export default function BookingFlowModals({ vehicle, onClose }) {
  const { setStep, addBookingLog, bookingLogs } = useAuthStore()

  const startDateInputRef = useRef(null)
  const endDateInputRef = useRef(null)

  // Steps: 'pickup-return' | 'order-detail' | 'order-summary' | 'payment-method' | 'payment-qr' | 'payment-success' | 'receipt' | 'tracking'
  const [modalStep, setModalStep] = useState('pickup-return')

  // Booking details state
  const [deliveryMethod, setDeliveryMethod] = useState('delivery') // 'delivery' (Antar-Jemput) | 'onsite' (Langsung di lokasi)
  const [startDate, setStartDate] = useState('0000-00-00')
  const [endDate, setEndDate] = useState('0000-00-00')
  const [deliveryLoc, setDeliveryLoc] = useState('Set your location')
  const [pickupLoc, setPickupLoc] = useState('Set your location)')
  const [deliveryCoords, setDeliveryCoords] = useState({ lat: -7.3235, lng: 108.2255 })
  const [pickupCoords, setPickupCoords] = useState({ lat: -7.3685, lng: 108.2328 })
  const [pickerTarget, setPickerTarget] = useState(null) // null | 'delivery' | 'pickup'
  const [gpsLocating, setGpsLocating] = useState(null) // null | 'delivery' | 'pickup'
  const [gpsNoticeModal, setGpsNoticeModal] = useState(null)

  // Asynchronous reverse geocoding using Google Maps Geocoder or Nominatim OpenStreetMap fallback
  const reverseGeocode = async (coords) => {
    // 1. Try Google Maps Geocoder if loaded
    if (window.google?.maps?.Geocoder) {
      try {
        const geocoder = new window.google.maps.Geocoder()
        const googleResult = await new Promise((resolve) => {
          geocoder.geocode({ location: coords }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              resolve(results[0].formatted_address)
            } else {
              resolve(null)
            }
          })
        })
        if (googleResult) return googleResult
      } catch (err) {
        console.warn('Google Geocoder failed:', err)
      }
    }

    // 2. Fallback to OpenStreetMap Nominatim reverse geocode
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
      )
      if (res.ok) {
        const data = await res.json()
        if (data && data.display_name) {
          const parts = data.display_name.split(', ')
          return parts.slice(0, 4).join(', ')
        }
      }
    } catch (e) {
      console.warn('Nominatim reverse error:', e)
    }

    return `Titik GPS (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`
  }

  // Cross-device high-accuracy GPS handler with explicit permission guidance
  const handleQuickGps = (target) => {
    if (!navigator.geolocation) {
      setGpsNoticeModal({
        target,
        title: 'GPS Tidak Didukung',
        message:
          'Browser yang Anda gunakan saat ini tidak mendukung Geolocation API. Silakan tentukan lokasi dengan tombol "Pilih di Google Maps".',
      })
      return
    }

    setGpsLocating(target)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        const address = await reverseGeocode(coords)
        setGpsLocating(null)

        if (target === 'delivery') {
          setDeliveryLoc(address)
          setDeliveryCoords(coords)
        } else {
          setPickupLoc(address)
          setPickupCoords(coords)
        }
      },
      (err) => {
        setGpsLocating(null)
        console.warn('Geolocation error:', err)

        let title = 'Izin Akses Lokasi (GPS)'
        let message = 'Gagal mendeteksi lokasi GPS perangkat.'

        if (err.code === 1) {
          // PERMISSION_DENIED
          title = 'Izin Akses GPS Ditolak'
          message =
            'Browser atau perangkat Anda memblokir akses lokasi. Untuk mengizinkannya:\n\n• Pada Desktop / Laptop: Klik ikon gembok / slider di sebelah kiri URL pada browser Anda, lalu ubah opsi Lokasi (Location) menjadi "Izinkan" (Allow).\n• Pada HP Android / iOS: Izinkan akses lokasi untuk browser di Pengaturan Aplikasi & aktifkan GPS.\n\nAtau Anda dapat memilih lokasi langsung di peta dengan tombol "Pilih di Google Maps".'
        } else if (err.code === 2) {
          // POSITION_UNAVAILABLE
          title = 'Sinyal Lokasi GPS Tidak Tersedia'
          message =
            'Sinyal GPS pada perangkat tidak terdeteksi. Pastikan GPS/Location Service pada HP atau laptop Anda telah diaktifkan, atau pilih lokasi manual pada peta.'
        } else if (err.code === 3) {
          // TIMEOUT
          title = 'Waktu Permintaan GPS Habis'
          message =
            'Waktu pelacakan GPS habis (timeout). Silakan coba lagi atau gunakan tombol "Pilih di Google Maps" untuk menentukan titik secara langsung.'
        }

        setGpsNoticeModal({
          target,
          title,
          message,
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    )
  }

  const handleSwapLocations = () => {
    const tempLoc = deliveryLoc
    setDeliveryLoc(pickupLoc)
    setPickupLoc(tempLoc)

    const tempCoords = deliveryCoords
    setDeliveryCoords(pickupCoords)
    setPickupCoords(tempCoords)
  }

  // Add-ons (Tambahan)
  const [insuranceChecked, setInsuranceChecked] = useState(false)
  const [driverChecked, setDriverChecked] = useState(false)

  // QR Scan simulated preview state
  const [showQrScannedLogo, setShowQrScannedLogo] = useState(false)

  // Calculations
  const calcDuration = () => {
    try {
      const d1 = new Date(startDate)
      const d2 = new Date(endDate)
      const diffTime = d2.getTime() - d1.getTime()
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? diffDays : 1
    } catch {
      return 1
    }
  }
  const durationDays = calcDuration()
  const baseDailyPrice = vehicle?.price || 850000
  const totalRentalPrice = baseDailyPrice * durationDays

  // Addon costs
  const insuranceCost = insuranceChecked ? 50000 * durationDays : 0
  const driverCost = driverChecked ? 100000 * durationDays : 0
  const totalDetailPrice = totalRentalPrice + insuranceCost + driverCost

  const deliveryFee = deliveryMethod === 'delivery' ? 100000 : 0
  const serviceFee = 40000
  const discount = Math.round(totalRentalPrice * 0.2) // 20% promo
  const ppn = Math.round((totalRentalPrice + insuranceCost + driverCost) * 0.11) // 11%

  // Total
  const subtotal = totalRentalPrice + deliveryFee + serviceFee + insuranceCost + driverCost
  const grandTotal = Math.max(subtotal - discount + ppn, 100000)

  // Formatting date helpers
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '10 November 2025'
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
      return `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`
    }
    return dateStr
  }

  const formatDateSlash = (dateStr) => {
    if (!dateStr) return '10/11/2025'
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return dateStr
  }

  // Navigation handlers
  const handleSelectDeliveryMethod = (method) => {
    setDeliveryMethod(method)
    setModalStep('order-detail')
  }

  const handleConfirmDetail = () => {
    setModalStep('order-summary')
  }

  const handleConfirmSummary = () => {
    setModalStep('payment-method')
  }

  const handleConfirmPaymentMethod = () => {
    setModalStep('payment-qr')
  }

  const handleCompletePayment = () => {
    // ── Build booking log entry and save to global store ──────────────────────
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    const fmtDate = (d) => {
      if (!d) return '-'
      const p = d.split('-')
      return p.length === 3 ? `${parseInt(p[2], 10)} ${months[parseInt(p[1], 10) - 1]} ${p[0]}` : d
    }
    const durationLabel = `${fmtDate(startDate)} - ${fmtDate(endDate)}`
    const noTransaksi = String((bookingLogs?.length ?? 0) + 1).padStart(2, '0')

    addBookingLog({
      id: `VC${Date.now()}`,
      noTransaksi,
      vehicle: {
        name: vehicle?.name?.toUpperCase() ?? 'KENDARAAN',
        displayName: vehicle?.displayName ?? vehicle?.name ?? 'Kendaraan',
        merk: vehicle?.displayName ?? vehicle?.name ?? 'Kendaraan',
        image: vehicle?.image ?? null,
        type: vehicle?.type ?? 'mobil',
        category: vehicle?.category ?? 'SUV',
        seats: vehicle?.seats ? `${vehicle.seats} Seats` : '',
        tahunProduksi: vehicle?.year ?? '20xx',
        nomorPlat: vehicle?.platNomor ?? 'Z XXXX',
      },
      deliveryMethod,
      startDate,
      endDate,
      durationDays,
      durationLabel,
      deliveryLoc: deliveryMethod === 'delivery' ? deliveryLoc : null,
      deliveryCoords: deliveryMethod === 'delivery' ? deliveryCoords : null,
      pickupLoc: deliveryMethod === 'delivery' ? pickupLoc : null,
      pickupCoords: deliveryMethod === 'delivery' ? pickupCoords : null,
      grandTotal,
      totalRentalPrice,
      insuranceCost,
      driverCost,
      deliveryFee,
      serviceFee,
      discount,
      ppn,
      biaya: {
        hargaSewa: totalRentalPrice,
        layananAdmin: serviceFee,
        diskon: discount,
        ppn,
        total: grandTotal,
      },
      paymentStatus: 'Lunas',
      status: 'active',
      rating: null,
      createdAt: new Date().toISOString(),
      customer: {
        nama: 'Pemesan',
        noHp: '-',
        alamat: deliveryMethod === 'delivery' ? deliveryLoc : 'Pool Viclerent – Kampus 2 UNSIL',
        email: '-',
        noIdentitas: '-',
      },
    })

    setModalStep('payment-success')
  }

  const handleGoHome = () => {
    onClose()
    setStep('home')
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(20, 45, 95, 0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && modalStep !== 'payment-success' && modalStep !== 'tracking') {
          onClose()
        }
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. POPUP PENGAMBILAN & PENGEMBALIAN (Image 1)
      ───────────────────────────────────────────────────────────── */}
      {modalStep === 'pickup-return' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '28px',
            width: '100%',
            maxWidth: '620px',
            padding: '48px 36px 40px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#f1f5f9',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>

          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#5570a2',
              marginBottom: '28px',
              letterSpacing: '-0.2px',
            }}
          >
            Pengambilan & Pengembalian
          </h2>

          <p
            style={{
              fontSize: '16px',
              color: '#1e293b',
              lineHeight: 1.6,
              fontWeight: 500,
              marginBottom: '44px',
              whiteSpace: 'pre-line',
            }}
          >
            {'Pilih opsi\nPengambilan & Pengembalian\nKendaraan'}
          </p>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => handleSelectDeliveryMethod('delivery')}
              style={{
                padding: '14px 32px',
                background: '#1B2D6B',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(27, 45, 107, 0.3)',
                transition: 'transform 0.2s, background 0.2s',
                minWidth: '160px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              Antar-Jemput
            </button>

            <button
              onClick={() => handleSelectDeliveryMethod('onsite')}
              style={{
                padding: '14px 32px',
                background: '#1B2D6B',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(27, 45, 107, 0.3)',
                transition: 'transform 0.2s, background 0.2s',
                minWidth: '160px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              Langsung di lokasi
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. POPUP DETAIL PESANAN (Redesigned Production-Ready SaaS Interface)
      ───────────────────────────────────────────────────────────── */}
      {modalStep === 'order-detail' && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '26px',
            width: '100%',
            maxWidth: '1000px',
            maxHeight: '92vh',
            padding: '24px 28px 28px',
            boxShadow: '0 24px 60px rgba(15, 30, 70, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            position: 'relative',
            border: '1px solid #DCE4F2',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Responsive CSS for 2-column modal */}
          <style>{`
            .vc-order-detail-grid {
              display: grid;
              grid-template-columns: minmax(0, 1.7fr) minmax(310px, 1fr);
              gap: 24px;
              align-items: start;
            }
            @media (max-width: 860px) {
              .vc-order-detail-grid {
                grid-template-columns: 1fr !important;
                gap: 20px !important;
              }
            }
          `}</style>

          {/* ── 2. Modal Header ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              paddingBottom: '16px',
              borderBottom: '1px solid #EEF2F8',
              marginBottom: '20px',
            }}
          >
            {/* Left Circular Back Button */}
            <button
              type="button"
              onClick={() => setModalStep('pickup-return')}
              aria-label="Kembali"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#F1F5F9',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#142A59',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#E2E8F0')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#F1F5F9')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Centered Page Title */}
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#142A59',
                margin: 0,
                letterSpacing: '-0.3px',
              }}
            >
              Detail Pesanan
            </h2>

            {/* Right Circular Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#F1F5F9',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#E2E8F0')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#F1F5F9')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* ── Two Column Layout ── */}
          <div className="vc-order-detail-grid">
            {/* ══════════════════════════════════════════════════════════
                LEFT COLUMN (~65% width) - Booking Forms
            ══════════════════════════════════════════════════════════ */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* 3. Rental Date Selection */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '14px',
                  marginBottom: '18px',
                }}
              >
                {/* Tanggal Sewa */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#64748B',
                      marginBottom: '6px',
                    }}
                  >
                    <span>📍</span>
                    <span>Tanggal Sewa</span>
                  </div>
                  <div
                    onClick={() => {
                      try {
                        startDateInputRef.current?.showPicker()
                      } catch {
                        startDateInputRef.current?.focus()
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#F8FAFC',
                      border: '1.5px solid #DCE4F2',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2463D9')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#DCE4F2')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2463D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <input
                        ref={startDateInputRef}
                        type="date"
                        value={startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          if (e.target.value) {
                            setStartDate(e.target.value)
                            if (e.target.value >= endDate) {
                              const next = new Date(e.target.value)
                              next.setDate(next.getDate() + 1)
                              setEndDate(next.toISOString().split('T')[0])
                            }
                          }
                        }}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#14213D',
                          outline: 'none',
                          width: '100%',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Tanggal Berakhir Sewa */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#64748B',
                      marginBottom: '6px',
                    }}
                  >
                    <span>📍</span>
                    <span>Tanggal Berakhir Sewa</span>
                  </div>
                  <div
                    onClick={() => {
                      try {
                        endDateInputRef.current?.showPicker()
                      } catch {
                        endDateInputRef.current?.focus()
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#F8FAFC',
                      border: '1.5px solid #DCE4F2',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2463D9')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#DCE4F2')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2463D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <input
                        ref={endDateInputRef}
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => {
                          if (e.target.value) {
                            setEndDate(e.target.value)
                          }
                        }}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#14213D',
                          outline: 'none',
                          width: '100%',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 & 5. Lokasi Antar & Jemput (Hanya muncul jika Antar-Jemput) */}
              {deliveryMethod === 'delivery' ? (
                <>
                  {/* Lokasi Antar Card */}
                  <div
                    style={{
                      background: '#EEF3FF',
                      border: '1px solid #DCE4F2',
                      borderRadius: '18px',
                      padding: '16px',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#142A59">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#14213D' }}>
                          Lokasi Antar
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, background: 'rgba(255,255,255,0.7)', padding: '2px 8px', borderRadius: '99px' }}>
                        📍 {deliveryCoords.lat.toFixed(4)}, {deliveryCoords.lng.toFixed(4)}
                      </span>
                    </div>

                    {/* Input box */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: '#FFFFFF',
                        border: '1px solid #DCE4F2',
                        borderRadius: '14px',
                        padding: '8px 12px',
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2" />
                        <circle cx="7" cy="17" r="2" />
                        <path d="M9 17h6" />
                        <circle cx="17" cy="17" r="2" />
                      </svg>
                      <PlaceAutocompleteInput
                        placeholder="Ketik alamat atau cari tempat di Google Places..."
                        value={deliveryLoc}
                        onChange={setDeliveryLoc}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          fontSize: '13.5px',
                          color: '#0F172A',
                          outline: 'none',
                          width: '100%',
                          fontFamily: 'inherit',
                          fontWeight: 500,
                        }}
                      />
                      {/* Google Maps Button */}
                      <button
                        type="button"
                        onClick={() => setPickerTarget('delivery')}
                        title="Pilih Titik di Google Maps"
                        style={{
                          background: '#EEF3FF',
                          border: '1px solid #C7D7F5',
                          borderRadius: '8px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#142A59',
                          flexShrink: 0,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#142A59'
                          e.currentTarget.style.color = '#FFFFFF'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#EEF3FF'
                          e.currentTarget.style.color = '#142A59'
                        }}
                      >
                        <span>🗺️</span>
                        <span>Peta</span>
                      </button>
                      {/* GPS Button */}
                      <button
                        type="button"
                        onClick={() => handleQuickGps('delivery')}
                        title="Deteksi Lokasi GPS Saya"
                        disabled={gpsLocating !== null}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: gpsLocating === 'delivery' ? '#2463D9' : '#142A59',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: gpsLocating === 'delivery' ? 'spin 1s linear infinite' : 'none' }}>
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="3" />
                          <line x1="12" y1="2" x2="12" y2="5" />
                          <line x1="12" y1="19" x2="12" y2="22" />
                          <line x1="2" y1="12" x2="5" y2="12" />
                          <line x1="19" y1="12" x2="22" y2="12" />
                        </svg>
                      </button>
                    </div>

                    {/* Quick Map Action Chips */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setPickerTarget('delivery')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          background: '#FFFFFF',
                          border: '1px solid #2463D9',
                          borderRadius: '99px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#2463D9',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#2463D9'
                          e.currentTarget.style.color = '#FFFFFF'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#FFFFFF'
                          e.currentTarget.style.color = '#2463D9'
                        }}
                      >
                        <span>🗺️</span>
                        <span>Pilih di Google Maps</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickGps('delivery')}
                        disabled={gpsLocating !== null}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          background: '#FFFFFF',
                          border: '1px solid #059669',
                          borderRadius: '99px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#059669',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#059669'
                          e.currentTarget.style.color = '#FFFFFF'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#FFFFFF'
                          e.currentTarget.style.color = '#059669'
                        }}
                      >
                        <span>{gpsLocating === 'delivery' ? '📡' : '🎯'}</span>
                        <span>{gpsLocating === 'delivery' ? 'Mencari GPS...' : 'GPS Saya'}</span>
                      </button>
                    </div>

                    {/* Information panel */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '10px',
                        background: '#DDE8FC',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        color: '#2463D9',
                        fontWeight: 500,
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      <span>Lokasi antar akan digunakan untuk pengantaran kendaraan.</span>
                    </div>
                  </div>

                  {/* Location Swap Button on vertical dashed line */}
                  <div
                    style={{
                      position: 'relative',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '2px 0',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        bottom: '-8px',
                        width: '1px',
                        borderLeft: '2px dashed #CBD5E1',
                        zIndex: 1,
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSwapLocations}
                      title="Tukar Lokasi Antar dan Jemput"
                      style={{
                        position: 'relative',
                        zIndex: 2,
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#FFFFFF',
                        border: '1.5px solid #DCE4F2',
                        boxShadow: '0 4px 10px rgba(20, 42, 89, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#142A59',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#2463D9'
                        e.currentTarget.style.color = '#2463D9'
                        e.currentTarget.style.transform = 'scale(1.08)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#DCE4F2'
                        e.currentTarget.style.color = '#142A59'
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </button>
                  </div>

                  {/* Lokasi Jemput Card */}
                  <div
                    style={{
                      background: '#EEF3FF',
                      border: '1px solid #DCE4F2',
                      borderRadius: '18px',
                      padding: '16px',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#142A59">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#14213D' }}>
                          Lokasi Jemput
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, background: 'rgba(255,255,255,0.7)', padding: '2px 8px', borderRadius: '99px' }}>
                        📍 {pickupCoords.lat.toFixed(4)}, {pickupCoords.lng.toFixed(4)}
                      </span>
                    </div>

                    {/* Input box */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: '#FFFFFF',
                        border: '1px solid #DCE4F2',
                        borderRadius: '14px',
                        padding: '8px 12px',
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2" />
                        <circle cx="7" cy="17" r="2" />
                        <path d="M9 17h6" />
                        <circle cx="17" cy="17" r="2" />
                      </svg>
                      <PlaceAutocompleteInput
                        placeholder="Ketik alamat atau cari tempat di Google Places..."
                        value={pickupLoc}
                        onChange={setPickupLoc}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          fontSize: '13.5px',
                          color: '#0F172A',
                          outline: 'none',
                          width: '100%',
                          fontFamily: 'inherit',
                          fontWeight: 500,
                        }}
                      />
                      {/* Google Maps Button */}
                      <button
                        type="button"
                        onClick={() => setPickerTarget('pickup')}
                        title="Pilih Titik di Google Maps"
                        style={{
                          background: '#EEF3FF',
                          border: '1px solid #C7D7F5',
                          borderRadius: '8px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#142A59',
                          flexShrink: 0,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#142A59'
                          e.currentTarget.style.color = '#FFFFFF'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#EEF3FF'
                          e.currentTarget.style.color = '#142A59'
                        }}
                      >
                        <span>🗺️</span>
                        <span>Peta</span>
                      </button>
                      {/* GPS Button */}
                      <button
                        type="button"
                        onClick={() => handleQuickGps('pickup')}
                        title="Deteksi Lokasi GPS Saya"
                        disabled={gpsLocating !== null}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: gpsLocating === 'pickup' ? '#2463D9' : '#142A59',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: gpsLocating === 'pickup' ? 'spin 1s linear infinite' : 'none' }}>
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="3" />
                          <line x1="12" y1="2" x2="12" y2="5" />
                          <line x1="12" y1="19" x2="12" y2="22" />
                          <line x1="2" y1="12" x2="5" y2="12" />
                          <line x1="19" y1="12" x2="22" y2="12" />
                        </svg>
                      </button>
                    </div>

                    {/* Quick Map Action Chips */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setPickerTarget('pickup')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          background: '#FFFFFF',
                          border: '1px solid #2463D9',
                          borderRadius: '99px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#2463D9',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#2463D9'
                          e.currentTarget.style.color = '#FFFFFF'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#FFFFFF'
                          e.currentTarget.style.color = '#2463D9'
                        }}
                      >
                        <span>🗺️</span>
                        <span>Pilih di Google Maps</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickGps('pickup')}
                        disabled={gpsLocating !== null}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          background: '#FFFFFF',
                          border: '1px solid #059669',
                          borderRadius: '99px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#059669',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#059669'
                          e.currentTarget.style.color = '#FFFFFF'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#FFFFFF'
                          e.currentTarget.style.color = '#059669'
                        }}
                      >
                        <span>{gpsLocating === 'pickup' ? '📡' : '🎯'}</span>
                        <span>{gpsLocating === 'pickup' ? 'Mencari GPS...' : 'GPS Saya'}</span>
                      </button>
                    </div>

                    {/* Information panel */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '10px',
                        background: '#DDE8FC',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        color: '#2463D9',
                        fontWeight: 500,
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      <span>Lokasi jemput akan digunakan untuk penjemputan kendaraan.</span>
                    </div>
                  </div>
                </>
              ) : (
                /* Mode Langsung di Lokasi (Onsite): Tampilkan info Pool Mugarsari */
                <div
                  style={{
                    background: '#EEF3FF',
                    border: '1.5px solid #DCE4F2',
                    borderRadius: '18px',
                    padding: '16px 20px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: '#142A59',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      boxShadow: '0 4px 12px rgba(20, 42, 89, 0.2)',
                      flexShrink: 0,
                    }}
                  >
                    🏢
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#14213D' }}>
                      Pengambilan & Pengembalian: Langsung di Pool
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '3px', lineHeight: 1.4 }}>
                      Unit siap diambil dan dikembalikan langsung di <strong>Pool Viclerent Tasikmalaya</strong> (Mugarsari, Tamansari, Kampus 2 Universitas Siliwangi).
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Additional Services (Tambahan) */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#142A59',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 700,
                    }}
                  >
                    +
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#14213D' }}>
                    Tambahan
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '14px',
                  }}
                >
                  {/* Option 1: Asuransi Kendaraan */}
                  <div
                    onClick={() => setInsuranceChecked((prev) => !prev)}
                    style={{
                      background: '#FFFFFF',
                      border: insuranceChecked ? '1.5px solid #2463D9' : '1px solid #DCE4F2',
                      borderRadius: '16px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      boxShadow: insuranceChecked ? '0 4px 14px rgba(36, 99, 217, 0.12)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: '#EEF3FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2463D9',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#14213D' }}>
                        Asuransi Kendaraan
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                        Rp 50.000 / hari
                      </div>
                    </div>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        border: insuranceChecked ? 'none' : '1.5px solid #CBD5E1',
                        background: insuranceChecked ? '#2463D9' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 'auto',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {insuranceChecked && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Option 2: Driver Profesional */}
                  <div
                    onClick={() => setDriverChecked((prev) => !prev)}
                    style={{
                      background: '#FFFFFF',
                      border: driverChecked ? '1.5px solid #2463D9' : '1px solid #DCE4F2',
                      borderRadius: '16px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      boxShadow: driverChecked ? '0 4px 14px rgba(36, 99, 217, 0.12)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: '#EEF3FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2463D9',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#14213D' }}>
                        Driver Profesional
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                        Rp 100.000 / hari
                      </div>
                    </div>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        border: driverChecked ? 'none' : '1.5px solid #CBD5E1',
                        background: driverChecked ? '#2463D9' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 'auto',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {driverChecked && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                RIGHT COLUMN (~35% width) - Vehicle & Summary Panel
            ══════════════════════════════════════════════════════════ */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #DCE4F2',
                  borderRadius: '22px',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* 7. Vehicle Information Card */}
                <div
                  style={{
                    background: '#EEF3FF',
                    borderRadius: '16px',
                    height: '130px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px',
                    marginBottom: '14px',
                  }}
                >
                  <img
                    src={vehicle?.image || defaultVehicleImg}
                    alt={vehicle?.displayName || vehicle?.name || 'Toyota Fortuner'}
                    style={{
                      maxHeight: '110px',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 6px 14px rgba(20, 42, 89, 0.12))',
                    }}
                  />
                </div>

                <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                  <h3
                    style={{
                      fontSize: '17px',
                      fontWeight: 800,
                      color: '#142A59',
                      margin: '0 0 3px',
                      letterSpacing: '-0.2px',
                    }}
                  >
                    {vehicle?.displayName || vehicle?.name || 'Toyota Fortuner'}
                  </h3>
                  <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 500 }}>
                    {vehicle?.category || 'SUV'} • {vehicle?.seats || '7 Seats'}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: '#E2E8F0', width: '100%', marginBottom: '14px' }} />

                {/* Booking Summary Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
                  {/* Durasi Sewa */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#142A59', fontSize: '13px', fontWeight: 600 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>Durasi Sewa</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#14213D' }}>
                      {durationDays} Hari
                    </span>
                  </div>

                  {/* Detail Lokasi atau Metode Onsite */}
                  {deliveryMethod === 'delivery' ? (
                    <>
                      {/* Lokasi Antar */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#142A59', fontSize: '13px', fontWeight: 600, flexShrink: 0 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#142A59">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                          <span>Lokasi Antar</span>
                        </div>
                        <span
                          style={{
                            fontSize: '12px',
                            color: '#14213D',
                            textAlign: 'right',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {deliveryLoc}
                        </span>
                      </div>

                      {/* Lokasi Jemput */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#142A59', fontSize: '13px', fontWeight: 600, flexShrink: 0 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#142A59">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                          <span>Lokasi Jemput</span>
                        </div>
                        <span
                          style={{
                            fontSize: '12px',
                            color: '#14213D',
                            textAlign: 'right',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {pickupLoc}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#142A59', fontSize: '13px', fontWeight: 600, flexShrink: 0 }}>
                        <span>🏢</span>
                        <span>Titik Pengambilan</span>
                      </div>
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#14213D',
                          textAlign: 'right',
                          fontWeight: 600,
                        }}
                      >
                        Pool UNSIL (Mugarsari)
                      </span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: '#E2E8F0', width: '100%', marginBottom: '14px' }} />

                {/* Total Harga */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#14213D' }}>
                    Total Harga
                  </span>
                  <span style={{ fontSize: '19px', fontWeight: 800, color: '#142A59' }}>
                    Rp {totalDetailPrice.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* 8. Primary Action: Konfirmasi Pesanan Button */}
              <button
                type="button"
                onClick={handleConfirmDetail}
                style={{
                  width: '100%',
                  marginTop: '14px',
                  padding: '14px 20px',
                  background: '#142A59',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(20, 42, 89, 0.25)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1D3B7A'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#142A59'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <span>Konfirmasi Pesanan</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. POPUP PESANAN ANDA / KONFIRMASI PESANAN (Image 4)
      ───────────────────────────────────────────────────────────── */}
      {modalStep === 'order-summary' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '28px',
            width: '100%',
            maxWidth: '620px',
            padding: '36px 36px 32px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Back button */}
          <button
            onClick={() => setModalStep('order-detail')}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: '#f1f5f9',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
            }}
          >
            ←
          </button>

          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#5570a2',
              textAlign: 'center',
              marginBottom: '6px',
            }}
          >
            Pesanan Anda
          </h2>

          <div
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: '#0f172a',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              marginBottom: '12px',
            }}
          >
            {vehicle?.name || 'RANGE ROVER'}
          </div>

          {/* Vehicle photo in center */}
          <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <img
              src={vehicle?.image}
              alt={vehicle?.name}
              style={{ maxHeight: '100px', maxWidth: '280px', objectFit: 'contain' }}
            />
          </div>

          {/* Breakdown summary box */}
          <div
            style={{
              width: '100%',
              background: '#f1f3fa',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
              <span>Hari</span>
              <span style={{ fontWeight: 600 }}>{durationDays}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
              <span>Total Harga Sewa</span>
              <span style={{ fontWeight: 600 }}>Rp. {totalRentalPrice.toLocaleString('id-ID')}</span>
            </div>

            {deliveryMethod === 'delivery' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
                <span>Biaya Antar-Jemput</span>
                <span style={{ fontWeight: 600 }}>RP. 100.000</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
              <span>Biaya Layanan</span>
              <span style={{ fontWeight: 600 }}>Rp. 40.000</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
              <span>Diskon (20%)</span>
              <span style={{ fontWeight: 600, color: '#2563eb' }}>Rp. -160.000</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '10px' }}>
              <span>PPN (11%)</span>
              <span style={{ fontWeight: 600 }}>Rp. 80.000</span>
            </div>

            <div style={{ height: '1px', background: '#cbd5e1', marginBottom: '10px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
              <span>TOTAL</span>
              <span>Rp. {grandTotal.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Konfirmasi Pesanan Button */}
          <button
            onClick={handleConfirmSummary}
            style={{
              padding: '14px 44px',
              background: '#1B2D6B',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(27, 45, 107, 0.3)',
            }}
          >
            Konfirmasi Pesanan
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. POPUP METODE PEMBAYARAN (Image 5)
      ───────────────────────────────────────────────────────────── */}
      {modalStep === 'payment-method' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '28px',
            width: '100%',
            maxWidth: '620px',
            padding: '40px 36px 36px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Back button */}
          <button
            onClick={() => setModalStep('order-summary')}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: '#f1f5f9',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
            }}
          >
            ←
          </button>

          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#5570a2',
              marginBottom: '48px',
            }}
          >
            Metode Pembayaran
          </h2>

          {/* Center QRIS logo */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '140px', marginBottom: '48px' }}>
            <img
              src={qrisLogo}
              alt="QRIS"
              style={{ maxHeight: '90px', maxWidth: '240px', objectFit: 'contain' }}
            />
          </div>

          <button
            onClick={handleConfirmPaymentMethod}
            style={{
              padding: '14px 44px',
              background: '#1B2D6B',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(27, 45, 107, 0.3)',
            }}
          >
            Konfirmasi Metode
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. KODE QR PEMBAYARAN QRIS (Simulasi Scan)
      ───────────────────────────────────────────────────────────── */}
      {modalStep === 'payment-qr' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '28px',
            width: '100%',
            maxWidth: '560px',
            padding: '36px 32px 32px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Back button */}
          <button
            onClick={() => setModalStep('payment-method')}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: '#f1f5f9',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
            }}
          >
            ←
          </button>

          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#5570a2', marginBottom: '4px' }}>
            Scan Kode QRIS
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
            Buka aplikasi perbankan atau e-wallet Anda untuk memindai QR code berikut
          </p>

          {/* QR Code Graphic Box with Qrcodedummy.png */}
          <div
            onClick={() => setShowQrScannedLogo(true)}
            style={{
              width: '240px',
              height: '240px',
              margin: '0 auto 16px',
              background: '#ffffff',
              border: '2px solid #E2E8F0',
              borderRadius: '20px',
              padding: '12px',
              position: 'relative',
              boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
            }}
            title="Klik untuk mensimulasikan hasil scan"
          >
            <img
              src={qrCodeDummyImg}
              alt="QRIS VICLERENT"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '12px',
              }}
            />
          </div>

          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
            NMID: ID102003920199201
          </div>
          <div style={{ fontSize: '17px', fontWeight: 800, color: '#1B2D6B', marginBottom: '24px' }}>
            Total Pembayaran: Rp. {grandTotal.toLocaleString('id-ID')}
          </div>

          {/* Simulated scan info modal */}
          {showQrScannedLogo && (
            <div
              style={{
                padding: '12px',
                background: '#ecfdf5',
                border: '1px solid #6ee7b7',
                borderRadius: '12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#065f46',
                fontWeight: 600,
              }}
            >
              <img src={logo} alt="Viclerent" style={{ width: '22px', height: '22px' }} />
              QR Berhasil Dipindai: Merchant VICLERENT Verified ✅
            </div>
          )}

          {/* Action to complete simulation */}
          <button
            onClick={handleCompletePayment}
            style={{
              padding: '14px 40px',
              background: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(5, 150, 105, 0.35)',
              transition: 'all 0.2s',
            }}
          >
            Simulasi Bayar Berhasil ✓
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. POPUP PEMBAYARAN BERHASIL (Image 6)
      ───────────────────────────────────────────────────────────── */}
      {modalStep === 'payment-success' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '28px',
            width: '100%',
            maxWidth: '620px',
            padding: '48px 36px 40px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Green Title */}
          <h2
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: '#5cb350',
              marginBottom: '32px',
              letterSpacing: '-0.3px',
            }}
          >
            Pembayaran Berhasil
          </h2>

          {/* Description text */}
          <p
            style={{
              fontSize: '15px',
              color: '#475569',
              lineHeight: 1.6,
              maxWidth: '440px',
              margin: '0 auto 40px',
            }}
          >
            {deliveryMethod === 'delivery'
              ? 'Pembayaran Anda Berhasil dilakukan dan mobil Anda sedang dalam perjalanan'
              : 'Pembayaran Anda Berhasil dilakukan dan mobil Anda siap diambil di lokasi'}
          </p>

          {/* Link: Lihat Struk Pembayaran */}
          <div style={{ marginBottom: '28px' }}>
            <button
              onClick={() => setModalStep('receipt')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Lihat Struk Pembayaran
            </button>
          </div>

          {/* Buttons depending on deliveryMethod */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            {deliveryMethod === 'delivery' && (
              <button
                onClick={() => setModalStep('tracking')}
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  padding: '13px 24px',
                  background: '#ffffff',
                  color: '#1B2D6B',
                  border: '1.5px solid #1B2D6B',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f4ff')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
              >
                LACAK
              </button>
            )}

            <button
              onClick={handleGoHome}
              style={{
                width: '100%',
                maxWidth: '300px',
                padding: '13px 24px',
                background: '#1B2D6B',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(27, 45, 107, 0.3)',
              }}
            >
              KEMBALI KE BERANDA
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. STRUK PEMBAYARAN (E-Receipt Digital Modal)
      ───────────────────────────────────────────────────────────── */}
      {modalStep === 'receipt' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '28px',
            width: '100%',
            maxWidth: '520px',
            padding: '36px 32px 30px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src={logo} alt="Viclerent" style={{ width: '32px', height: '32px' }} />
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#1B2D6B' }}>VICLERENT RECEIPT</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '99px' }}>
              LUNAS
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', border: '1.5px dashed #cbd5e1', borderRadius: '16px', padding: '20px', background: '#f8fafc', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>KODE BOOKING</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '1px' }}>
                VICLE-2025-9942
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                {RECEIPT_TIMESTAMP}
              </div>
            </div>

            <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Unit Kendaraan:</span>
                <span style={{ fontWeight: 700 }}>{vehicle?.displayName || vehicle?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Metode Serah Terima:</span>
                <span style={{ fontWeight: 700 }}>{deliveryMethod === 'delivery' ? 'Antar-Jemput' : 'Langsung di Lokasi'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tanggal Sewa:</span>
                <span>{formatDateDisplay(startDate)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tanggal Berakhir:</span>
                <span>{formatDateDisplay(endDate)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Durasi:</span>
                <span>{durationDays} Hari</span>
              </div>
              <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Metode Pembayaran:</span>
                <span style={{ fontWeight: 700 }}>QRIS (Settled)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800, color: '#1B2D6B', marginTop: '6px' }}>
                <span>Total Dibayar:</span>
                <span>Rp. {grandTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setModalStep('payment-success')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '99px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Tutup Struk
            </button>
            <button
              onClick={() => window.print()}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '99px',
                border: 'none',
                background: '#1B2D6B',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cetak / Unduh PDF
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          8. LIVE TRACKING GPS SIMULATION (Phase 5 Live View)
      ───────────────────────────────────────────────────────────── */}
      {modalStep === 'tracking' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '28px',
            width: '100%',
            maxWidth: '720px',
            padding: '32px 30px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
            maxHeight: '94vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                ● LIVE GPS TRACKING
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                Pelacakan Unit Antar-Jemput
              </h3>
            </div>
            <button
              onClick={() => setModalStep('payment-success')}
              style={{
                border: 'none',
                background: '#f1f5f9',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          {/* Interactive Google Maps & Vector Fallback Tracking */}
          <GoogleMapTracking deliveryLoc={deliveryLoc} deliveryCoords={deliveryCoords} vehicle={vehicle} />

          <button
            onClick={handleGoHome}
            style={{
              padding: '14px',
              background: '#1B2D6B',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Kembali ke Beranda
          </button>
        </div>
      )}

      {/* Location Pinpoint Map Picker Modal */}
      <LocationPickerModal
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        title={pickerTarget === 'delivery' ? 'Pilih Titik Lokasi Pengantaran' : 'Pilih Titik Lokasi Penjemputan'}
        initialAddress={pickerTarget === 'delivery' ? deliveryLoc : pickupLoc}
        initialCoords={pickerTarget === 'delivery' ? deliveryCoords : pickupCoords}
        onSelectLocation={(addr, coords) => {
          if (pickerTarget === 'delivery') {
            setDeliveryLoc(addr)
            setDeliveryCoords(coords)
          } else {
            setPickupLoc(addr)
            setPickupCoords(coords)
          }
          setPickerTarget(null)
        }}
      />

      {/* GPS Permission / Guidance Alert Modal */}
      {gpsNoticeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 1100,
          }}
          onClick={() => setGpsNoticeModal(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px 26px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              position: 'relative',
              animation: 'modalSlideUp 0.25s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: '#EEF3FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0,
                }}
              >
                🛰️
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#142A59', margin: 0 }}>
                {gpsNoticeModal.title}
              </h3>
            </div>

            <p
              style={{
                fontSize: '13px',
                color: '#334155',
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
                marginBottom: '20px',
              }}
            >
              {gpsNoticeModal.message}
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  const target = gpsNoticeModal.target || 'delivery'
                  setGpsNoticeModal(null)
                  setPickerTarget(target)
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '99px',
                  border: '1.5px solid #2463D9',
                  background: '#FFFFFF',
                  color: '#2463D9',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>🗺️</span>
                <span>Pilih di Google Maps</span>
              </button>

              <button
                type="button"
                onClick={() => setGpsNoticeModal(null)}
                style={{
                  padding: '10px 22px',
                  borderRadius: '99px',
                  border: 'none',
                  background: '#142A59',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

