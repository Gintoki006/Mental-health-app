import React, { useEffect, useRef, useState } from 'react'
import { Wrapper, Status } from '@googlemaps/react-wrapper'

const MapComponent = ({ therapists, center, zoom = 12 }) => {
  const ref = useRef(null)
  const [map, setMap] = useState(null)
  const [markers, setMarkers] = useState([])

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })
      setMap(newMap)
    }
  }, [ref, map, center, zoom])

  useEffect(() => {
    if (map && therapists) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null))
      
      const newMarkers = therapists.map(therapist => {
        const marker = new window.google.maps.Marker({
          position: {
            lat: therapist.location?.coordinates?.lat || 0,
            lng: therapist.location?.coordinates?.lng || 0
          },
          map,
          title: therapist.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="#fff" stroke-width="2"/>
                <path d="M12 16l4 4 8-8" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 16)
          }
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold text-gray-900">${therapist.name}</h3>
              <p class="text-sm text-gray-600">${therapist.credentials?.degree || ''}</p>
              <p class="text-sm text-gray-500">${therapist.location?.address?.city}, ${therapist.location?.address?.state}</p>
              <div class="mt-2">
                ${therapist.specialization?.slice(0, 2).map(spec => 
                  `<span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mr-1">${spec.replace('-', ' ')}</span>`
                ).join('')}
              </div>
            </div>
          `
        })

        marker.addListener('click', () => {
          infoWindow.open(map, marker)
        })

        return marker
      })

      setMarkers(newMarkers)

      // Fit map to show all markers
      if (newMarkers.length > 0) {
        const bounds = new window.google.maps.LatLngBounds()
        newMarkers.forEach(marker => {
          bounds.extend(marker.getPosition())
        })
        map.fitBounds(bounds)
      }
    }
  }, [map, therapists])

  return <div ref={ref} className="w-full h-full rounded-lg" />
}

const render = (status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )
    case Status.FAILURE:
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600">Failed to load map</p>
            <p className="text-xs text-gray-500 mt-1">Please check your internet connection</p>
          </div>
        </div>
      )
    default:
      return null
  }
}

const TherapistMap = ({ therapists, center, zoom }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-gray-600">Google Maps API key not configured</p>
          <p className="text-xs text-gray-500 mt-1">Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables</p>
        </div>
      </div>
    )
  }

  return (
    <Wrapper apiKey={apiKey} render={render}>
      <MapComponent therapists={therapists} center={center} zoom={zoom} />
    </Wrapper>
  )
}

export default TherapistMap
