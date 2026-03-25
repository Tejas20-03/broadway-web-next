'use client'

import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Bike, ShoppingBag, ChevronRight, Clock, Navigation, Loader2, Phone, ArrowLeft, Search, Check, LocateFixed, Trash2 } from 'lucide-react';
import { CitySelectionModal } from './CitySelectionModal';
import { AreaSelectionModal } from './AreaSelectionModal';
import { OpenStreetMapPickerModal } from './OpenStreetMapPickerModal';
import { useLocation } from '@/context/LocationContext';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { useAreas, usePickupOutlets } from '@/hooks/useAreas';
import { useLazyGetPendingOrdersQuery, useGetCitiesQuery, useGetSavedAddressesQuery, useDeleteSavedAddressMutation, broadwayApi } from '@/store/apiSlice';
import { useAppDispatch } from '@/store';
import { userActions } from '@/store/slices/userSlice';
import type { PendingOrder, SavedAddress } from '@/services/api';
import { fetchGeoCodeArea } from '@/services/api';
import { OrderType } from '@/types';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  onPendingOrders?: (orders: PendingOrder[]) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, onOpenLogin, onPendingOrders }) => {
  const { location, hasSetLocation, setOrderType, setCity, setArea, setOutlet, setDeliveryFees } = useLocation();
  const { cartItems, clearCart } = useCart();
  const { user } = useUser();
  const dispatch = useAppDispatch();

  // Local draft state — only committed to context on Save
  const [mode, setMode] = useState<OrderType>(location.orderType);
  const [draftCity, setDraftCity] = useState(hasSetLocation ? location.city : '');
  const [draftArea, setDraftArea] = useState(hasSetLocation ? location.area : '');
  const [draftOutlet, setDraftOutlet] = useState(hasSetLocation ? location.outlet : '');
  const [draftOutletId, setDraftOutletId] = useState(hasSetLocation ? location.outletId : '');
  const [draftPhone, setDraftPhone] = useState('');
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [areaSearch, setAreaSearch] = useState('');
  const [step, setStep] = useState<'location' | 'phone'>('location');
  const [phoneInput, setPhoneInput] = useState('');
  const [checkingOrders, setCheckingOrders] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [triggerPendingOrders] = useLazyGetPendingOrdersQuery();
  const [deleteSavedAddress] = useDeleteSavedAddressMutation();
  const phoneRef = useRef<HTMLInputElement>(null);

  // Cities for fee lookup
  const { data: cities = [] } = useGetCitiesQuery(undefined, { skip: !isOpen });
  const { data: savedAddresses = [], isFetching: savedAddressesLoading } = useGetSavedAddressesQuery(
    user?.phone ?? '',
    { skip: !isOpen || !user?.phone || mode !== 'delivery' },
  );

  // Reset draft when modal opens to match current context value
  useEffect(() => {
    if (isOpen) {
      setMode(location.orderType);
      setDraftCity(hasSetLocation ? location.city : '');
      setDraftArea(hasSetLocation ? location.area : '');
      setDraftOutlet(hasSetLocation ? location.outlet : '');
      setDraftOutletId(hasSetLocation ? location.outletId : '');
      setDraftPhone('');
      setAreaSearch('');
      setStep('location');
      setPhoneInput('');
      setIsAreaModalOpen(false);
      setGeoError('');
    }
  }, [isOpen, location, hasSetLocation]);

  // Fetch areas / outlets live from API based on draft city
  const { areas, isLoading: areasLoading } = useAreas(mode === 'delivery' ? draftCity : '');
  const { outlets, isLoading: outletsLoading } = usePickupOutlets(mode === 'pickup' ? draftCity : '');

  const applyGeoResult = (result: { city: string; area: string; outletId: string; outletName: string }) => {
    if (!result.city) {
      setGeoError('Could not detect your area. Please select manually.');
      return;
    }

    setDraftCity(result.city);
    if (mode === 'delivery' && result.area) {
      setDraftArea(result.area);
    } else if (mode === 'pickup' && result.outletId) {
      setDraftOutlet(result.outletName);
      setDraftOutletId(result.outletId);
    }
  };

  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchGeoCodeArea(pos.coords.latitude, pos.coords.longitude)
          .then((result) => {
            applyGeoResult(result);
          })
          .catch(() => {
            setGeoError('Location detection failed. Please select manually.');
          })
          .finally(() => {
            setGeoLoading(false);
          });
      },
      () => {
        setGeoError('Location permission denied. Please select manually.');
        setGeoLoading(false);
      },
      { timeout: 10000 },
    );
  };

  const handleMapSelect = async (lat: number, lng: number) => {
    setGeoLoading(true);
    setGeoError('');
    try {
      const result = await fetchGeoCodeArea(lat, lng);
      applyGeoResult(result);
      setIsMapPickerOpen(false);
    } catch {
      setGeoError('Could not map this location to our service area. Please try another pin.');
    } finally {
      setGeoLoading(false);
    }
  };

  const selectSavedAddress = (addr: SavedAddress) => {
    setMode('delivery');
    setDraftCity(addr.city || draftCity);
    setDraftArea(addr.area || draftArea);
  };

  const handleDeleteSavedAddress = async (addressId: string) => {
    setDeletingAddressId(addressId);
    try {
      await deleteSavedAddress(addressId).unwrap();
    } finally {
      setDeletingAddressId(null);
    }
  };

  const commitLocation = () => {
    setOrderType(mode);
    setCity(draftCity);
    if (mode === 'delivery') setArea(draftArea);
    else setOutlet(draftOutlet, draftOutletId);

    // Store delivery fee + tax from the selected city.
    // For pickup orders, delivery fee is always 0 (matching Cordova: appDeliveryFeeCurrent = 0 for Pickup).
    const cityData = cities.find(c => c.name === draftCity);
    if (cityData) {
      setDeliveryFees(
        mode === 'pickup' ? 0 : cityData.deliveryFees,
        cityData.deliveryTax,
      );
    }
  };

  const hasLocationChanged = () => {
    if (location.orderType !== mode) return true;
    if (location.city !== draftCity) return true;
    if (mode === 'delivery') return location.area !== draftArea;
    return location.outletId !== draftOutletId;
  };

  const handleSave = async () => {
    const locationChanged = hasLocationChanged();
    if (locationChanged && cartItems.length > 0) {
      const shouldClear = window.confirm(
        'Updating your pickup/delivery location will remove cart items. Do you want to continue?'
      );
      if (!shouldClear) return;
      clearCart();
    }

    commitLocation();

    // Prefetch banners and menu for the selected city/area so they load instantly
    dispatch(broadwayApi.util.prefetch('getBanners', draftCity, { force: true }));
    if (mode === 'delivery' && draftArea) {
      dispatch(broadwayApi.util.prefetch('getMenu', { city: draftCity, area: draftArea }, { force: true }));
    } else if (mode === 'pickup' && draftOutlet) {
      dispatch(broadwayApi.util.prefetch('getMenu', { city: draftCity, area: '', outlet: draftOutlet }, { force: true }));
    }

    // Persist guest phone to Redux + localStorage
    if (!user?.phone && draftPhone.trim()) {
      dispatch(userActions.setGuestPhone(draftPhone.trim()));
    }

    // Pickup: close immediately — no phone required
    if (mode === 'pickup') {
      onClose();
      return;
    }

    const phone = draftPhone.trim();
    if (user?.phone || phone) {
      const lookupPhone = user?.phone ?? phone;
      const { data: orders = [] } = await triggerPendingOrders(lookupPhone);
      onPendingOrders?.(orders);
      onClose();
    } else {
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

  const hasSelectedCity = draftCity.trim().length > 0;

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
            <div className="flex items-center gap-2">
              {/* Use My Location button */}
              <button
                onClick={handleGeoLocation}
                disabled={geoLoading}
                title="Use my current location"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 text-xs font-black uppercase tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {geoLoading ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
                <span className="hidden sm:inline">{geoLoading ? 'Locating...' : 'Use Location'}</span>
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors border border-white/5"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#0a0a0a] to-[#111] p-6 md:p-8">

            {/* Geo error */}
            {geoError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                {geoError}
              </div>
            )}

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

            {/* Login nudge for guests only */}
            {!user?.phone && (
              <p className="text-neutral-500 text-xs mb-6 leading-relaxed">
                <button
                  onClick={() => { onClose(); onOpenLogin(); }}
                  className="text-green-500 font-bold hover:underline"
                >
                  Login
                </button>{' '}
                to save your address for faster checkout.
              </p>
            )}

            {/* City Row */}
            <div
              onClick={() => setIsCityModalOpen(true)}
              className="group w-full bg-[#0a0a0a] border border-white/10 hover:border-yellow-500/50 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all mb-4"
            >
              <div>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">City</p>
                <p className={`font-bold ${hasSelectedCity ? 'text-white' : 'text-neutral-500'}`}>
                  {draftCity || 'Select'}
                </p>
              </div>
              <ChevronRight size={16} className="text-neutral-500 group-hover:text-yellow-500 transition-colors" />
            </div>

            {/* Area Row (delivery) */}
            {mode === 'delivery' && hasSelectedCity && (
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

            {mode === 'delivery' && !!user?.phone && (
              <div className="mb-4 rounded-xl border border-white/10 bg-[#0a0a0a] p-4">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Saved Addresses</p>
                {savedAddressesLoading ? (
                  <div className="text-sm text-neutral-500 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Loading saved addresses...
                  </div>
                ) : savedAddresses.length === 0 ? (
                  <p className="text-sm text-neutral-500">No saved addresses found.</p>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                    {savedAddresses.map((addr) => {
                      const active = draftCity === addr.city && draftArea === addr.area;
                      return (
                        <div
                          key={addr.id}
                          className={`rounded-xl border p-3 transition-all ${active ? 'border-yellow-500/40 bg-yellow-500/10' : 'border-white/10 bg-white/0'}`}
                        >
                          <button
                            onClick={() => selectSavedAddress(addr)}
                            className="w-full text-left"
                          >
                            <p className="text-white font-bold text-sm">{addr.city}{addr.area ? `, ${addr.area}` : ''}</p>
                            <p className="text-neutral-400 text-xs line-clamp-1">{addr.address || 'Address not provided'}</p>
                          </button>
                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={() => handleDeleteSavedAddress(addr.id)}
                              disabled={deletingAddressId === addr.id}
                              className="px-2 py-1 rounded-lg text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-60 flex items-center gap-1"
                            >
                              {deletingAddressId === addr.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Phone Number Row — delivery only */}
            {!user?.phone && mode === 'delivery' && (
              <div className="w-full bg-[#0a0a0a] border border-white/10 focus-within:border-yellow-500/50 rounded-xl p-4 flex items-center gap-3 mb-4 transition-all">
                <Phone size={16} className="text-neutral-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">Phone Number</p>
                  <input
                    ref={phoneRef}
                    type="tel"
                    placeholder="e.g. 03001234567"
                    value={draftPhone}
                    onChange={e => setDraftPhone(e.target.value)}
                    className="w-full bg-transparent text-white font-bold placeholder:text-neutral-600 outline-none text-sm"
                  />
                </div>
              </div>
            )}

            {/* Outlet list (pickup) */}
            {mode === 'pickup' && (
              <>
                {/* Outlet search */}
                <div className="relative group mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors" size={16} />
                  <input
                    type="text"
                    placeholder="Search outlet..."
                    value={areaSearch}
                    onChange={e => setAreaSearch(e.target.value)}
                    className="w-full bg-[#1a1a1a] text-white pl-9 pr-4 py-3 rounded-xl border border-white/10 focus:border-yellow-500/50 outline-none transition-all placeholder:text-neutral-600 font-medium text-sm"
                  />
                </div>
                <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                  {outletsLoading ? (
                    <div className="flex items-center justify-center py-8 text-neutral-500">
                      <Loader2 size={20} className="animate-spin mr-2" /> Loading outlets...
                    </div>
                  ) : (
                    outlets
                      .filter(o => o.name.toLowerCase().includes(areaSearch.toLowerCase()))
                      .map(outlet => {
                        const isSelected = draftOutletId === outlet.id;
                        return (
                          <button
                            key={outlet.id}
                            onClick={() => { setDraftOutlet(outlet.name); setDraftOutletId(outlet.id); }}
                            className={`
                              w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group
                              ${isSelected
                                ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/30'
                                : 'hover:bg-white/5 border border-transparent'}
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-white/5 border border-white/10'}`}>
                                <ShoppingBag size={14} className={isSelected ? 'text-yellow-500' : 'text-neutral-500 group-hover:text-neutral-300'} />
                              </div>
                              <span className={`font-bold text-sm tracking-tight ${isSelected ? 'text-white' : 'text-neutral-400 group-hover:text-white'} transition-colors`}>
                                {outlet.name}
                              </span>
                            </div>
                            {isSelected && <Check size={18} className="text-yellow-500 animate-in slide-in-from-right-2 fade-in duration-300 shrink-0" />}
                          </button>
                        );
                      })
                  )}
                  {outlets.length === 0 && !outletsLoading && (
                    <p className="text-center text-neutral-600 py-4 text-sm">No outlets found</p>
                  )}
                </div>
              </>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={(mode === 'delivery' ? (!hasSelectedCity || !draftArea || (!user?.phone && draftPhone.trim().length < 10)) : (!hasSelectedCity || !draftOutletId))}
              className="w-full mt-6 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
            >
              <Navigation size={20} fill="white" strokeWidth={0} />
              SAVE LOCATION
            </button>

            {hasLocationChanged() && cartItems.length > 0 && (
              <div className="mt-3 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs font-bold">
                Switching location will clear cart items.
              </div>
            )}

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
        onSelect={(city) => {
          setDraftCity(city);
          setDraftArea('');
          setDraftOutlet('');
          setDraftOutletId('');
          setIsCityModalOpen(false);
          if (mode === 'delivery') setIsAreaModalOpen(true);
        }}
        currentCity={draftCity}
      />

      <AreaSelectionModal
        isOpen={isAreaModalOpen}
        onClose={() => setIsAreaModalOpen(false)}
        onSelect={(area) => {
          setDraftArea(area);
          setIsAreaModalOpen(false);
          setTimeout(() => phoneRef.current?.focus(), 100);
        }}
        currentArea={draftArea}
        areas={areas}
        isLoading={areasLoading}
      />

      <OpenStreetMapPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        onSelect={handleMapSelect}
      />
    </>
  );
};


