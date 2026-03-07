'use client'

import React, { useState } from 'react';
import { X, Gift, Calendar, Users, MapPin, Check, Phone, Cake, Music, Sparkles } from 'lucide-react';
import { useGetBirthdayDealsQuery } from '@/store/apiSlice';

interface BirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BirthdayModal: React.FC<BirthdayModalProps> = ({ isOpen, onClose }) => {
  const { data: deals = [] } = useGetBirthdayDealsQuery(undefined, { skip: !isOpen });
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);

  const toggleDeal = (id: string) => {
    setSelectedDeals(prev =>
      prev.includes(id) ? prev.filter(dealId => dealId !== id) : [...prev, id]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full h-[100dvh] md:h-[700px] max-w-[90rem] bg-[#0a0a0a] border-0 md:border border-white/10 rounded-none md:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
        
        {/* Mobile Sticky Close Button */}
        <div className="md:hidden sticky top-4 right-4 z-[110] flex justify-end px-4 mb-[-40px] pointer-events-none">
            <button 
                onClick={onClose}
                className="pointer-events-auto p-2 bg-black/60 backdrop-blur-md hover:bg-black/80 rounded-full text-white transition-colors border border-white/10 shadow-lg"
            >
                <X size={20} />
            </button>
        </div>

        {/* Left Panel: Info & Vibes */}
        <div className="w-full md:w-[25%] bg-[#121212] border-b md:border-b-0 md:border-r border-white/5 flex flex-col relative shrink-0 h-auto md:h-full md:overflow-y-auto">
            {/* Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="p-8 flex-1 flex flex-col">
                
                {/* Header */}
                <div className="mb-8 pt-6 md:pt-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white mb-6 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                        <Gift size={28} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none mb-3">
                        Celebrate<br/>With Us
                    </h2>
                    <p className="text-neutral-400 text-sm font-medium leading-relaxed">
                        Indulge in exceptional birthday deals brought to you by Broadway Pizza. Let's make your special day unforgettable.
                    </p>
                </div>

                <div className="space-y-6 mt-2">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-yellow-500 shrink-0 border border-white/5">
                            <Cake size={18} />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm">Delicious Menu</h4>
                            <p className="text-neutral-500 text-xs mt-1">Curated deals for every party size.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-pink-500 shrink-0 border border-white/5">
                            <Music size={18} />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm">Great Ambiance</h4>
                            <p className="text-neutral-500 text-xs mt-1">Perfect spots for friends & family.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-purple-500 shrink-0 border border-white/5">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm">Hassle Free</h4>
                            <p className="text-neutral-500 text-xs mt-1">We handle the food, you handle the fun.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-8 border-t border-white/5">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Instant Booking</p>
                    <a href="tel:111339339" className="flex items-center gap-3 text-white hover:text-yellow-500 transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                            <Phone size={14} />
                        </div>
                        <span className="font-bold text-lg">111-339-339</span>
                    </a>
                </div>

            </div>
        </div>

        {/* Right Panel: Content */}
        <div className="w-full md:flex-1 bg-[#0a0a0a] flex flex-col relative h-auto md:h-full md:overflow-y-auto">
            
            {/* Desktop Close Button */}
            <button 
                onClick={onClose}
                className="hidden md:block absolute top-6 right-6 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5"
            >
                <X size={20} />
            </button>

            <div className="flex-1 p-6 md:p-8">
                <div className="max-w-6xl mx-auto">
                    
                    {/* SECTION 1: Select Deal */}
                    <div className="mb-10">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                            1. Select Deals <span className="text-neutral-500 text-sm font-normal normal-case">(Multi-select available)</span> <span className="text-red-500">*</span>
                        </h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            {deals.map((deal) => {
                                const isSelected = selectedDeals.includes(deal.id);
                                return (
                                    <div 
                                        key={deal.id}
                                        onClick={() => toggleDeal(deal.id)}
                                        className={`
                                            relative flex flex-col rounded-2xl border-2 cursor-pointer overflow-hidden transition-all duration-300 group
                                            ${isSelected 
                                                ? 'border-yellow-500 bg-[#161616] shadow-[0_0_20px_rgba(234,179,8,0.2)]' 
                                                : 'border-white/5 bg-[#121212] hover:border-white/20 hover:bg-[#161616]'}
                                        `}
                                    >
                                        <div className="relative h-32 md:h-40 w-full overflow-hidden">
                                            <img 
                                                src={deal.image} 
                                                alt={deal.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                                            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                                <span className="font-black text-sm md:text-lg text-white uppercase">{deal.name}</span>
                                                <span className="font-bold text-xs md:text-sm text-yellow-500 bg-black/50 backdrop-blur px-2 py-1 rounded-lg border border-yellow-500/20">Rs. {deal.price}</span>
                                            </div>
                                            
                                            {/* Checkmark */}
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 md:top-3 md:right-3 w-5 h-5 md:w-6 md:h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                                                    <Check size={14} className="text-black" strokeWidth={4} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 md:p-4 flex-1">
                                            <p className="text-[10px] md:text-xs text-neutral-400 leading-relaxed font-medium line-clamp-4">
                                                {deal.description}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* SECTION 2: Event Details */}
                    <div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                            2. Event Details
                        </h3>

                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            
                            {/* Personal Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Full Name *</label>
                                    <input type="text" className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm placeholder:text-neutral-700" placeholder="Your Name" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Phone Number *</label>
                                    <input type="tel" className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm placeholder:text-neutral-700" placeholder="0300..." required />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Email Address *</label>
                                    <input type="email" className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm placeholder:text-neutral-700" placeholder="email@example.com" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Number of Guests *</label>
                                    <div className="relative">
                                        <input type="number" className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm placeholder:text-neutral-700" placeholder="Total Persons" required />
                                        <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Date & Time *</label>
                                    <div className="relative">
                                        <input type="datetime-local" className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm placeholder:text-neutral-700 [color-scheme:dark]" required />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Event Location *</label>
                                    <div className="relative">
                                        <input type="text" className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm placeholder:text-neutral-700" placeholder="e.g. Broadway Pizza Johar Town" required />
                                        <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Special Instructions</label>
                                <textarea rows={3} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm resize-none placeholder:text-neutral-700" placeholder="Any specific requirements regarding decor, food, or seating?" />
                            </div>

                            <button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-base py-4 rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wide mt-4">
                                <span>Submit Inquiry</span>
                                <Sparkles size={18} strokeWidth={2.5} />
                            </button>

                        </form>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
