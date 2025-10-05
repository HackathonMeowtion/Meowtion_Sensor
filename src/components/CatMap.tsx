import React, { useEffect, useMemo, useRef, useState } from 'react';

// Import assets
import catPingIcon from '../assets/catPing.PNG';
import microwaveImage from '../assets/known-cats/microwave.webp';
import snickersImage from '../assets/known-cats/snickers1.png';
import eggsImage from '../assets/known-cats/eggs1.png';
import twixImage from '../assets/known-cats/twix.jpg';
import eraserImage from '../assets/known-cats/oreo2.jpeg';

type Coordinates = [number, number];

type CatSpot = {
  id: string;
  name: string;
  description: string;
  coords: Coordinates;
  imageSrc: string;
};

declare global {
  interface Window {
    L?: any;
    __leafletLoaderPromise?: Promise<any>;
  }
}

const defaultCenter: Coordinates = [32.7309, -97.1116];

const catSpots: CatSpot[] = [
  {
    id: 'microwave',
    name: 'Microwave',
    description: 'A 14-year-old cat usually found behind the Planetarium.',
    coords: [32.73062939838508, -97.11227835862472], // <-- UPDATED COORDINATES for behind the Chem/Phys building
    imageSrc: microwaveImage,
  },
  {
    id: 'snickers',
    name: 'Snickers',
    description: 'Often found in the mornings wandering near Woolf Hall and the Tri-C.',
    coords: [32.731748281337225, -97.11292651116041], // Coordinates for Woolf Hall
    imageSrc: snickersImage,
  },
  {
    id: 'eggs',
    name: 'Eggs',
    description: 'Bonded with Eraser, found in the saplings at the College of Business pavilion.',
    coords: [32.72991170639939, -97.11087942941545], // Coordinates for College of Business
    imageSrc: eggsImage,
  },
  {
    id: 'twix',
    name: 'Twix',
    description: 'Sociable in the mornings, found under cars or near picnic tables.',
    coords: [32.7317, -97.1135],
    imageSrc: twixImage,
  },
  {
    id: 'eraser',
    name: 'Eraser',
    description: 'Bonded with Eggs, found under cars or by food stations in the mornings and evenings.',
    coords: [32.731298144082174, -97.11218612970153],
    imageSrc: eraserImage,
  },
];

const ensureLeaflet = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Leaflet requires a browser environment.');
  }

  if (window.L) {
    return window.L;
  }

  if (!window.__leafletLoaderPromise) {
    window.__leafletLoaderPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[data-leaflet]');
      const existingStylesheet = document.querySelector<HTMLLinkElement>('link[data-leaflet]');

      const handleReady = () => {
        if (window.L) {
          resolve(window.L);
        } else {
          reject(new Error('Leaflet failed to load.'));
        }
      };

      if (!existingStylesheet) {
        const stylesheet = document.createElement('link');
        stylesheet.rel = 'stylesheet';
        stylesheet.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        stylesheet.setAttribute('data-leaflet', 'css');
        document.head.appendChild(stylesheet);
      }

      if (existingScript) {
        existingScript.addEventListener('load', handleReady, { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Leaflet failed to load.')), {
          once: true,
        });
      } else {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.defer = true;
        script.setAttribute('data-leaflet', 'script');
        script.onload = handleReady;
        script.onerror = () => reject(new Error('Leaflet failed to load.'));
        document.body.appendChild(script);
      }
    });
  }

  return window.__leafletLoaderPromise;
};

const metersToReadable = (meters: number): string => {
  const feet = meters * 3.28084;
  if (feet < 1000) {
    return `${Math.round(feet)} ft away`;
  }

  const miles = feet / 5280;
  if (miles < 10) {
    return `${miles.toFixed(2)} mi away`;
  }

  return `${miles.toFixed(1)} mi away`;
};

const calculateDistance = (from: Coordinates, to: Coordinates): number => {
  const [lat1, lon1] = from.map((value) => (value * Math.PI) / 180);
  const [lat2, lon2] = to.map((value) => (value * Math.PI) / 180);

  const deltaLat = lat2 - lat1;
  const deltaLon = lon2 - lon1;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const earthRadiusMeters = 6371_000;

  return earthRadiusMeters * c;
};


const CatMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const userCircleRef = useRef<any>(null);

  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      try {
        const L = await ensureLeaflet();
        if (!isMounted || !mapContainerRef.current || mapInstanceRef.current) {
          return;
        }

        const map = L.map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: 17,
          zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        const catIcon = L.icon({
          iconUrl: catPingIcon,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
        });

        const catLayer = L.layerGroup();
        catSpots.forEach((spot) => {
          const marker = L.marker(spot.coords, { icon: catIcon });

          const popupContent = `
            <div style="text-align: center; width: 160px;">
              <img src="${spot.imageSrc}" alt="${spot.name}" style="width: 100%; height: 112px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
              <strong style="font-size: 1.125rem; color: #98522C;">${spot.name}</strong>
              <p style="font-size: 0.75rem; color: #6C8167; line-height: 1.2; margin-top: 4px;">${spot.description}</p>
            </div>
          `;
          marker.bindPopup(popupContent);
          catLayer.addLayer(marker);
        });
        catLayer.addTo(map);

        mapInstanceRef.current = map;
      } catch (error) {
        console.error('Failed to initialize map', error);
        setMapError('The map could not be loaded. Please refresh and try again.');
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setLocationError(null);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access was denied. Enable it to see distances from you.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('We could not determine your location. Try again later.');
            break;
          case error.TIMEOUT:
            setLocationError('Locating took too long. You can refresh and try again.');
            break;
          default:
            setLocationError('Something went wrong while finding your location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
      }
    );
  }, []);

  useEffect(() => {
    if (!userLocation || !mapInstanceRef.current || !window.L) {
      return;
    }

    const L = window.L;
    mapInstanceRef.current.setView(userLocation, 17, { animate: true });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker(userLocation).addTo(mapInstanceRef.current);
      userMarkerRef.current.bindPopup('You are here!');
    } else {
      userMarkerRef.current.setLatLng(userLocation);
    }

    if (!userCircleRef.current) {
      userCircleRef.current = L.circle(userLocation, {
        radius: 12,
        color: '#2563EB',
        fillColor: '#60A5FA',
        fillOpacity: 0.4,
      }).addTo(mapInstanceRef.current);
    } else {
      userCircleRef.current.setLatLng(userLocation);
    }
  }, [userLocation]);


  const spotsWithDistance = useMemo(
    () =>
      catSpots.map((spot) => ({
        ...spot,
        distance: userLocation ? calculateDistance(userLocation, spot.coords) : null,
      })),
    [userLocation]
  );

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-[#E9DDCD] border-2 border-black rounded-3xl overflow-hidden shadow-xl">
        <div className="bg-[#BE956C] text-[#F9F5EF] px-4 py-3 border-b-2 border-black text-center">
          <h2 className="text-lg font-bold tracking-wide uppercase">Campus Cat Map</h2>
          <p className="text-xs mt-1">
            Allow location access to see how close you are to each cat hangout.
          </p>
        </div>
        <div className="h-80" ref={mapContainerRef} />
        <div className="bg-[#F8F1E7] border-t-2 border-black px-4 py-3 space-y-2">
          {spotsWithDistance.map((spot) => (
            <div
              key={spot.id}
              className="flex items-start justify-between bg-white/70 border border-[#D5C5B1] rounded-xl px-3 py-2"
            >
              <div>
                <p className="text-sm font-semibold text-[#98522C]">{spot.name}</p>
                <p className="text-xs text-[#6C8167] leading-tight">{spot.description}</p>
              </div>
              <div className="text-xs font-semibold text-[#6C8167] ml-2 whitespace-nowrap">
                {spot.distance ? metersToReadable(spot.distance) : 'Enable location'}
              </div>
            </div>
          ))}
        </div>
        {(mapError || locationError) && (
          <div className="bg-red-100 border-t-2 border-black text-red-700 text-sm px-4 py-3 space-y-1 text-left">
            {mapError && <p>{mapError}</p>}
            {locationError && <p>{locationError}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatMap;