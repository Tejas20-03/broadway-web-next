'use client'

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { X, MapPin, Search, Compass, ArrowUpRight, Map as MapIcon, Loader2, Building2, Info } from 'lucide-react';
import { useOutlets } from '@/hooks/useAreas';
import { useGetCitiesQuery } from '@/store/apiSlice';

interface LocationsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationsPage: React.FC<LocationsPageProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const { data: cities = [], isLoading: citiesLoading } = useGetCitiesQuery(undefined, { skip: !isOpen });

  useEffect(() => {
    if (cities.length > 0 && !selectedCity) {
      setSelectedCity(cities[0].name);
    }
  }, [cities, selectedCity]);

  const { outlets, isLoading } = useOutlets(isOpen ? selectedCity : '');

  const filtered = useMemo(() => {
    if (!searchTerm) return outlets;
    const q = searchTerm.toLowerCase();
    return outlets.filter(o =>
      o.name.toLowerCase().includes(q) || (o.address ?? '').toLowerCase().includes(q)
    );
  }, [outlets, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-gray-50 dark:bg-[#050505] flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
      {/* Header Section */}
      <header className="bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-2xl border-b border-neutral-200 dark:border-white/5 shrink-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)]">
              <MapIcon size={24} className="text-black" strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter leading-none">Our Outlets</h1>
              <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Find your nearest pizza paradise</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-900 dark:text-white rounded-full transition-all border border-neutral-200 dark:border-white/5">
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-6 pb-6 space-y-5">
        {/* City Cards */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {citiesLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="shrink-0 w-28 h-16 rounded-2xl bg-white/5 animate-pulse" />
              ))
            : cities.map(city => (
                <button
                  key={city.name}
                  onClick={() => setSelectedCity(city.name)}
                  className={`relative shrink-0 w-28 h-16 rounded-2xl overflow-hidden border-2 transition-all duration-300
                    ${selectedCity === city.name
                      ? 'border-yellow-500 shadow-lg shadow-yellow-500/20 scale-105'
                      : 'border-white/10 opacity-60 hover:opacity-90 hover:scale-[1.02]'}`}
                >
                  {city.imageUrl && (
                    <Image src={city.imageUrl} alt={city.name} fill sizes="120px" className="object-cover" />
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-t transition-all duration-300 ${selectedCity === city.name ? 'from-black/70 to-black/10' : 'from-black/80 to-black/40'}`} />
                  <span className={`absolute bottom-2 left-0 right-0 text-center text-[10px] font-black uppercase tracking-widest transition-colors ${selectedCity === city.name ? 'text-yellow-400' : 'text-white'}`}>
                    {city.name}
                  </span>
                  {selectedCity === city.name && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.8)]" />
                  )}
                </button>
              ))
          }
        </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search branch or street..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-neutral-900 dark:text-white focus:outline-none focus:border-yellow-500/40 font-bold text-base md:text-sm placeholder:text-neutral-500 dark:placeholder:text-neutral-700"
            />
          </div>
        </div>
      </header>

      {/* Grid Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-32 text-neutral-500">
              <Loader2 size={32} className="animate-spin mr-3" /> Loading outlets...
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((outlet) => (
                <div key={outlet.id} className="bg-white dark:bg-[#0e0e0e] border border-neutral-200 dark:border-white/5 rounded-[2rem] p-6 group hover:border-yellow-500/20 transition-all duration-500 hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-neutral-500 group-hover:text-yellow-500 transition-colors">
                      <Compass size={24} />
                    </div>
                    <span className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[9px] font-black text-green-500 uppercase tracking-widest">Live</span>
                  </div>
                  <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight mb-2 group-hover:text-yellow-500 transition-colors">
                    {outlet.name}
                  </h3>
                  {outlet.address && (
                    <div className="flex items-start gap-2 mb-8">
                      <MapPin size={14} className="text-neutral-600 shrink-0 mt-0.5" />
                      <p className="text-neutral-400 text-xs font-medium leading-relaxed line-clamp-2">{outlet.address}</p>
                    </div>
                  )}
                  {outlet.mapLink ? (
                    <a
                      href={outlet.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-14 bg-neutral-100 dark:bg-[#161616] hover:bg-yellow-500 text-neutral-700 dark:text-neutral-400 hover:text-black py-4 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 group/btn border border-neutral-200 dark:border-white/5"
                    >
                      Get Directions
                      <ArrowUpRight size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </a>
                  ) : (
                    <div className="w-full h-14 bg-neutral-100 dark:bg-[#161616] text-neutral-600 dark:text-neutral-600 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 border border-neutral-200 dark:border-white/5">
                      <MapPin size={14} /> No map link
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 opacity-30">
              <Building2 size={64} className="mb-4" />
              <h2 className="text-xl font-black uppercase tracking-widest">No Outlets Found</h2>
            </div>
          )}
        </div>
      </div>

      {/* Footer Meta */}
      <footer className="bg-white dark:bg-[#0a0a0a] border-t border-neutral-200 dark:border-white/5 p-6 shrink-0 flex items-center gap-3">
        <Info size={14} className="text-neutral-600" />
        <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Timing: 11:00 AM - 03:00 AM (Daily)</span>
      </footer>
    </div>
  );
};
