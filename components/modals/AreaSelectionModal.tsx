'use client'

import React, { useState, useMemo } from 'react';
import { Search, Check, MapPin, X, Loader2 } from 'lucide-react';
import { Area } from '@/types';

interface AreaSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (area: string) => void;
  currentArea: string;
  areas: Area[];
  isLoading: boolean;
}

export const AreaSelectionModal: React.FC<AreaSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentArea,
  areas,
  isLoading,
}) => {
  const [search, setSearch] = useState('');

  const filteredAreas = useMemo(() => {
    return areas.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
  }, [areas, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-white/70 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full h-[100dvh] md:h-[600px] md:max-w-md bg-white dark:bg-[#0a0a0a] rounded-none md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-0 md:border border-neutral-200 dark:border-white/10 animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-[#121212] shrink-0 pt-safe-top">
          <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">Select Area</h2>
          <button
            onClick={onClose}
            className="p-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full text-neutral-900 dark:text-white transition-colors border border-neutral-200 dark:border-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-white dark:bg-[#0a0a0a] border-b border-neutral-200 dark:border-white/5">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search area..."
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-[#1a1a1a] text-neutral-900 dark:text-white pl-10 pr-4 py-3.5 rounded-xl border border-neutral-200 dark:border-white/10 focus:border-yellow-500/50 outline-none transition-all placeholder:text-neutral-500 dark:placeholder:text-neutral-600 focus:shadow-[0_0_20px_rgba(234,179,8,0.1)] font-medium text-sm"
            />
          </div>
        </div>

        {/* Area List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 size={28} className="animate-spin text-yellow-500" />
            </div>
          ) : filteredAreas.length > 0 ? (
            <div className="space-y-1">
              {filteredAreas.map(area => {
                const isSelected = currentArea === area.name;
                return (
                  <button
                    key={area.id}
                    onClick={() => { onSelect(area.name); onClose(); }}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group
                      ${isSelected
                        ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/30'
                        : 'hover:bg-white/5 border border-transparent'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-white/5 border border-neutral-200 dark:border-white/10'}`}>
                        <MapPin size={14} className={isSelected ? 'text-yellow-500' : 'text-neutral-500 group-hover:text-neutral-300'} />
                      </div>
                      <span className={`font-bold text-sm tracking-tight ${isSelected ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 group-hover:text-neutral-900 dark:text-white'} transition-colors`}>
                        {area.name}
                      </span>
                    </div>
                    {isSelected && <Check size={18} className="text-yellow-500 animate-in slide-in-from-right-2 fade-in duration-300 shrink-0" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-neutral-500 gap-3">
              <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-200 dark:border-white/5">
                <MapPin size={24} className="opacity-30" />
              </div>
              <p className="text-sm font-medium">No area found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



