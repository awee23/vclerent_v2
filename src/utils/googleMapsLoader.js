let googleMapsPromise = null

export function loadGoogleMaps(apiKey, libraries = ['places', 'routes']) {
  // If already loaded globally
  if (typeof window !== 'undefined' && window.google && window.google.maps) {
    return Promise.resolve(window.google)
  }

  // If no key or placeholder
  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    return Promise.reject(new Error('API Key Google Maps belum dikonfigurasi'))
  }

  // Reuse existing promise to prevent duplicate injection
  if (googleMapsPromise) {
    return googleMapsPromise
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    try {
      const existingScript = document.getElementById('google-maps-script')
      if (existingScript) {
        if (window.google && window.google.maps) {
          resolve(window.google)
        } else {
          existingScript.addEventListener('load', () => resolve(window.google))
          existingScript.addEventListener('error', (e) => reject(e))
        }
        return
      }

      // Intercept authentication failure to prevent uncaught window error
      window.gm_authFailure = () => {
        console.warn('Google Maps API Key Authentication failed. Falling back gracefully.')
      }

      const script = document.createElement('script')
      script.id = 'google-maps-script'
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}&loading=async`
      script.async = true
      script.defer = true

      script.onload = () => {
        if (window.google && window.google.maps) {
          resolve(window.google)
        } else {
          reject(new Error('Google Maps script loaded but window.google not available'))
        }
      }

      script.onerror = (err) => {
        googleMapsPromise = null
        reject(err)
      }

      document.head.appendChild(script)
    } catch (err) {
      googleMapsPromise = null
      reject(err)
    }
  })

  return googleMapsPromise
}
