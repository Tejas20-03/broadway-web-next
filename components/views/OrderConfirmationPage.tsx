'use client'


import React from 'react';
import { Check, Clock, MapPin, Phone, Home, ChevronRight, Copy, Printer, Bike, ChefHat, ShoppingBag, Receipt, Star } from 'lucide-react';
import { CartItem, ProductOption } from '@/types';

interface OrderConfirmationPageProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  orderId?: string;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ 
  isOpen, onClose, cartItems, subtotal, tax, deliveryFee, total, orderId = "5438180" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-[#050505] overflow-y-auto animate-in zoom-in-95 duration-500 custom-scrollbar flex flex-col items-center">
      
      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-5xl px-4 py-8 md:py-12 relative z-10 flex flex-col flex-grow">
        
        {/* Success Header */}
        <div className="text-center mb-12 animate-in slide-in-from-bottom-5 duration-700 delay-100">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-[#1a1a1a] rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-[#222] shadow-[0_0_40px_rgba(234,179,8,0.2)] relative">
                <div className="absolute inset-0 border-4 border-yellow-500 rounded-full border-t-transparent animate-spin duration-[3000ms]"></div>
                <ChefHat size={48} className="text-yellow-500 animate-pulse" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2 uppercase italic">Mission Accomplished!</h1>
            <p className="text-neutral-400 text-sm md:text-lg font-medium">Your order is being crafted with perfection.</p>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-in slide-in-from-bottom-5 duration-700 delay-200">
            {/* Order # */}
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-1">Order Ref</span>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-white tracking-tight">#{orderId}</span>
                    <button className="text-neutral-500 hover:text-yellow-500 transition-colors"><Copy size={14} /></button>
                </div>
            </div>

            {/* Time */}
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-1">Arrival Window</span>
                <div className="flex items-center gap-2 text-yellow-500">
                    <Clock size={20} strokeWidth={2.5} />
                    <span className="text-2xl font-black tracking-tight">25-35 MINS</span>
                </div>
            </div>

            {/* Total */}
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-1">Payment Success</span>
                <span className="text-2xl font-black text-white tracking-tight">Rs. {total}</span>
            </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in slide-in-from-bottom-5 duration-700 delay-300">
            
            {/* LEFT: Tracking & Details */}
            <div className="lg:col-span-3 space-y-6">
                
                {/* Progress Tracker */}
                <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wide">Live Status</h3>
                        <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">In Kitchen</span>
                    </div>

                    <div className="relative flex justify-between px-2">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-[#222] -translate-y-1/2 rounded-full z-0"></div>
                        <div className="absolute top-1/2 left-0 w-1/3 h-1 bg-yellow-500 -translate-y-1/2 rounded-full z-0 transition-all duration-1000"></div>

                        <div className="relative z-10 flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center border-4 border-[#121212] shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                                <Check size={16} className="text-black" strokeWidth={4} />
                            </div>
                            <span className="text-[8px] font-black text-white uppercase">Placed</span>
                        </div>

                        <div className="relative z-10 flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#121212] border-2 border-yellow-500 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                                <ChefHat size={18} className="text-yellow-500" />
                            </div>
                            <span className="text-[8px] font-black text-yellow-500 uppercase">Prep</span>
                        </div>

                         <div className="relative z-10 flex flex-col items-center gap-2 opacity-30">
                            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border-2 border-[#333] flex items-center justify-center">
                                <Bike size={18} className="text-neutral-500" />
                            </div>
                            <span className="text-[8px] font-black text-neutral-500 uppercase">Transit</span>
                        </div>

                         <div className="relative z-10 flex flex-col items-center gap-2 opacity-30">
                            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border-2 border-[#333] flex items-center justify-center">
                                <Home size={18} className="text-neutral-500" />
                            </div>
                            <span className="text-[8px] font-black text-neutral-500 uppercase">Done</span>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 md:p-8">
                     <h3 className="text-lg font-bold text-white uppercase tracking-wide mb-6">Order Dispatch</h3>
                     <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-yellow-500 shrink-0">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-1">Destination</p>
                                <p className="text-white font-medium text-sm">Bahadurabad, Block 3, House 45-B, Karachi</p>
                            </div>
                        </div>
                     </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 bg-white hover:bg-neutral-200 text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-colors">
                        Return Home
                    </button>
                    <button className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-colors shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                        Track Live
                    </button>
                </div>

            </div>

            {/* RIGHT: Receipt */}
            <div className="lg:col-span-2">
                <div className="bg-[#121212] border border-white/5 rounded-3xl overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-white/5 bg-[#161616] flex items-center justify-between">
                         <div className="flex items-center gap-2 text-white">
                             <Receipt size={20} className="text-yellow-500" />
                             <span className="font-bold uppercase tracking-widest text-xs">Tax Invoice</span>
                         </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto max-h-[400px] custom-scrollbar">
                        <div className="space-y-6">
                            {cartItems.map((item, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#0a0a0a] overflow-hidden shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-white truncate uppercase italic">
                                            <span className="text-yellow-500 mr-1">{item.quantity}x</span> {item.name}
                                        </p>
                                        <p className="text-[9px] text-neutral-500 uppercase font-black">{item.selectedSize?.label}</p>
                                    </div>
                                    <span className="text-xs font-bold text-white whitespace-nowrap">Rs. {item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-[#0a0a0a] border-t border-white/5 space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-neutral-400 font-black uppercase text-[10px] tracking-[0.2em]">Grand Total</span>
                            <span className="text-xl font-black text-yellow-500">Rs. {total}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

