import React, { useEffect, useMemo, useRef, useState } from 'react';
import { catLocations, CatLocation } from '../data/catLocations';

declare global {
  interface Window {
    L?: any;
  }
}

type LatLngTuple = [number, number];

type UserPosition = {
  lat: number;
  lng: number;
};

const leafletVersion = '1.9.4';
let leafletLoader: Promise<void> | null = null;

const loadLeafletAssets = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.L) {
    return Promise.resolve();
  }

  if (!leafletLoader) {
    leafletLoader = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[data-leaflet="script"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Leaflet script')), { once: true });
      } else {
        const cssId = 'leaflet-css';
        if (!document.getElementById(cssId)) {
          const link = document.createElement('link');
          link.id = cssId;
          link.rel = 'stylesheet';
          link.href = `https://unpkg.com/leaflet@${leafletVersion}/dist/leaflet.css`;
          link.integrity = 'sha512-sA+q5ms5FzHF8syK5dm42Hcps225y7sY9qsK0kGugHgdGXNq35p3xNmPR9UCeFVLtZL1YI7Di5Kef3g8h3l0AQ==';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        const script = document.createElement('script');
        script.src = `https://unpkg.com/leaflet@${leafletVersion}/dist/leaflet.js`;
        script.defer = true;
        script.async = true;
        script.dataset.leaflet = 'script';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Leaflet script'));
        document.body.appendChild(script);
      }
    });
  }

  return leafletLoader;
};

const formatDistance = (distanceMiles: number | null): string => {
  if (distanceMiles == null) {
    return 'Distance unavailable';
  }

  if (distanceMiles < 0.1) {
    const feet = Math.round(distanceMiles * 5280);
    return `${feet.toLocaleString()} ft away`;
  }

  return `${distanceMiles.toFixed(2)} miles away`;
};

const toLatLngTuple = (location: { lat: number; lng: number }): LatLngTuple => [location.lat, location.lng];

const toRadians = (value: number): number => (value * Math.PI) / 180;

const getDistanceInMiles = (a: UserPosition, b: UserPosition): number => {
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const haversine =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return earthRadiusMiles * c;
};

const buildCatPopup = (cat: CatLocation, distanceMiles: number | null): string => {
  const distanceText = formatDistance(distanceMiles);
  const description = cat.description
    ? `<p style="margin: 4px 0 0; font-size: 0.85rem; color: #dbeafe;">${cat.description}</p>`
    : '';
  return `
    <div style="min-width: 180px; color: #FDEFD2;">
      <h3 style="margin: 0 0 4px; font-size: 1.1rem; font-weight: 600; color: #FDEFD2;">${cat.name}</h3>
      <p style="margin: 0; font-size: 0.9rem; color: #e0f2fe;">${distanceText}</p>
      ${description}
    </div>
  `;
};

const CatMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const catMarkersRef = useRef<Array<{ cat: CatLocation; marker: any }>>([]);
  const [leafletReady, setLeafletReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  const campusCenter = useMemo<LatLngTuple>(() => {
    const lat =
      catLocations.reduce((sum, cat) => sum + cat.lat, 0) / Math.max(catLocations.length, 1);
    const lng =
      catLocations.reduce((sum, cat) => sum + cat.lng, 0) / Math.max(catLocations.length, 1);
    return [lat, lng];
  }, []);

  useEffect(() => {
    let isMounted = true;
    loadLeafletAssets()
      .then(() => {
        if (isMounted) {
          setLeafletReady(true);
        }
      })
      .catch((error) => {
        console.error('Leaflet failed to load:', error);
        if (isMounted) {
          setMapError('We were unable to load the map tiles. Please try again later.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!leafletReady || !containerRef.current || mapRef.current || !window.L) {
      return;
    }

    const L = window.L;
    const map = L.map(containerRef.current, {
      center: campusCenter,
      zoom: 16,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    catMarkersRef.current = catLocations.map((cat) => {
      const marker = L.marker(toLatLngTuple(cat), { title: cat.name });
      marker.bindPopup(buildCatPopup(cat, null));
      marker.addTo(map);
      return { cat, marker };
    });

    map.fitBounds(L.latLngBounds(catLocations.map(toLatLngTuple)), { padding: [48, 48] });

    mapRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 0);

    return () => {
      map.remove();
      mapRef.current = null;
      userMarkerRef.current = null;
      catMarkersRef.current = [];
    };
  }, [leafletReady, campusCenter]);

  useEffect(() => {
    if (!leafletReady) {
      return;
    }

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported on this device.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserPosition(coords);
        setIsLocating(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setLocationError('We could not determine your location. Make sure location services are enabled.');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [leafletReady]);

  useEffect(() => {
    if (!leafletReady || !mapRef.current || !window.L) {
      return;
    }

    const L = window.L;

    if (userPosition) {
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.circleMarker(toLatLngTuple(userPosition), {
          radius: 8,
          color: '#2563EB',
          weight: 3,
          fillColor: '#60A5FA',
          fillOpacity: 0.9,
        }).addTo(mapRef.current);
        userMarkerRef.current.bindPopup('<div class="text-sm text-slate-100">You are here</div>');
      } else {
        userMarkerRef.current.setLatLng(toLatLngTuple(userPosition));
      }

      const bounds = L.latLngBounds([
        ...catLocations.map(toLatLngTuple),
        toLatLngTuple(userPosition),
      ]);
      mapRef.current.fitBounds(bounds, { padding: [48, 48] });
    }

    catMarkersRef.current.forEach(({ cat, marker }) => {
      const distance = userPosition ? getDistanceInMiles(userPosition, cat) : null;
      marker.setPopupContent(buildCatPopup(cat, distance));
    });
  }, [leafletReady, userPosition]);

  if (mapError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 rounded-lg p-4">
        {mapError}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="w-full h-[420px] rounded-3xl overflow-hidden shadow-xl border border-[#E9DDCD]"
      />

      <div className="bg-[#3B4A39]/80 text-[#FDEFD2] rounded-2xl p-4 space-y-2 border border-[#E9DDCD]/60">
        <h2 className="text-lg font-semibold tracking-wide uppercase text-[#F9E4C6]">Cat Hotspots</h2>
        <ul className="space-y-1 text-sm">
          {catLocations.map((cat) => {
            const distance = userPosition ? getDistanceInMiles(userPosition, cat) : null;
            return (
              <li key={cat.name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium">{cat.name}</span>
                <span className="text-[#E9DDCD]/80">
                  {distance != null ? formatDistance(distance) : 'Awaiting your location…'}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="text-xs text-[#E9DDCD]/70">
          {isLocating && !locationError && 'Locating you…'}
          {locationError}
        </div>
      </div>
    </div>
  );
};

export default CatMap;
