"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";

// @ts-ignore
import "leaflet/dist/leaflet.css";

// Fix icon issue on SSR
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Komponen untuk otomatis memusatkan peta jika kapal dipilih
function MapFlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 4, { duration: 1.5 });
  }, [center, map]);
  return null;
}

// MENGATASI ERROR "IntrinsicAttributes": Mendefinisikan props yang diterima komponen
interface MapViewerProps {
  vessels: any[];
  selectedVessel: string | null;
  setSelectedVessel: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function MapViewerComponent({ vessels, selectedVessel, setSelectedVessel }: MapViewerProps) {
  
  // Custom Glow Icon
  const createCustomIcon = (color: string, isSelected: boolean) => {
    return L.divIcon({
      className: "custom-div-icon",
      html: `
        <div style="
          position: relative;
          width: 16px; 
          height: 16px; 
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${isSelected ? `<div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: ${color}; opacity: 0.3; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
          <div style="
            width: 14px; 
            height: 14px; 
            background-color: ${color}; 
            border-radius: 50%; 
            box-shadow: 0 0 20px 2px ${color};
            ${isSelected ? 'border: 2px solid white; transform: scale(1.3);' : 'border: 1px solid rgba(255,255,255,0.3);'}
            transition: all 0.3s ease;
          "></div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  const activeVessel = vessels.find((v: any) => v.id === selectedVessel);
  const centerPos: [number, number] = activeVessel ? [activeVessel.lat, activeVessel.lng] : [20, 0];

  return (
    <MapContainer 
      center={centerPos} 
      zoom={3} 
      zoomControl={false} 
      style={{ width: "100%", height: "100%", background: "#0a0a0c" }}
      minZoom={2}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
      />
      
      {activeVessel && <MapFlyTo center={centerPos} />}

      {vessels.map((vessel: any) => (
        <Marker 
          key={vessel.id}
          position={[vessel.lat, vessel.lng]}
          icon={createCustomIcon(vessel.dotColor, selectedVessel === vessel.id)}
          eventHandlers={{
            click: () => setSelectedVessel(vessel.id)
          }}
        >
          <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-leaflet-tooltip">
            <div className="w-[220px] p-4 text-white font-inter">
              <div className="flex justify-between items-start mb-3 border-b border-white/10 pb-3">
                <span className="text-[#E5B5FF] font-grotesk font-bold text-[14px] tracking-wider">{vessel.id}</span>
                <span className="text-[8px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-white/10" style={{ color: vessel.dotColor }}>{vessel.status}</span>
              </div>
              <div className="flex flex-col gap-2 font-mono text-[10px]">
                <div className="flex justify-between"><span className="text-white/40">PACKAGE</span><span className="text-white/80">{vessel.package}</span></div>
                <div className="flex justify-between"><span className="text-white/40">CREW</span><span className="text-white/80">{vessel.crew}</span></div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-white/40">ROUTE</span>
                  <span className="text-[#00E3FD] flex items-center gap-1.5">
                    {vessel.origin.split(' ')[0]} <span className="w-2 h-[1px] bg-white/30 block"></span> {vessel.dest.split(' ')[0]}
                  </span>
                </div>
              </div>
            </div>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}