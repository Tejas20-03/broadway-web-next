'use client'

import React, { useState, useMemo } from 'react';
import { Search, Check, MapPin, X, Loader2 } from 'lucide-react';
import { useGetCitiesQuery } from '@/store/apiSlice';
import type { City } from '@/services/api';

interface CitySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (city: string) => void;
  currentCity: string;
}

export const CitySelectionModal: React.FC<CitySelectionModalProps> = ({ isOpen, onClose, onSelect, currentCity }) => {
  const [search, setSearch] = useState('');
  const { data: cities = [], isLoading: loading } = useGetCitiesQuery(undefined, { skip: !isOpen });

  const filteredCities = useMemo(() => {
    return cities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [cities, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Content - UPDATED: h-[100dvh] on mobile, rounded-none on mobile */}
      <div className="relative w-full h-[100dvh] md:h-[600px] md:max-w-md bg-[#0a0a0a] rounded-none md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-0 md:border border-white/10 animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#121212] shrink-0 pt-safe-top">
            <h2 className="text-xl font-black text-white tracking-tight">Select City</h2>
            <button 
                onClick={onClose}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors border border-white/5"
            >
                <X size={20} />
            </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-[#0a0a0a] border-b border-white/5">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Search City..." 
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#1a1a1a] text-white pl-10 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-yellow-500/50 outline-none transition-all placeholder:text-neutral-600 focus:shadow-[0_0_20px_rgba(234,179,8,0.1)] font-medium text-sm"
                />
            </div>
        </div>

        {/* City List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 size={28} className="animate-spin text-yellow-500" />
                </div>
            ) : filteredCities.length > 0 ? (
                <div className="space-y-1">
                    {filteredCities.map((city) => {
                        const isSelected = currentCity === city.name;
                        return (
                            <button
                                key={city.name}
                                onClick={() => {
                                    onSelect(city.name);
                                    onClose();
                                }}
                                className={`
                                    w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group
                                    ${isSelected 
                                        ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/30' 
                                        : 'hover:bg-white/5 border border-transparent'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    {/* City Image */}
                                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-neutral-900">
                                        {city.imageUrl ? (
                                            <img
                                                src={city.imageUrl}
                                                alt={city.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <MapPin size={16} className="text-neutral-600" />
                                            </div>
                                        )}
                                    </div>
                                    <span className={`font-bold text-sm md:text-base tracking-tight ${isSelected ? 'text-white' : 'text-neutral-400 group-hover:text-white'} transition-colors`}>
                                        {city.name}
                                    </span>
                                </div>
                                {isSelected && <Check size={18} className="text-yellow-500 animate-in slide-in-from-right-2 fade-in duration-300" />}
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-48 text-neutral-500 gap-3">
                    <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center border border-white/5">
                        <MapPin size={24} className="opacity-30" />
                    </div>
                    <p className="text-sm font-medium">No city found</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
