"use client";

import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Types ---
export interface ServiceCenter {
  id: string; 
  city: string;
  address: string;
  coordinates: [number, number];
  phone: string;
}

interface ServiceMapProps {
  centers: ServiceCenter[];
  selectedCoordinates: [number, number] | null; // Changed to match parent prop
}

// --- Map Controller (Handles Zoom/Pan) ---
const MapController = ({ coordinates }: { coordinates: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (coordinates) {
      // Zoom in when a city is selected
      map.flyTo(coordinates, 13, { duration: 1.5 });
    } else {
      // Zoom out to show entire India when nothing is selected
      map.flyTo([22.5937, 78.9629], 4, { duration: 1.5 });
    }
  }, [coordinates, map]);
  return null;
};

// --- Main Map Component ---
const ServiceMap: React.FC<ServiceMapProps> = ({ centers, selectedCoordinates }) => {
  
  // Custom Marker Icon
  const customIcon = useMemo(() => {
    if (typeof window === 'undefined') return null;

    const svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0d9488" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
      </svg>
    `;
    
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      shadowSize: [41, 41],
      shadowAnchor: [12, 41]
    });
  }, []);

  if (!customIcon) return null;

  return (
    <div className="relative w-full h-[400px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white z-0">
      <MapContainer
        center={[22.5937, 78.9629]}
        zoom={4} 
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {centers.map((center, index) => (
          <Marker
            key={center.id || index}
            position={center.coordinates}
            icon={customIcon}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[150px]">
                <h3 className="font-bold text-teal-700 text-lg">{center.city}</h3>
                <p className="text-sm text-gray-600 mt-1 font-medium">{center.address}</p>
                <p className="text-xs text-teal-600 mt-2 font-bold flex items-center gap-1">
                   📞 {center.phone}
                </p>
                <a 
                  href={`tel:${center.phone}`} 
                  className="block w-full text-center bg-teal-600 text-white text-xs py-1.5 rounded mt-2 font-bold hover:bg-teal-700 transition-colors no-underline"
                >
                  Call Now
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Pass selectedCoordinates directly to MapController */}
        <MapController coordinates={selectedCoordinates} />
      </MapContainer>
    </div>
  );
};

export default ServiceMap;