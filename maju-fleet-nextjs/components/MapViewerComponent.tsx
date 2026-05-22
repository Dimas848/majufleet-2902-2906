"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";

// @ts-ignore
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapFlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 4, { duration: 1.5 });
  }, [center, map]);
  return null;
}

interface MapViewerProps {
  vessels: any[];
  selectedVessel: string | null;
  setSelectedVessel: React.Dispatch<React.SetStateAction<string | null>>;
}

// Batas peta dunia (tidak bisa scroll keluar batas ini)
const WORLD_BOUNDS: L.LatLngBoundsExpression = [
  [-85, -180],
  [85, 180],
];

export default function MapViewerComponent({ vessels, selectedVessel, setSelectedVessel }: MapViewerProps) {

  const createCustomIcon = (color: string, isSelected: boolean, isAlert: boolean) => {
    const pulseAnim = isAlert
      ? `
        <div style="
          position: absolute;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: ${color};
          opacity: 0.2;
          animation: ping 1.1s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: absolute;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: ${color};
          opacity: 0.25;
          animation: ping 1.1s cubic-bezier(0, 0, 0.2, 1) infinite 0.25s;
        "></div>
      `
      : isSelected
      ? `<div style="
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: ${color};
          opacity: 0.3;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>`
      : '';

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
          ${pulseAnim}
          <div style="
            width: ${isAlert ? '15px' : '14px'};
            height: ${isAlert ? '15px' : '14px'};
            background-color: ${color};
            border-radius: 50%;
            box-shadow: 0 0 ${isAlert ? '20px 5px' : '20px 2px'} ${color};
            ${
              isSelected
                ? 'border: 2px solid white; transform: scale(1.3);'
                : isAlert
                ? 'border: 2px solid rgba(255,59,48,0.7);'
                : 'border: 1px solid rgba(255,255,255,0.3);'
            }
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
      minZoom={2}
      maxZoom={10}
      zoomControl={false}
      attributionControl={false}
      maxBounds={WORLD_BOUNDS}
      maxBoundsViscosity={1.0}
      style={{ width: "100%", height: "100%", background: "#0a0a0c" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        attribution=""
      />

      {activeVessel && <MapFlyTo center={centerPos} />}

      {vessels.map((vessel: any) => {
        const isAlert = vessel.status === "DELAYED" || vessel.status === "NOT DEPARTED YET";
        return (
          <Marker
            key={vessel.id}
            position={[vessel.lat, vessel.lng]}
            icon={createCustomIcon(vessel.dotColor, selectedVessel === vessel.id, isAlert)}
            eventHandlers={{
              click: () => setSelectedVessel(vessel.id)
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-leaflet-tooltip">
              <div className="w-[220px] p-4 text-white font-inter">
                <div className="flex justify-between items-start mb-3 border-b border-white/10 pb-3">
                  <span className="text-[#E5B5FF] font-grotesk font-bold text-[14px] tracking-wider">{vessel.id}</span>
                  <span
                    className="text-[8px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 rounded"
                    style={{
                      color: vessel.dotColor,
                      background: isAlert ? 'rgba(255,59,48,0.15)' : 'rgba(255,255,255,0.08)',
                      border: `1px solid ${isAlert ? 'rgba(255,59,48,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    {vessel.status}
                  </span>
                </div>
                <div className="flex flex-col gap-2 font-mono text-[10px]">
                  <div className="flex justify-between"><span className="text-white/40">PACKAGE</span><span className="text-white/80">{vessel.package}</span></div>
                  <div className="flex justify-between"><span className="text-white/40">CREW</span><span className="text-white/80">{vessel.crew}</span></div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-white/40">ROUTE</span>
                    <span className="text-[#00E3FD] flex items-center gap-1.5">
                      {vessel.origin?.split(' ')[0]} <span className="w-2 h-[1px] bg-white/30 block"></span> {vessel.dest?.split(' ')[0]}
                    </span>
                  </div>
                  {isAlert && vessel.reason && (
                    <div className="flex justify-between mt-1 pt-2 border-t border-white/10">
                      <span className="text-white/40">REASON</span>
                      <span className="text-[#FF3B30] text-right max-w-[120px] leading-tight">{vessel.reason}</span>
                    </div>
                  )}
                </div>
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
}