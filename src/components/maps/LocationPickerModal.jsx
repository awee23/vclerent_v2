import { useState, useEffect, useRef } from 'react'
import { loadGoogleMaps } from '../../utils/googleMapsLoader'

// Preset Area Tasikmalaya / Sekitarnya
const PRESETS = [
  { name: '🏢 Pool Viclerent (Kampus 2 UNSIL Mugarsari)', lat: -7.3685, lng: 108.2328 },
  { name: 'Jl. HZ Mustofa (Pusat Kota)', lat: -7.3274, lng: 108.2207 },
  { name: 'Stasiun Tasikmalaya', lat: -7.3233, lng: 108.2248 },
  { name: 'Alun-Alun Tasikmalaya', lat: -7.3262, lng: 108.2215 },
  { name: 'Bandara Wiriadinata', lat: -7.3475, lng: 108.2461 },
  { name: 'Hotel Santika Tasikmalaya', lat: -7.3245, lng: 108.2198 },
]

export default function LocationPickerModal({
  isOpen,
  onClose,
  title = 'Pilih Titik Lokasi di Peta',
  initialAddress = '',
  initialCoords = { lat: -7.3274, lng: 108.2207 },
  onSelectLocation,
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerInstanceRef = useRef(null)

  const [currentCoords, setCurrentCoords] = useState(initialCoords)
  const [addressInput, setAddressInput] = useState(initialAddress || 'Jl. HZ Mustofa, Tasikmalaya')
  const [isGpsLoading, setIsGpsLoading] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

  // Helper reverse geocoding
  const updateAddressFromCoords = async (coords, google) => {
    if (google?.maps?.Geocoder) {
      try {
        const geocoder = new google.maps.Geocoder()
        geocoder.geocode({ location: coords }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            setAddressInput(results[0].formatted_address)
          } else {
            fallbackNominatim(coords)
          }
        })
        return
      } catch (e) {
        console.warn('Google geocoder error:', e)
      }
    }
    fallbackNominatim(coords)
  }

  const fallbackNominatim = async (coords) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`)
      if (res.ok) {
        const data = await res.json()
        if (data && data.display_name) {
          const parts = data.display_name.split(', ')
          setAddressInput(parts.slice(0, 4).join(', '))
          return
        }
      }
    } catch (e) {
      console.warn('Nominatim reverse error:', e)
    }
    setAddressInput(`Koordinat: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`)
  }

  // Initialize or update Map
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true

    loadGoogleMaps(apiKey, ['places', 'geocoding'])
      .then((google) => {
        if (!isMounted || !mapContainerRef.current) return

        try {
          const map = new google.maps.Map(mapContainerRef.current, {
            center: currentCoords,
            zoom: 15,
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
          })
          mapInstanceRef.current = map

          // Draggable Marker
          const marker = new google.maps.Marker({
            position: currentCoords,
            map: map,
            draggable: true,
            title: 'Geser marker untuk memilih lokasi',
            animation: google.maps.Animation.DROP,
          })
          markerInstanceRef.current = marker

          // Listener marker drag end
          marker.addListener('dragend', () => {
            const pos = marker.getPosition()
            if (pos) {
              const newLat = pos.lat()
              const newLng = pos.lng()
              const newCoords = { lat: newLat, lng: newLng }
              setCurrentCoords(newCoords)
              updateAddressFromCoords(newCoords, google)
            }
          })

          // Listener click on map
          map.addListener('click', (e) => {
            if (e.latLng) {
              marker.setPosition(e.latLng)
              const newCoords = { lat: e.latLng.lat(), lng: e.latLng.lng() }
              setCurrentCoords(newCoords)
              updateAddressFromCoords(newCoords, google)
            }
          })

          setMapLoaded(true)
        } catch (err) {
          console.warn('Map picker init error:', err)
          setMapLoaded(false)
        }
      })
      .catch((err) => {
        console.warn('Map picker load error:', err)
        setMapLoaded(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, apiKey, currentCoords])

  // Handle GPS Current Location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung deteksi lokasi GPS.')
      return
    }

    setIsGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsGpsLoading(false)
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setCurrentCoords(coords)

        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.setCenter(coords)
          mapInstanceRef.current.setZoom(16)
          markerInstanceRef.current.setPosition(coords)
        }

        updateAddressFromCoords(coords, window.google)
      },
      (err) => {
        setIsGpsLoading(false)
        console.warn('GPS error:', err)
        let msg = 'Gagal mendeteksi lokasi GPS.'
        if (err.code === 1) {
          msg = 'Izin akses GPS/lokasi ditolak oleh browser/perangkat Anda. Silakan klik ikon gembok/izin di address bar browser Anda untuk "Izinkan Lokasi" (Allow Location), lalu coba lagi.'
        } else if (err.code === 2) {
          msg = 'Sinyal GPS tidak tersedia saat ini. Pastikan layanan lokasi pada perangkat (HP/Laptop) telah diaktifkan.'
        } else if (err.code === 3) {
          msg = 'Waktu pencarian GPS habis (timeout). Silakan coba lagi atau pilih lokasi langsung di peta.'
        }
        alert(msg)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  // Handle Preset Selection
  const handleSelectPreset = (preset) => {
    const coords = { lat: preset.lat, lng: preset.lng }
    setCurrentCoords(coords)
    setAddressInput(preset.name)

    if (mapInstanceRef.current && markerInstanceRef.current) {
      mapInstanceRef.current.setCenter(coords)
      mapInstanceRef.current.setZoom(16)
      markerInstanceRef.current.setPosition(coords)
    }
  }

  // Handle Input text change (Check if user entered coordinates: "-7.3274, 108.2207")
  const handleAddressInputChange = (val) => {
    setAddressInput(val)
    const coordMatch = val.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/)
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1])
      const lng = parseFloat(coordMatch[3])
      const coords = { lat, lng }
      setCurrentCoords(coords)
      if (mapInstanceRef.current && markerInstanceRef.current) {
        mapInstanceRef.current.setCenter(coords)
        markerInstanceRef.current.setPosition(coords)
      }
    }
  }

  const handleConfirm = () => {
    onSelectLocation(addressInput, currentCoords)
    onClose()
  }

  if (!isOpen) return null

  return (
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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '640px',
          padding: '24px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#3b82f6', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
              PINPOINT LOCATION
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#f1f5f9',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        {/* Input Bar & GPS Button */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '14px',
            }}
          >
            <span style={{ fontSize: '16px' }}>📍</span>
            <input
              type="text"
              value={addressInput}
              onChange={(e) => handleAddressInputChange(e.target.value)}
              placeholder="Ketik alamat atau koordinat (lat, lng)..."
              style={{
                border: 'none',
                background: 'transparent',
                width: '100%',
                fontSize: '13px',
                color: '#0f172a',
                outline: 'none',
                fontWeight: 600,
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isGpsLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              background: '#1B2D6B',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: isGpsLoading ? 'wait' : 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(27, 45, 107, 0.25)',
            }}
          >
            {isGpsLoading ? '📡 Mencari...' : '🎯 GPS Saya'}
          </button>
        </div>

        {/* Preset chips */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '10px' }}>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(p)}
              style={{
                padding: '5px 12px',
                borderRadius: '99px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                fontSize: '11px',
                fontWeight: 600,
                color: '#334155',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Map Container */}
        <div
          style={{
            height: '270px',
            borderRadius: '16px',
            border: '1.5px solid #cbd5e1',
            overflow: 'hidden',
            position: 'relative',
            marginBottom: '16px',
            background: '#e2e8f0',
          }}
        >
          {/* Map canvas */}
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

          {/* Interactive Fallback Pin if Google Maps is not ready */}
          {!mapLoaded && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, #f8fafc 10%, #e2e8f0 90%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'crosshair',
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = (e.clientX - rect.left) / rect.width
                const y = (e.clientY - rect.top) / rect.height
                // Simulate coordinate offset around Tasikmalaya
                const lat = -7.3274 + (y - 0.5) * 0.04
                const lng = 108.2207 + (x - 0.5) * 0.04
                const coords = { lat, lng }
                setCurrentCoords(coords)
                setAddressInput(`Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}`)
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '4px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
                📍
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1B2D6B' }}>
                Klik pada area untuk menentukan titik lokasi
              </span>
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                Koordinat Terpilih: {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
              </span>
            </div>
          )}
        </div>

        {/* Selected Coordinates Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '8px 14px',
            marginBottom: '18px',
          }}
        >
          <div style={{ fontSize: '11.5px', color: '#64748b' }}>
            <strong style={{ color: '#0f172a' }}>Koordinat:</strong> {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
          </div>
          <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '99px' }}>
            Siap Digunakan ✓
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '99px',
              border: '1.5px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            style={{
              flex: 2,
              padding: '12px',
              borderRadius: '99px',
              border: 'none',
              background: '#1B2D6B',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(27, 45, 107, 0.3)',
            }}
          >
            Gunakan Lokasi Ini
          </button>
        </div>
      </div>
    </div>
  )
}
