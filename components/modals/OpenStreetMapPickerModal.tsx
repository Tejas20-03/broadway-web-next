'use client'

import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import type * as LType from 'leaflet';

interface OpenStreetMapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
}

export const OpenStreetMapPickerModal: React.FC<OpenStreetMapPickerModalProps> = ({
  isOpen,
  onClose,
  initialLat = 24.8607,
  initialLng = 67.0011,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LType.Map | null>(null);
  const markerRef = useRef<LType.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLat, setSelectedLat] = useState(initialLat);
  const [selectedLng, setSelectedLng] = useState(initialLng);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    let cancelled = false;

    const ensureLeafletCss = () => {
      const existing = document.getElementById('leaflet-css');
      if (existing) return;
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    };

    const initMap = async () => {
      try {
        ensureLeafletCss();
        const leaflet = await import('leaflet');
        if (cancelled || !mapContainerRef.current) return;
        const map = leaflet.map(mapContainerRef.current, {
          center: [initialLat, initialLng],
          zoom: 13,
          zoomControl: false,
          dragging: false,
          touchZoom: false,
          doubleClickZoom: false,
          scrollWheelZoom: false,
          boxZoom: false,
          keyboard: false,
        });

        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const marker = leaflet.marker([initialLat, initialLng], { draggable: false }).addTo(map);

        mapRef.current = map;
        markerRef.current = marker;
        setLoading(false);
      } catch {
        if (!cancelled) setLoading(false);
      }
    };

    initMap();

    return () => {
      cancelled = true;
      markerRef.current = null;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setLoading(true);
    };
  }, [isOpen, initialLat, initialLng]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[220] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-white/70 dark:bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full h-[85dvh] md:h-[80vh] md:max-w-4xl bg-white dark:bg-[#0a0a0a] md:rounded-3xl overflow-hidden border border-neutral-200 dark:border-white/10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-[#121212]">
          <div>
            <h3 className="text-neutral-900 dark:text-white font-black text-lg uppercase tracking-tight">Detected Location</h3>
            <p className="text-neutral-500 text-xs">Showing your current GPS location on map.</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        <div className="relative h-[calc(100%-132px)]">
          <div ref={mapContainerRef} className="w-full h-full" />
          {loading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 text-neutral-900 dark:text-white font-bold">
              <Loader2 size={18} className="animate-spin" /> Loading map...
            </div>
          )}
        </div>

        <div className="h-[68px] border-t border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-[#121212] px-4 flex items-center justify-between">
          <p className="text-xs text-neutral-400 font-medium">
            {selectedLat.toFixed(5)}, {selectedLng.toFixed(5)}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wide"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};



