'use client'

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Menu, MapPin, ChevronDown, Flame } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';

interface NavbarProps {
  cartCount: number;
  toggleCart: () => void;
  onOpenMenu: () => void;
  onOpenLocation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  cartCount, 
  toggleCart, 
  onOpenMenu, 
  onOpenLocation,
}) => {
  const router = useRouter();
  const { location } = useLocation();
  const displayArea = location.orderType === 'pickup'
    ? (location.outlet || location.city)
    : (location.area || location.city);
  const displayFull = location.orderType === 'pickup'
    ? (location.outlet || location.city)
    : `${location.area || 'Select area'}, ${location.city}`;
  return (
    <nav className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-neutral-200 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24"> 
          
          {/* Left: Logo Only */}
          <div className="flex items-center gap-3 md:gap-6 shrink-0">
            <div className="flex-shrink-0 flex items-center md:pl-2">
              <Image
                src="https://www.broadwaypizza.com.pk/assets/broadwayPizzaLogo.png"
                alt="Broadway Pizza"
                width={200}
                height={64}
                className="h-10 sm:h-12 md:h-16 w-auto object-contain transition-transform hover:scale-105"
                priority
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-8 min-w-0 flex-1 justify-end">
            
            {/* Hot Deals Icon in Navbar */}
            <button 
                onClick={() => router.push('/hot-deals')}
                className="relative flex items-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white px-4 py-2.5 rounded-full border border-red-500/10 transition-all active:scale-95 group"
            >
                <Flame size={18} fill="currentColor" className="animate-pulse" />
                <span className="hidden sm:block text-[11px] font-black uppercase tracking-widest italic">HOT DEALS</span>
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 border-2 border-white dark:border-[#0a0a0a]"></span>
                </span>
            </button>

            {/* Delivery Selector - Redesigned for Mobile */}
            <div 
              onClick={onOpenLocation}
              className="group cursor-pointer flex items-center"
            >
                {/* Mobile View: Clean Pill Design */}
                <div className="md:hidden flex items-center gap-2 bg-neutral-100 dark:bg-white/10 px-3 py-2 rounded-full border border-transparent hover:border-yellow-500/50 transition-all active:scale-95">
                    <MapPin size={14} className="text-yellow-500" fill="currentColor" />
                    <div className="flex flex-col leading-none">
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider mb-0.5">{location.orderType === 'pickup' ? 'Pickup' : 'Delivery'}</span>
                        <span className="text-xs font-bold text-neutral-900 dark:text-white truncate max-w-[100px]">{displayArea}</span>
                    </div>
                    <ChevronDown size={14} className="text-neutral-400" />
                </div>

                {/* Desktop View: Expanded Design */}
                <div className="hidden md:flex items-center gap-2 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 transition-all">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-[#1a1a1a] flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-all shadow-sm shrink-0">
                        <MapPin size={18} fill="currentColor" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider group-hover:text-yellow-600 dark:group-hover:text-yellow-500 transition-colors">{location.orderType === 'pickup' ? 'Pickup from' : 'Delivering to'}</span>
                            <ChevronDown size={10} className="text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-neutral-900 dark:text-white font-bold text-sm border-b border-transparent group-hover:border-yellow-500 transition-all leading-tight truncate block">
                            {displayFull}
                        </span>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
};

