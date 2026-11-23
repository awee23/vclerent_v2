import { useEffect, useRef, useState, useCallback } from 'react'
import { loadGoogleMaps } from '../../utils/googleMapsLoader'

// Import Icon GPS Realistis (Mobil & Motor) dari folder assets
import carGpsIcon from '../../assets/icons/gps_icon/cargps_icon.png'
import motorGpsIcon from '../../assets/icons/gps_icon/motorgps_icon.png'

// Alamat Pool Tetap: Mugarsari, Tamansari, Kota Tasikmalaya (Vclerent)
const DEFAULT_POOL = {
  lat: -7.3685,
  lng: 108.2328,
  title: 'Pool Viclerent (Vclrerent company)',
  address: 'Mugarsari, Tamansari, Kota Tasikmalaya, Jawa Barat 46196 (Kampus 2 Universitas Siliwangi)',
}

const DEFAULT_DESTINATION = {
  lat: -7.3235,
  lng: 108.2255,
  title: 'Lokasi Pengantaran',
  address: 'Jl. HZ Mustofa No. 217, Tasikmalaya',
}

// Helper: Calculate bearing / heading between two LatLng coordinates
function computeHeading(p1, p2) {
  if (!p1 || !p2) return 0
  const lat1 = (p1.lat * Math.PI) / 180
  const lat2 = (p2.lat * Math.PI) / 180
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  const brng = (Math.atan2(y, x) * 180) / Math.PI
  return (brng + 360) % 360
}

export default function GoogleMapTracking({ deliveryLoc, deliveryCoords, vehicle }) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const vehicleOverlayRef = useRef(null)
  const basePolylineRef = useRef(null)
  const traveledPolylineRef = useRef(null)
  const animFrameRef = useRef(null)
  const routePointsRef = useRef([])

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  const hasValidKey = apiKey && apiKey !== 'your_google_maps_api_key_here'

  const destination = deliveryCoords || DEFAULT_DESTINATION

  // Detect vehicle type: Motor vs Mobil
  const isMotor =
    vehicle?.type === 'motor' ||
    vehicle?.type === 'motorcycle' ||
    vehicle?.category?.toLowerCase().includes('motor') ||
    vehicle?.category?.toLowerCase().includes('matic') ||
    vehicle?.name?.toLowerCase().includes('beat') ||
    vehicle?.name?.toLowerCase().includes('vario')

  const vehicleTypeName = isMotor ? 'Motor' : 'Mobil'
  const activeGpsIcon = isMotor ? motorGpsIcon : carGpsIcon

  const [viewMode, setViewMode] = useState('auto') // 'auto' | 'vector'
  const [mapStatus, setMapStatus] = useState(() => (hasValidKey ? 'loading' : 'fallback'))
  const [etaInfo, setEtaInfo] = useState({ distance: '~6.8 km', duration: '~18 Menit' })

  // Simulation animation states
  const [isPlaying, setIsPlaying] = useState(true)
  const [animProgress, setAnimProgress] = useState(0.04) // 0 to 1
  const [playbackSpeed, setPlaybackSpeed] = useState(2) // 1x, 2x, 4x, 8x
  const [vehicleHeading, setVehicleHeading] = useState(35)
  const [currentCoords, setCurrentCoords] = useState(DEFAULT_POOL)
  const [driverStage, setDriverStage] = useState(`Driver ${vehicleTypeName} bersiap di Pool UNSIL Mugarsari`)

  // Fallback realistic road coordinates through Tasikmalaya
  const generateFallbackPoints = useCallback(() => {
    const start = DEFAULT_POOL
    const end = destination
    const points = []
    const count = 120
    for (let i = 0; i <= count; i++) {
      const t = i / count
      // Smooth spline mimicking Tamansari to HZ Mustofa road network
      const lat = start.lat + (end.lat - start.lat) * t + Math.sin(t * Math.PI) * 0.007
      const lng = start.lng + (end.lng - start.lng) * t - Math.sin(t * Math.PI) * 0.005
      points.push({ lat, lng })
    }
    return points
  }, [destination])

  // Get point and heading along route points
  const getInterpolatedPoint = useCallback((points, t) => {
    if (!points || points.length === 0) return { pos: DEFAULT_POOL, heading: 0, index: 0 }
    if (points.length === 1) return { pos: points[0], heading: 0, index: 0 }
    if (t <= 0) return { pos: points[0], heading: computeHeading(points[0], points[1]), index: 0 }
    if (t >= 1) {
      const last = points[points.length - 1]
      const prev = points[points.length - 2]
      return { pos: last, heading: computeHeading(prev, last), index: points.length - 1 }
    }

    const floatIndex = t * (points.length - 1)
    const index = Math.floor(floatIndex)
    const frac = floatIndex - index

    const p1 = points[index]
    const p2 = points[Math.min(index + 1, points.length - 1)]

    const lat = p1.lat + (p2.lat - p1.lat) * frac
    const lng = p1.lng + (p2.lng - p1.lng) * frac
    const heading = computeHeading(p1, p2)

    return { pos: { lat, lng }, heading, index }
  }, [])

  // Initialize Google Maps with Directions & Polylines
  useEffect(() => {
    if (!hasValidKey || viewMode === 'vector') {
      routePointsRef.current = generateFallbackPoints()
      setMapStatus('fallback')
      return
    }

    let isMounted = true

    loadGoogleMaps(apiKey, ['places', 'routes'])
      .then((google) => {
        if (!isMounted || !mapContainerRef.current) return

        try {
          const centerLat = (DEFAULT_POOL.lat + destination.lat) / 2
          const centerLng = (DEFAULT_POOL.lng + destination.lng) / 2

          const map = new google.maps.Map(mapContainerRef.current, {
            center: { lat: centerLat, lng: centerLng },
            zoom: 13,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          })
          mapInstanceRef.current = map

          // 1. Marker Pool Viclerent (Mugarsari - Kampus 2 UNSIL)
          new google.maps.Marker({
            position: DEFAULT_POOL,
            map: map,
            title: DEFAULT_POOL.title,
            label: {
              text: '🏢 Pool UNSIL',
              color: '#142A59',
              fontSize: '11px',
              fontWeight: '800',
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#142A59',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          })

          // 2. Marker Destination
          new google.maps.Marker({
            position: destination,
            map: map,
            title: `Lokasi Antar: ${deliveryLoc || 'Tujuan Pengguna'}`,
            label: {
              text: '📍 Titik Antar',
              color: '#059669',
              fontSize: '11px',
              fontWeight: '800',
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: '#059669',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          })

          // 3. Real Directions Request
          if (google.maps.DirectionsService) {
            const directionsService = new google.maps.DirectionsService()

            directionsService.route(
              {
                origin: DEFAULT_POOL,
                destination: destination,
                travelMode: google.maps.TravelMode.DRIVING,
              },
              (result, status) => {
                if (status === google.maps.DirectionsStatus.OK && result) {
                  const route = result.routes[0]
                  const leg = route?.legs[0]
                  if (leg) {
                    setEtaInfo({
                      distance: leg.distance?.text || '6.8 km',
                      duration: leg.duration?.text || '18 menit',
                    })
                  }

                  // Extract exact step-by-step street road points
                  let detailedPath = []
                  if (leg?.steps && leg.steps.length > 0) {
                    leg.steps.forEach((step) => {
                      if (step.path) {
                        step.path.forEach((pt) => {
                          detailedPath.push({ lat: pt.lat(), lng: pt.lng() })
                        })
                      }
                    })
                  }

                  if (detailedPath.length === 0 && route.overview_path) {
                    detailedPath = route.overview_path.map((pt) => ({
                      lat: pt.lat(),
                      lng: pt.lng(),
                    }))
                  }

                  routePointsRef.current = detailedPath.length > 0 ? detailedPath : generateFallbackPoints()

                  // ── Indikator Rute Awal sampai Akhir (Base Polyline) ──
                  const gPath = routePointsRef.current.map((pt) => new google.maps.LatLng(pt.lat, pt.lng))

                  basePolylineRef.current = new google.maps.Polyline({
                    path: gPath,
                    map: map,
                    strokeColor: '#94A3B8',
                    strokeOpacity: 0.65,
                    strokeWeight: 6,
                  })

                  // ── Indikator Jalur yang Sedang / Telah Dilalui (Traveled Trail) ──
                  traveledPolylineRef.current = new google.maps.Polyline({
                    path: [gPath[0]],
                    map: map,
                    strokeColor: '#2463D9',
                    strokeOpacity: 0.95,
                    strokeWeight: 6,
                  })
                } else {
                  console.warn('DirectionsService failed:', status)
                  routePointsRef.current = generateFallbackPoints()
                }

                // 4. Create Moving Vehicle Overlay using cargps_icon.png / motorgps_icon.png
                const initialPt = routePointsRef.current[0] || DEFAULT_POOL

                class VehicleOverlay extends google.maps.OverlayView {
                  constructor(initialPos, iconSrc, initHeading, labelText, isMotorcycle) {
                    super()
                    this.pos = initialPos
                    this.iconSrc = iconSrc
                    this.heading = initHeading
                    this.labelText = labelText
                    this.isMotorcycle = isMotorcycle
                    this.div = null
                  }

                  onAdd() {
                    const div = document.createElement('div')
                    div.style.position = 'absolute'
                    div.style.zIndex = '9999'
                    div.style.cursor = 'pointer'
                    div.style.pointerEvents = 'none'

                    const width = this.isMotorcycle ? 36 : 44
                    const height = this.isMotorcycle ? 62 : 58

                    div.innerHTML = `
                      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
                        <div id="vcl-overlay-badge" style="background:#142A59; color:#FFFFFF; font-size:10px; font-weight:800; padding:2px 8px; border-radius:99px; white-space:nowrap; margin-bottom:5px; box-shadow:0 3px 10px rgba(0,0,0,0.35); border:1.5px solid rgba(255,255,255,0.6);">
                          ${this.labelText}
                        </div>
                        <img id="vcl-overlay-img" src="${this.iconSrc}" alt="GPS Vehicle" style="width:${width}px; height:${height}px; object-fit:contain; transform: rotate(${this.heading}deg); filter: drop-shadow(0 6px 14px rgba(0,0,0,0.5)); transition: transform 0.15s ease-out;" />
                      </div>
                    `
                    this.div = div
                    const panes = this.getPanes()
                    panes.overlayMouseTarget.appendChild(div)
                  }

                  draw() {
                    const projection = this.getProjection()
                    if (!projection || !this.div) return
                    const pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(this.pos.lat, this.pos.lng))
                    if (pixel) {
                      this.div.style.left = `${pixel.x}px`
                      this.div.style.top = `${pixel.y}px`
                    }
                  }

                  update(newPos, newHeading, newLabel) {
                    this.pos = newPos
                    this.heading = newHeading
                    if (this.div) {
                      const img = this.div.querySelector('#vcl-overlay-img')
                      const badge = this.div.querySelector('#vcl-overlay-badge')
                      if (img) img.style.transform = `rotate(${newHeading}deg)`
                      if (badge && newLabel) badge.innerText = newLabel
                      this.draw()
                    }
                  }

                  onRemove() {
                    if (this.div && this.div.parentNode) {
                      this.div.parentNode.removeChild(this.div)
                      this.div = null
                    }
                  }
                }

                if (vehicleOverlayRef.current) {
                  vehicleOverlayRef.current.setMap(null)
                }

                const overlay = new VehicleOverlay(
                  initialPt,
                  activeGpsIcon,
                  35,
                  `${isMotor ? '🛵' : '🚗'} ${vehicle?.displayName || vehicleTypeName}`,
                  isMotor
                )
                overlay.setMap(map)
                vehicleOverlayRef.current = overlay
              }
            )
          }

          setMapStatus('ready')
        } catch (err) {
          console.warn('Map initialization error:', err)
          routePointsRef.current = generateFallbackPoints()
          setMapStatus('fallback')
        }
      })
      .catch((err) => {
        console.warn('Google Maps load error:', err)
        routePointsRef.current = generateFallbackPoints()
        setMapStatus('fallback')
      })

    return () => {
      isMounted = false
      if (vehicleOverlayRef.current) {
        vehicleOverlayRef.current.setMap(null)
        vehicleOverlayRef.current = null
      }
    }
  }, [apiKey, hasValidKey, deliveryLoc, destination, vehicle, viewMode, generateFallbackPoints, isMotor, activeGpsIcon, vehicleTypeName])

  // Animation Loop (Drives vehicle smoothly along the route)
  useEffect(() => {
    let lastTime = performance.now()

    const stepAnimation = (time) => {
      const delta = (time - lastTime) / 1000
      lastTime = time

      if (isPlaying) {
        setAnimProgress((prev) => {
          const speedFactor = (0.028 * playbackSpeed) * delta
          const next = prev + speedFactor
          if (next >= 1) return 1
          return next
        })
      }

      animFrameRef.current = requestAnimationFrame(stepAnimation)
    }

    animFrameRef.current = requestAnimationFrame(stepAnimation)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isPlaying, playbackSpeed])

  // Update vehicle position, heading, traveled polyline, ETA, and narrative
  useEffect(() => {
    const points = routePointsRef.current.length > 0 ? routePointsRef.current : generateFallbackPoints()
    const { pos, heading, index } = getInterpolatedPoint(points, animProgress)

    setCurrentCoords(pos)
    setVehicleHeading(heading)

    // Update real Google Map custom overlay & polyline
    if (vehicleOverlayRef.current) {
      const labelText =
        animProgress >= 1
          ? `✅ ${vehicleTypeName} Telah Tiba!`
          : `${isMotor ? '🛵' : '🚗'} ${vehicle?.displayName || vehicleTypeName} (${Math.round(animProgress * 100)}%)`

      vehicleOverlayRef.current.update(pos, heading, labelText)

      // Update traveled polyline trail on road
      if (traveledPolylineRef.current && window.google) {
        const sliced = points.slice(0, index + 1).map((pt) => new window.google.maps.LatLng(pt.lat, pt.lng))
        sliced.push(new window.google.maps.LatLng(pos.lat, pos.lng))
        traveledPolylineRef.current.setPath(sliced)
      }
    }

    // Dynamic stage narrative
    if (animProgress <= 0.08) {
      setDriverStage(`🏢 Driver ${vehicleTypeName} bersiap dan berangkat dari Pool Mugarsari (UNSIL)`)
    } else if (animProgress < 0.4) {
      setDriverStage(`🛣️ Driver melaju di rute Tamansari mengikuti jalur navigasi maps`)
    } else if (animProgress < 0.75) {
      setDriverStage(`🚗 Melewati jalur jalan utama menuju alamat pengantaran Anda`)
    } else if (animProgress < 0.96) {
      setDriverStage(`📍 Driver mendekati titik lokasi pengantaran (±200 meter)`)
    } else {
      setDriverStage(`🎉 ${vehicleTypeName} telah tiba di lokasi Anda! Siap serah terima unit.`)
    }
  }, [animProgress, getInterpolatedPoint, generateFallbackPoints, isMotor, activeGpsIcon, vehicleTypeName, vehicle])

  // Dynamic remaining metrics
  const remainingPercent = Math.max(0, 1 - animProgress)
  const dynamicDistanceKm = (6.8 * remainingPercent).toFixed(1)
  const dynamicMinutes = Math.max(1, Math.round(18 * remainingPercent))

  return (
    <div>
      {/* ── Status Header Bar & View Switcher ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: animProgress >= 1 ? '#059669' : '#2463D9',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: animProgress >= 1 ? '#10B981' : '#2463D9',
                display: 'inline-block',
                boxShadow: animProgress >= 1 ? '0 0 8px #10B981' : '0 0 8px #2463D9',
                animation: isPlaying && animProgress < 1 ? 'pulse-dot 1.5s infinite' : 'none',
              }}
            />
            {mapStatus === 'ready' ? `Live GPS (${vehicleTypeName})` : `Simulasi Rute (${vehicleTypeName})`}
          </span>

          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              background: '#EEF3FF',
              color: '#142A59',
              padding: '2px 8px',
              borderRadius: '99px',
            }}
          >
            {Math.round(animProgress * 100)}% Selesai
          </span>
        </div>

        {/* Mode Switcher */}
        <button
          type="button"
          onClick={() => {
            if (viewMode === 'vector') {
              setViewMode('auto')
              setMapStatus('loading')
            } else {
              setViewMode('vector')
              setMapStatus('fallback')
            }
          }}
          style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '5px 12px',
            borderRadius: '99px',
            border: '1px solid #CBD5E1',
            background: '#ffffff',
            color: '#142A59',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {viewMode === 'vector' ? '🗺️ Buka Google Maps Asli' : '🛣️ Mode Peta Interaktif'}
        </button>
      </div>

      {/* ── Map Container ── */}
      <div
        style={{
          height: '310px',
          borderRadius: '20px',
          background: '#0B132B',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '14px',
          border: '1.5px solid #CBD5E1',
          boxShadow: '0 6px 20px rgba(20, 42, 89, 0.12)',
        }}
      >
        {/* Loading Spinner */}
        {mapStatus === 'loading' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8fafc',
              zIndex: 3,
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                border: '3px solid #e2e8f0',
                borderTopColor: '#142A59',
                borderRadius: '50%',
                animation: 'spin 0.9s linear infinite',
                marginBottom: '8px',
              }}
            />
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              Menghitung rute navigasi Google Maps jalan raya...
            </span>
          </div>
        )}

        {/* Real Google Maps DIV */}
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '100%',
            display: mapStatus === 'ready' ? 'block' : 'none',
          }}
        />

        {/* Fallback Vector Map (Visualizing True Route Line & Custom Vehicle Icon) */}
        {mapStatus === 'fallback' && (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: '#0f172a',
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '36px 36px',
              position: 'relative',
            }}
          >
            {/* SVG Roads & Polyline */}
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2463D9" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
              {/* Indikator Rute Awal sampai Akhir (Base Polyline) */}
              <path
                d="M 60 250 C 180 230, 260 160, 400 150 S 550 90, 640 70"
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Indikator Garis Perjalanan Aktif (Traveled Path) */}
              <path
                d="M 60 250 C 180 230, 260 160, 400 150 S 550 90, 640 70"
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="700"
                strokeDashoffset={`${700 * (1 - animProgress)}`}
                style={{ transition: 'stroke-dashoffset 0.1s linear' }}
              />
            </svg>

            {/* 1. Pool Viclerent Marker (Kampus 2 UNSIL Mugarsari) */}
            <div
              style={{
                position: 'absolute',
                left: '42px',
                bottom: '36px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  background: '#142A59',
                  border: '1.5px solid #ffffff',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                  marginBottom: '4px',
                }}
              >
                🏢 Pool UNSIL (Mugarsari)
              </div>
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: '#2463D9',
                  border: '2px solid #ffffff',
                  boxShadow: '0 0 10px #2463D9',
                }}
              />
            </div>

            {/* 2. Destination Marker */}
            <div
              style={{
                position: 'absolute',
                right: '48px',
                top: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  background: '#059669',
                  border: '1.5px solid #ffffff',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                  marginBottom: '4px',
                }}
              >
                📍 {deliveryLoc ? deliveryLoc.slice(0, 24) + '...' : 'Lokasi Pengantaran'}
              </div>
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: '#10B981',
                  border: '2px solid #ffffff',
                  boxShadow: '0 0 10px #10B981',
                }}
              />
            </div>

            {/* 3. Moving Vehicle Marker (Specific Car / Motorcycle PNG Image) */}
            {(() => {
              const t = animProgress
              const x = 60 + (640 - 60) * t
              const y = 250 - 240 * Math.sin((t * Math.PI) / 2) + 20 * Math.sin(t * Math.PI * 2)

              return (
                <div
                  style={{
                    position: 'absolute',
                    left: `${x}px`,
                    top: `${y}px`,
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 4,
                    transition: 'all 0.1s linear',
                  }}
                >
                  <div
                    style={{
                      background: animProgress >= 1 ? '#059669' : (isMotor ? '#2563EB' : '#142A59'),
                      color: '#ffffff',
                      fontSize: '9.5px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '99px',
                      whiteSpace: 'nowrap',
                      marginBottom: '4px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}
                  >
                    {animProgress >= 1 ? '✅ Tiba!' : `${isMotor ? '🛵' : '🚗'} ${vehicleTypeName} (${Math.round(animProgress * 100)}%)`}
                  </div>

                  {/* Vehicle PNG Image Badge */}
                  <img
                    src={activeGpsIcon}
                    alt={vehicleTypeName}
                    style={{
                      width: isMotor ? '36px' : '44px',
                      height: isMotor ? '64px' : '60px',
                      objectFit: 'contain',
                      transform: `rotate(${vehicleHeading}deg)`,
                      filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.5))',
                      transition: 'transform 0.15s ease-out',
                    }}
                  />
                </div>
              )
            })()}
          </div>
        )}

        {/* Live Coordinate Pill Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'rgba(15, 23, 42, 0.78)',
            backdropFilter: 'blur(4px)',
            color: '#F8FAFC',
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '10px',
            fontWeight: 600,
            zIndex: 5,
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          {vehicleTypeName} GPS: {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)} • {Math.round(vehicleHeading)}°
        </div>
      </div>

      {/* ── Interactive Simulation Controls Bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#F1F5F9',
          padding: '8px 14px',
          borderRadius: '12px',
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Play / Pause Button */}
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: '#142A59',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {isPlaying ? '⏸️ Jeda' : '▶️ Lanjutkan'}
          </button>

          {/* Reset / Replay Button */}
          <button
            type="button"
            onClick={() => {
              setAnimProgress(0.01)
              setIsPlaying(true)
            }}
            title="Putar Ulang Rute dari Pool"
            style={{
              padding: '6px 12px',
              background: '#ffffff',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            🔄 Ulangi Rute
          </button>
        </div>

        {/* Speed Multiplier Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginRight: '4px' }}>
            Kecepatan:
          </span>
          {[1, 2, 4, 8].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setPlaybackSpeed(s)}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: playbackSpeed === s ? '1.5px solid #2463D9' : '1px solid #CBD5E1',
                background: playbackSpeed === s ? '#2463D9' : '#ffffff',
                color: playbackSpeed === s ? '#ffffff' : '#475569',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* ── Driver Status & Live Stage Narrative ── */}
      <div
        style={{
          background: animProgress >= 1 ? '#ECFDF5' : '#EEF3FF',
          border: `1.5px solid ${animProgress >= 1 ? '#A7F3D0' : '#DCE4F2'}`,
          borderRadius: '16px',
          padding: '12px 16px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <span style={{ fontSize: '24px' }}>{animProgress >= 1 ? '🎉' : (isMotor ? '🛵' : '🚚')}</span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: animProgress >= 1 ? '#047857' : '#142A59',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            STATUS PENGIRIMAN UNIT ({vehicleTypeName.toUpperCase()})
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: animProgress >= 1 ? '#065F46' : '#1E293B',
              marginTop: '2px',
            }}
          >
            {driverStage}
          </div>
        </div>
      </div>

      {/* ── Driver & ETA Status Banner ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          background: '#F8FAFC',
          border: '1.5px solid #E2E8F0',
          borderRadius: '16px',
          marginBottom: '18px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, letterSpacing: '0.5px' }}>
            ESTIMASI TIBA (ETA)
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#142A59' }}>
            {animProgress >= 1 ? 'Sudah Tiba' : `± ${dynamicMinutes} Menit (${dynamicDistanceKm} km)`}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
            Asal: Pool Kampus 2 UNSIL Mugarsari
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>DRIVER LOGISTIK</div>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
            Pak Agus Suryana (B 1234 VCL)
          </div>
          <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
            ● Membawa {vehicle?.displayName || vehicleTypeName}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
      `}</style>
    </div>
  )
}
