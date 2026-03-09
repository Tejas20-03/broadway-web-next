'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Flame, Timer, Zap, ShoppingBag, ArrowRight, TrendingUp, Star, Users, Bell, ShieldCheck } from 'lucide-react';
import { Product } from '@/types';
import { useGetHotDealsQuery } from '@/store/apiSlice';
import type { HotDeal } from '@/services/api';

interface HotDealsPageProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: any) => void;
  onProductSelect: (product: Product) => void;
}

const RECENT_CLAIMS = [
  "Hamza from Karachi just claimed 20% OFF!",
  "Sara from Lahore grabbed the Midnight Deal!",
  "Someone just ordered the Beast Mode XXL!",
  "Flash Sale: 4 users just added Lava Cakes!",
  "Hurry! Only 2 'Duo Dynamite' deals left in Islamabad."
];

export const HotDealsPage: React.FC<HotDealsPageProps> = ({ isOpen, onClose, onAddToCart, onProductSelect }) => {
  const { data: baseDeals = [] } = useGetHotDealsQuery(undefined, { skip: !isOpen });
  // Local countdown state derived from base data
  const [deals, setDeals] = useState<HotDeal[]>([]);
  const [claimIndex, setClaimIndex] = useState(0);

  // Sync deals from RTK Query data when it arrives
  useEffect(() => {
    if (baseDeals.length > 0) setDeals(baseDeals);
  }, [baseDeals]);

  useEffect(() => {
    if (!isOpen || deals.length === 0) return;
    const timer = setInterval(() => {
      setDeals(prev => prev.map(deal => ({ ...deal, remainingSeconds: Math.max(0, deal.remainingSeconds - 1) })));
    }, 1000);
    const feedInterval = setInterval(() => {
      setClaimIndex(prev => (prev + 1) % RECENT_CLAIMS.length);
    }, 4000);
    return () => { clearInterval(timer); clearInterval(feedInterval); };
  }, [isOpen, deals.length]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleClaim = (deal: HotDeal) => {
    const mockProduct: Product = {
        id: deal.id,
        name: deal.name,
        description: deal.description,
        basePrice: deal.dealPrice,
        image: deal.image,
        category: 'hot-deals',
        tags: ['Hot Deal', 'Limited Time'],
        originalPrice: deal.originalPrice
    };
    onProductSelect(mockProduct);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-[#050505] overflow-y-auto animate-in slide-in-from-right duration-500 custom-scrollbar selection:bg-yellow-500 selection:text-black">
      
      {/* Visual Ambiance */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-yellow-500/5 blur-[180px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-yellow-500/5 blur-[180px] rounded-full animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] invert"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-[160] bg-black/90 backdrop-blur-3xl border-b border-white/5 px-4 md:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Flame size={32} className="text-yellow-500 fill-yellow-500 animate-bounce group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-40 animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-none flex items-center gap-2">
              <span className="text-white">HOT</span> <span className="text-yellow-500">DEALS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </h1>
            <p className="text-neutral-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] mt-1.5 flex items-center gap-2">
                <ShieldCheck size={10} className="text-emerald-500" />
                Broadway Exclusive Offers
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2.5 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-full transition-all border border-white/5 active:scale-90"
        >
          <X size={22} />
        </button>
      </header>

      {/* Live Feed Ticker */}
      <div className="sticky top-[84px] z-[155] bg-gradient-to-r from-yellow-600 to-yellow-700 py-2 overflow-hidden shadow-xl border-y border-white/10">
          <div className="flex items-center gap-4 animate-in slide-in-from-left duration-500" key={claimIndex}>
              <div className="flex items-center gap-2 px-6 whitespace-nowrap">
                  <Bell size={13} className="text-white fill-white animate-ring" />
                  <span className="text-white text-[10px] font-black uppercase tracking-widest italic">{RECENT_CLAIMS[claimIndex]}</span>
              </div>
          </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-10 pb-32">
        <div className="mb-12 text-center px-4">
            <div className="inline-flex items-center gap-3 bg-white/5 px-5 py-2 rounded-full mb-6 border border-white/10 backdrop-blur-xl">
                <Users size={16} className="text-yellow-500" strokeWidth={3} />
                <span className="text-[11px] font-black text-neutral-300 uppercase tracking-widest italic">1,249 Active Browsers</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-[0.9] mb-4">
                THE <span className="text-yellow-500">LEGENDS</span> ARE <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">HERE.</span>
            </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
          {deals.map((deal) => {
            const isCritical = deal.remainingSeconds < 600;
            return (
              <div 
                key={deal.id}
                onClick={() => handleClaim(deal)}
                className={`group relative bg-[#0d0d0d] border rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden transition-all duration-500 flex flex-col cursor-pointer
                  ${isCritical ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.15)]' : 'border-white/5 hover:border-yellow-500/30'}
                `}
              >
                <div className="relative h-40 md:h-64 w-full overflow-hidden">
                    <Image
                        src={deal.image}
                        alt={deal.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-black/40"></div>
                    
                    <div className="absolute top-3 left-3 md:top-5 md:left-5 flex flex-col gap-1.5">
                        <div className="bg-yellow-500 text-black px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xl">
                            <Zap size={10} fill="black" /> FLASH
                        </div>
                        {deal.stockPercent < 15 && (
                            <div className="bg-white text-red-600 px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-xl">
                                <TrendingUp size={10} strokeWidth={3} /> LOW
                            </div>
                        )}
                    </div>

                    <div className={`absolute bottom-3 left-3 right-3 md:bottom-5 md:left-5 md:right-5 backdrop-blur-2xl border flex items-center justify-between px-3 py-2 md:px-5 md:py-4 rounded-xl md:rounded-2xl transition-colors ${isCritical ? 'bg-yellow-500 border-yellow-400' : 'bg-black/60 border-white/10'}`}>
                        <div className="flex items-center gap-1.5 md:gap-3">
                            <Timer size={14} className={`${isCritical ? 'text-black animate-spin' : 'text-yellow-500'} md:w-5 md:h-5`} />
                            <span className={`${isCritical ? 'text-black' : 'text-white'} font-black text-sm md:text-2xl tracking-tighter font-mono`}>{formatTime(deal.remainingSeconds)}</span>
                        </div>
                        <span className={`text-[7px] md:text-[9px] font-black uppercase tracking-widest ${isCritical ? 'text-black' : 'text-neutral-500'} hidden xs:block`}>
                            {deal.remainingSeconds === 0 ? 'EXPIRED' : 'LEFT'}
                        </span>
                    </div>
                </div>

                <div className="p-4 md:p-8 flex-1 flex flex-col">
                    <div className="mb-3 md:mb-4">
                        <h3 className="text-sm md:text-2xl font-black text-white uppercase italic tracking-tight mb-1 md:mb-2 group-hover:text-yellow-500 transition-colors line-clamp-1">
                            {deal.name}
                        </h3>
                        <p className="text-neutral-500 text-[10px] md:text-xs font-medium leading-tight md:leading-relaxed line-clamp-2">
                            {deal.description}
                        </p>
                    </div>

                    <div className="mb-4 md:mb-8 space-y-1 md:space-y-2">
                        <div className="flex justify-between text-[7px] md:text-[10px] font-black uppercase tracking-widest">
                            <span className="text-neutral-600 font-bold tracking-widest">Stock Status</span>
                            <span className={deal.stockPercent < 15 ? 'text-red-500' : 'text-neutral-500'}>{deal.stockPercent}%</span>
                        </div>
                        <div className="h-1 md:h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                            <div 
                                className="h-full transition-all duration-1000 rounded-full bg-yellow-500"
                                style={{ width: `${deal.stockPercent}%` }}
                            />
                        </div>
                    </div>

                    <div className="mt-auto flex items-end justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] md:text-sm text-neutral-600 font-bold line-through decoration-white/20">Rs. {deal.originalPrice}</span>
                            <div className="flex items-baseline gap-0.5 md:gap-1">
                                <span className="text-yellow-500 text-[10px] md:text-xs font-black">Rs.</span>
                                <span className="text-white text-xl md:text-4xl font-black tracking-tighter italic">{deal.dealPrice}</span>
                            </div>
                        </div>

                        <button 
                            className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-3xl bg-yellow-500 text-black flex items-center justify-center shadow-lg transition-all active:scale-90 group/btn relative overflow-hidden"
                        >
                            <ShoppingBag size={18} strokeWidth={2.5} className="md:w-7 md:h-7 relative z-10" />
                        </button>
                    </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 md:mt-24 p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] bg-gradient-to-br from-yellow-600/10 to-[#0a0a0a] border border-yellow-500/20 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 relative overflow-hidden">
            <div className="flex items-center gap-4 md:gap-8 relative z-10">
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-yellow-500 flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.2)]">
                    <Bell size={24} className="text-black md:w-10 md:h-10" />
                </div>
                <div>
                    <h4 className="text-white font-black text-lg md:text-2xl uppercase italic tracking-tight">VIP DEAL ALERTS</h4>
                    <p className="text-neutral-500 text-xs md:text-sm font-medium">Join 100k+ fans for immediate drop notifications.</p>
                </div>
            </div>
            <button className="w-full md:w-auto px-8 md:px-10 py-4 md:py-5 bg-white text-black font-black uppercase tracking-widest text-[10px] md:text-xs rounded-xl md:rounded-2xl flex items-center justify-center gap-3 hover:bg-yellow-500 transition-all active:scale-95">
                NOTIFY ME <ArrowRight size={18} strokeWidth={3} />
            </button>
        </div>
      </main>

      <footer className="py-10 border-t border-white/5 text-center px-6 bg-black/40">
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
              <div className="flex items-center gap-2 text-neutral-600 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                  <Star size={10} className="text-yellow-500 fill-yellow-500" />
                  ONLINE ONLY
              </div>
              <div className="flex items-center gap-2 text-neutral-600 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                  <Star size={10} className="text-yellow-500 fill-yellow-500" />
                  LIMITED SLOTS
              </div>
              <div className="flex items-center gap-2 text-neutral-600 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                  <Star size={10} className="text-yellow-500 fill-yellow-500" />
                  BROADWAY PRIDE
              </div>
          </div>
      </footer>
    </div>
  );
};

