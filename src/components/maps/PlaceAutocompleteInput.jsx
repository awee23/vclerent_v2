import { useEffect, useRef } from 'react'
import { loadGoogleMaps } from '../../utils/googleMapsLoader'

export default function PlaceAutocompleteInput({ value, onChange, placeholder, style }) {
  const inputRef = useRef(null)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

  useEffect(() => {
    let isMounted = true

    loadGoogleMaps(apiKey, ['places'])
      .then((google) => {
        if (!isMounted || !inputRef.current || !google?.maps?.places?.Autocomplete) return

        try {
          const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: 'id' },
            fields: ['formatted_address', 'name'],
          })

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace()
            const selectedAddress = place.formatted_address || place.name || ''
            if (selectedAddress && onChange) {
              onChange(selectedAddress)
            }
          })
        } catch (err) {
          console.warn('PlaceAutocomplete init error:', err)
        }
      })
      .catch((err) => {
        // Silently fallback to standard input without throwing
        console.warn('Google Places not available:', err?.message || err)
      })

    return () => {
      isMounted = false
    }
  }, [apiKey, onChange])

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={style}
    />
  )
}
