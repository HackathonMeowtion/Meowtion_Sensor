// src/components/MapPanel.tsx
import React from 'react';
import { MapContainer, ImageOverlay, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// --- ADD THIS LINE ---
// This import is crucial for the popup and other map elements to look correct.
import 'leaflet/dist/leaflet.css';

import campusMapImage from '../assets/uta-campus-map.jpg';
import catPingIcon from '../assets/catPing.png';
import microwaveImage from '../assets/known-cats/microwave.webp';
import oreoImage from '../assets/known-cats/oreo.jpg';
import twixImage from '../assets/known-cats/twix.jpg';

const catLocations = [
  { 
    name: 'Microwave', 
    position: [450, 850], 
    imageSrc: microwaveImage 
  },
  { 
    name: 'Oreo', 
    position: [950, 1500], 
    imageSrc: oreoImage 
  },
  { 
    name: 'Twix', 
    position: [550, 1950], 
    imageSrc: twixImage 
  },
];

const customIcon = new L.Icon({
  iconUrl: catPingIcon,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const MapPanel: React.FC = () => {
  const bounds = new L.LatLngBounds([0, 0], [1700, 2550]);

  return (
    <MapContainer
      crs={L.CRS.Simple}
      bounds={bounds}
      minZoom={-2}
      className="w-full h-full rounded-lg bg-[#6C8167]"
    >
      <ImageOverlay
        url={campusMapImage}
        bounds={bounds}
      />
      
      {catLocations.map(cat => (
        <Marker key={cat.name} position={cat.position as L.LatLngExpression} icon={customIcon}>
          <Popup>
            <div className="text-center">
              <img 
                src={cat.imageSrc} 
                alt={cat.name} 
                className="w-24 h-24 object-cover rounded-md mb-2 mx-auto"
              />
              <div className="font-bold text-lg text-[#98522C]">{cat.name}</div>
              <p className="text-sm text-gray-600">Spotted here! 📍</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapPanel;