'use client'

import React, { useState, useEffect } from 'react';
import { X, MapPin, Bike, ShoppingBag, ChevronRight, Clock, Navigation, Loader2, Phone, ArrowLeft } from 'lucide-react';
import { CitySelectionModal } from './CitySelectionModal';
import { AreaSelectionModal } from './AreaSelectionModal';
import { useLocation } from '@/context/LocationContext';
import { useUser } from '@/context/UserContext';
import { useAreas, usePickupOutlets } from '@/hooks/useAreas';
import { useLazyGetPendingOrdersQuery } from '@/store/apiSlice';
import type { PendingOrder } from '@/services/api';
import { OrderType } from '@/types';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  onPendingOrders?: (orders: PendingOrder[]) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, onOpenLogin, onPendingOrders }) => {
  const { location, setOrderType, setCity, setArea, setOutlet } = useLocation();
  const { user } = useUser();

  // Local draft state — only committed to context on Save
  const [mode, setMode] = useState<OrderType>(location.orderType);
  const [draftCity, setDraftCity] = useState(location.city);
  const [draftArea, setDraftArea] = useState(location.area);
  const [draftOutlet, setDraftOutlet] = useState(location.outlet);
  const [draftOutletId, setDraftOutletId] = useState(location.outletId);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [areaSearch, setAreaSearch] = useState('');
  const [step, setStep] = useState<'location' | 'phone'>('location');
  const [phoneInput, setPhoneInput] = useState('');
  const [checkingOrders, setCheckingOrders] = useState(false);
  const [triggerPendingOrders] = useLazyGetPendingOrdersQuery();

  // Reset draft when modal opens to match current context value
  useEffect(() => {
    if (isOpen) {
      setMode(location.orderType);
      setDraftCity(location.city);
      setDraftArea(location.area);
      setDraftOutlet(location.outlet);
      setDraftOutletId(location.outletId);
      setAreaSearch('');
      setStep('location');
      setPhoneInput('');
      setIsAreaModalOpen(false);
    }
  }, [isOpen, location]);

  // Fetch areas / outlets live from API based on draft city
  const { areas, isLoading: areasLoading } = useAreas(mode === 'delivery' ? draftCity : '');
  const { outlets, isLoading: outletsLoading } = usePickupOutlets(mode === 'pickup' ? draftCity : '');

  const filteredAreas = areas.filter(a =>
    a.name.toLowerCase().includes(areaSearch.toLowerCase())
  );

  const commitLocation = () => {
    setOrderType(mode);
    setCity(draftCity);
    if (mode === 'delivery') setArea(draftArea);
    else setOutlet(draftOutlet, draftOutletId);
  };

  const handleSave = async () => {
    commitLocation();
    if (user?.phone) {
      // Logged in — fetch pending orders silently and close
      const { data: orders = [] } = await triggerPendingOrders(user.phone);
      onPendingOrders?.(orders);
      onClose();
    } else {
      // Guest — ask for phone to check pending orders
      setStep('phone');
    }
  };

  const handlePhoneSubmit = async () => {
    const phone = phoneInput.trim();
    if (!phone) { onClose(); return; }
    setCheckingOrders(true);
    const { data: orders = [] } = await triggerPendingOrders(phone);
    onPendingOrders?.(orders);
    setCheckingOrders(false);
    onClose();
  };

  if (!isOpen) return null;

  const displayLocation = mode === 'delivery'
    ? `${draftCity}${draftArea ? ` — ${draftArea}` : ''}`
    : `${draftOutlet || draftCity}`;

  // ── Phone step (guest only) ────────────────────────────────────────
  if (step === 'phone') {
    return (
      <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full md:max-w-md bg-[#0a0a0a] md:rounded-3xl shadow-2xl border-0 md:border border-white/10 overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5 bg-[#121212]">
            <button onClick={() => setStep('location')} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Check Your Orders</h2>
              <p className="text-neutral-500 text-xs">Location saved — enter your number to track active orders</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="tel"
                autoFocus
                placeholder="e.g. 03001234567"
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePhoneSubmit()}
                className="w-full bg-[#1a1a1a] border border-white/10 focus:border-yellow-500/50 rounded-xl py-4 pl-11 pr-4 text-white placeholder:text-neutral-600 outline-none transition-all"
              />
            </div>
            <button
              onClick={handlePhoneSubmit}
              disabled={checkingOrders || phoneInput.trim().length < 10}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {checkingOrders ? <Loader2 size={18} className="animate-spin" /> : <Phone size={18} />}
              {checkingOrders ? 'Checking...' : 'Check My Orders'}
            </button>
            <button onClick={onClose} className="w-full py-3 text-neutral-500 hover:text-white text-sm font-bold transition-colors">
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          onClick={onClose}
        />

        {/* Modal Container */}
        <div className="relative w-full h-[100dvh] md:h-auto md:max-w-2xl bg-[#0a0a0a] md:rounded-3xl shadow-2xl overflow-hidden md:border border-white/10 flex flex-col md:max-h-[90vh] animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#121212] shrink-0 pt-safe-top">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">
                {mode === 'delivery' ? 'Delivery Location' : 'Pickup Point'}
              </h2>
              <div className="flex items-center gap-1.5 text-neutral-500">
                <MapPin size={12} className="text-yellow-500" />
                <span className="text-xs font-bold tracking-wide uppercase">Select your area</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors border border-white/5"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#0a0a0a] to-[#111] p-6 md:p-8">

            {/* Current Selection Badge */}
            <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4">
              <p className="text-yellow-500 text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                {mode === 'delivery' ? 'Delivering To' : 'Picking Up From'}
              </p>
              <div className="flex items-center gap-2 text-white font-medium text-sm">
                <MapPin size={16} className="text-yellow-500 shrink-0" />
                <span className="line-clamp-1">{displayLocation || 'Not selected yet'}</span>
              </div>
            </div>

            {/* Delivery / Pickup Toggle */}
            <div className="grid grid-cols-2 p-1.5 bg-[#1a1a1a] rounded-2xl mb-6 border border-white/5">
              <button
                onClick={() => setMode('delivery')}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all duration-300 ${
                  mode === 'delivery' ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20' : 'text-neutral-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <Bike size={18} strokeWidth={2.5} />
                <span>DELIVERY</span>
              </button>
              <button
                onClick={() => setMode('pickup')}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all duration-300 ${
                  mode === 'pickup' ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20' : 'text-neutral-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShoppingBag size={18} strokeWidth={2.5} />
                <span>PICKUP</span>
              </button>
            </div>

            {/* Login nudge */}
            <p className="text-neutral-500 text-xs mb-6 leading-relaxed">
              <button
                onClick={() => { onClose(); onOpenLogin(); }}
                className="text-green-500 font-bold hover:underline"
              >
                Login
              </button>{' '}
              to save your address for faster checkout.
            </p>

            {/* City Row */}
            <div
              onClick={() => setIsCityModalOpen(true)}
              className="group w-full bg-[#0a0a0a] border border-white/10 hover:border-yellow-500/50 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all mb-4"
            >
              <div>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">City</p>
                <p className="text-white font-bold">{draftCity}</p>
              </div>
              <ChevronRight size={16} className="text-neutral-500 group-hover:text-yellow-500 transition-colors" />
            </div>

            {/* Area Row (delivery) */}
            {mode === 'delivery' && (
              <div
                onClick={() => setIsAreaModalOpen(true)}
                className="group w-full bg-[#0a0a0a] border border-white/10 hover:border-yellow-500/50 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all mb-4"
              >
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">Area</p>
                  {areasLoading ? (
                    <div className="flex items-center gap-2 text-neutral-500">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-sm">Loading areas...</span>
                    </div>
                  ) : (
                    <p className={`font-bold ${draftArea ? 'text-white' : 'text-neutral-500'}`}>
                      {draftArea || 'Select area'}
                    </p>
                  )}
                </div>
                <ChevronRight size={16} className="text-neutral-500 group-hover:text-yellow-500 transition-colors" />
              </div>
            )}

            {/* Outlet list (pickup) */}
            {mode === 'pickup' && (
              <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {outletsLoading ? (
                  <div className="flex items-center justify-center py-8 text-neutral-500">
                    <Loader2 size={20} className="animate-spin mr-2" /> Loading outlets...
                  </div>
                ) : (
                  outlets.map(outlet => (
                    <button
                      key={outlet.id}
                      onClick={() => { setDraftOutlet(outlet.name); setDraftOutletId(outlet.id); }}
                      className={`w-full flex flex-col items-start px-4 py-3 rounded-xl text-sm transition-all ${
                        draftOutletId === outlet.id
                          ? 'bg-yellow-500 text-white'
                          : 'bg-[#1a1a1a] text-neutral-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="font-bold">{outlet.name}</span>
                      {outlet.address && (
                        <span className="text-[11px] opacity-70 mt-0.5">{outlet.address}</span>
                      )}
                    </button>
                  ))
                )}
                {outlets.length === 0 && !outletsLoading && (
                  <p className="text-center text-neutral-600 py-4 text-sm">No outlets found</p>
                )}
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={mode === 'delivery' ? !draftArea : !draftOutletId}
              className="w-full mt-6 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
            >
              <Navigation size={20} fill="white" strokeWidth={0} />
              SAVE LOCATION
            </button>

            {/* Delivery promise */}
            <div className="mt-8 flex items-center justify-center gap-6 opacity-70 select-none pb-safe-bottom">
              <div className="flex flex-col items-end border-r border-white/10 pr-6">
                <span className="text-white font-black text-2xl italic leading-none tracking-tighter">OPEN</span>
                <span className="text-yellow-500 font-black text-3xl italic leading-none tracking-tighter">24/7</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={24} className="text-yellow-500" strokeWidth={2.5} />
                <div>
                  <span className="text-white font-black text-3xl italic leading-none tracking-tighter">
                    30<span className="text-base align-top ml-0.5 not-italic font-bold text-neutral-400">mins</span>
                  </span>
                  <p className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em]">Delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CitySelectionModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        onSelect={(city) => { setDraftCity(city); setDraftArea(''); setDraftOutlet(''); setDraftOutletId(''); }}
        currentCity={draftCity}
      />

      <AreaSelectionModal
        isOpen={isAreaModalOpen}
        onClose={() => setIsAreaModalOpen(false)}
        onSelect={setDraftArea}
        currentArea={draftArea}
        areas={areas}
        isLoading={areasLoading}
      />
    </>
  );
};


