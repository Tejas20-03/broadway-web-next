'use client'


import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2, TicketPercent, PlusCircle, CheckCircle2, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { CartItem, ProductOption, Product } from '@/types';
import { useLocation } from '@/context/LocationContext';
import { useGetSuggestiveItemsQuery, useCheckVoucherMutation } from '@/store/apiSlice';
import type { SuggestiveItem } from '@/services/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  updateQuantity: (cartId: string, delta: number) => void;
  onCheckout: (voucherCode: string, voucherAmount: number) => void;
  products: Product[];
  onAddToCart: (item: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  updateQuantity, 
  onCheckout,
  products,
  onAddToCart
}) => {
  const { location } = useLocation();
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [appliedVoucherAmount, setAppliedVoucherAmount] = useState(0);
  const [voucherError, setVoucherError] = useState('');
  const drawerRef = React.useRef<HTMLDivElement>(null);

  // Reset voucher state whenever the cart becomes empty (e.g. after order placed)
  useEffect(() => {
    if (cartItems.length === 0) {
      setAppliedVoucher(null);
      setAppliedVoucherAmount(0);
      setVoucherCode('');
      setIsVoucherOpen(false);
      setVoucherError('');
    }
  }, [cartItems.length]);
  const [checkVoucher, { isLoading: isCheckingVoucher }] = useCheckVoucherMutation();
  const { data: suggestiveItems = [] } = useGetSuggestiveItemsQuery(
    { city: location.city, area: location.area },
    { skip: !isOpen },
  );

  // Calculate Totals — matching Cordova logic:
  // Prices are tax-inclusive (GST is embedded in the product prices).
  // Tax is extracted purely for breakdown display, NOT added on top.
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cartItems]);

  // For pickup orders delivery fee is always 0 (Cordova: appDeliveryFeeCurrent = 0 for Pickup)
  const deliveryFee = location.orderType === 'pickup' ? 0 : location.deliveryFee;

  // Voucher discount applied before totalling (matching Cordova: totalPc = totalPc - vouch)
  const discount = appliedVoucherAmount;

  // Effective cart value after voucher discount
  const effectiveSubtotal = Math.max(0, subtotal - discount);

  // GST breakdown (informational — tax is already included in prices, not added on top)
  // Normalize: API returns decimal (0.15) but old persisted state may store whole number (15)
  const taxRate = location.deliveryTax >= 1 ? location.deliveryTax / 100 : location.deliveryTax;
  const taxBreakdown = Math.round(effectiveSubtotal * taxRate);


  // Total payable = food total (tax-inclusive) + delivery fee
  const total = effectiveSubtotal + deliveryFee;

  // Filter out already-in-cart items from the API suggestive list
  const visibleSuggestive = useMemo(() => {
    const cartItemIds = new Set(cartItems.map(i => i.productId));
    return suggestiveItems.filter(s => !cartItemIds.has(s.itemId));
  }, [suggestiveItems, cartItems]);

  const handleApplyVoucher = async () => {
    const code = voucherCode.trim();
    if (!code) { setVoucherError('Please enter a voucher code.'); return; }
    setVoucherError('');
    const cartData = cartItems.map(i => ({
      ItemID: i.productId,
      ProductName: i.name,
      Quantity: i.quantity,
      Price: i.price,
      TotalProductPrice: i.price * i.quantity,
      options: i.selectedOptions
        ? Object.values(i.selectedOptions).flat().map(o => ({ OptionName: o.name, Price: o.price }))
        : [],
    }));
    const locationData = {
      ordertype: location.orderType === 'pickup' ? 'Pickup' : 'Delivery',
      city: location.city,
      area: location.area,
      outlet: location.outlet ?? null,
    };
    try {
      const result = await checkVoucher({ voucherCode: code, locationData, cartData }).unwrap();
      if (result.valid) {
        setAppliedVoucher(code);
        setAppliedVoucherAmount(result.amount);
        setIsVoucherOpen(false);
        setVoucherCode('');
      } else {
        setVoucherError(result.message ?? 'Invalid voucher code.');
      }
    } catch {
      setVoucherError('Could not validate voucher. Please try again.');
    }
  };

  // Minimum order enforcement — Cordova: allowOrder = totalPrice >= minDelivery
  // For pickup, Cordova hardcodes minDelivery = 49
  const minDelivery = location.orderType === 'pickup'
    ? 49
    : cartItems.reduce((max, i) => Math.max(max, i.minimumDelivery ?? 0), 0);
  const allowOrder = cartItems.length === 0 || effectiveSubtotal >= minDelivery;

  const handleQuickAdd = (item: SuggestiveItem) => {
    onAddToCart({
      productId: item.itemId,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: 1,
      selectedSize: null,
      selectedOptions: {},
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    drawerRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !drawerRef.current) return;

      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-white/70 dark:bg-black/80 backdrop-blur-md z-[250] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer - Higher Z-index than Modal */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        tabIndex={-1}
        className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white dark:bg-[#0a0a0a] border-l border-neutral-200 dark:border-white/10 z-[300] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-slide-in focus:outline-none"
      >
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between bg-neutral-100 dark:bg-[#121212]">
          <div className="flex items-center gap-3">
            <div className="relative">
                <ShoppingBag className="text-yellow-500" size={24} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#121212]">
                    {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
            </div>
            <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight uppercase italic">Order Summary</h2>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-900 dark:text-white rounded-full hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="p-6 space-y-6">
            {cartItems.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                    <ShoppingBag size={64} className="text-neutral-600" />
                    <p className="text-neutral-600 dark:text-neutral-400 font-medium">Your cart is empty</p>
                    <button onClick={onClose} className="text-yellow-500 font-bold hover:underline">
                        Explore Menu
                    </button>
                </div>
            ) : (
                cartItems.map((item) => {
                    const allOptions = item.selectedOptions 
                        ? (Object.values(item.selectedOptions) as ProductOption[][]).reduce<ProductOption[]>((acc, curr) => acc.concat(curr), []) 
                        : [];

                    return (
                        <div key={item.cartId} className="flex gap-4 group">
                            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-neutral-200 dark:border-white/10 relative">
                                <Image
                                    src={item.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591'}
                                    alt={item.name}
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-neutral-900 dark:text-white text-sm truncate pr-2">{item.name}</h3>
                                        <span className="font-bold text-yellow-500 text-sm whitespace-nowrap">Rs. {item.price * item.quantity}</span>
                                    </div>
                                    <div className="text-[10px] text-neutral-500 leading-tight">
                                        {item.selectedSize && <span>{item.selectedSize.label}</span>}
                                        {allOptions.length > 0 && (
                                            <span> • {allOptions.map(o => o.name).join(', ')}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-neutral-100 dark:bg-[#1a1a1a] rounded-lg p-1 w-fit mt-2 border border-neutral-200 dark:border-white/5">
                                    <button 
                                        onClick={() => updateQuantity(item.cartId, -1)}
                                        className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/10 rounded transition-colors"
                                    >
                                        {item.quantity === 1 ? <Trash2 size={14} className="text-red-500" /> : <Minus size={14} />}
                                    </button>
                                    <span className="text-xs font-bold text-neutral-900 dark:text-white w-4 text-center">{item.quantity}</span>
                                    <button 
                                        onClick={() => updateQuantity(item.cartId, 1)}
                                        className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/10 rounded transition-colors"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
          </div>

          {cartItems.length > 0 && visibleSuggestive.length > 0 && (
              <div className="mt-auto border-t border-dashed border-neutral-200 dark:border-white/10 pt-6 pb-6 bg-neutral-50 dark:bg-[#0e0e0e]">
                  <div className="px-6 mb-3 flex items-center gap-2">
                      <PlusCircle size={16} className="text-yellow-500" />
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Complete your meal</h3>
                  </div>
                  <div className="flex overflow-x-auto gap-3 px-6 pb-2 no-scrollbar snap-x">
                      {visibleSuggestive.map(item => (
                          <div 
                            key={item.itemId} 
                            className="snap-start shrink-0 w-36 bg-neutral-100 dark:bg-[#1a1a1a] rounded-xl overflow-hidden border border-neutral-200 dark:border-white/5 flex flex-col group cursor-pointer hover:border-yellow-500/50 transition-colors"
                            onClick={() => handleQuickAdd(item)}
                          >
                              <div className="h-24 w-full relative">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    sizes="144px"
                                    className="object-cover"
                                  />
                                    <div className="absolute top-1 right-1 bg-black/60 backdrop-blur rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Plus size={14} strokeWidth={3} />
                                  </div>
                              </div>
                              <div className="p-2.5 flex flex-col flex-1">
                                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1 mb-1">{item.name}</h4>
                                  <div className="mt-auto flex justify-between items-center">
                                      <span className="text-xs font-bold text-yellow-500">Rs. {item.price}</span>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="bg-neutral-100 dark:bg-[#121212] border-t border-neutral-200 dark:border-white/10 p-6 space-y-4 shrink-0 shadow-[0_-5px_20px_rgba(148,163,184,0.25)] dark:shadow-[0_-5px_20px_rgba(0,0,0,0.5)] z-20">
            <div className="border border-dashed border-neutral-300 dark:border-white/20 rounded-xl overflow-hidden bg-white dark:bg-[#0a0a0a] transition-all duration-300">
                {!isVoucherOpen && !appliedVoucher ? (
                    <button 
                        onClick={() => setIsVoucherOpen(true)}
                        className="w-full py-3 px-4 flex items-center justify-between text-neutral-400 hover:text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <TicketPercent size={18} className="text-yellow-500" />
                            <span className="text-sm font-bold">Have a voucher code?</span>
                        </div>
                        <ChevronRight size={16} />
                    </button>
                ) : appliedVoucher ? (
                    <div className="w-full py-3 px-4 flex items-center justify-between bg-green-500/10 border-l-4 border-green-500">
                         <div className="flex items-center gap-2">
                            <CheckCircle2 size={18} className="text-green-500" />
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">{appliedVoucher}</span>
                                <span className="text-[10px] text-green-500 font-bold">Coupon Applied</span>
                            </div>
                        </div>
                        <button onClick={() => { setAppliedVoucher(null); setAppliedVoucherAmount(0); }} className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline">Remove</button>
                    </div>
                ) : (
                    <div className="p-2 flex flex-col gap-2 animate-in slide-in-from-top-2">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                autoFocus
                                placeholder="Enter Code" 
                                className={`flex-1 bg-neutral-100 dark:bg-[#1a1a1a] border rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-yellow-500 uppercase placeholder:normal-case ${voucherError ? 'border-red-500' : 'border-neutral-200 dark:border-white/10'}`}
                                value={voucherCode}
                                onChange={(e) => { setVoucherCode(e.target.value); if (voucherError) setVoucherError(''); }}
                                onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
                            />
                            <button 
                                onClick={handleApplyVoucher}
                                disabled={isCheckingVoucher}
                                className="bg-white text-black font-bold px-4 rounded-lg text-sm hover:bg-neutral-200 transition-colors disabled:opacity-60 flex items-center gap-1"
                            >
                                {isCheckingVoucher ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                            </button>
                            <button 
                                onClick={() => { setIsVoucherOpen(false); setVoucherError(''); }}
                                className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        {voucherError && (
                            <div className="flex items-center gap-1.5 text-red-400 text-xs px-1">
                                <AlertCircle size={12} />
                                <span>{voucherError}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-neutral-400">
                <span>Items Total</span>
                <span>Rs. {subtotal}</span>
              </div>
              {appliedVoucher && (
                  <div className="flex justify-between text-green-500 font-bold animate-in slide-in-from-right">
                    <span>Voucher ({appliedVoucher})</span>
                    <span>- Rs. {discount}</span>
                  </div>
              )}
              {taxRate > 0 && (
                <div className="flex justify-between text-neutral-500 text-xs">
                  <span>Incl. GST ({Math.round(taxRate * 100)}%)</span>
                  <span>Rs. {taxBreakdown}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-400">
                <span>Delivery Fee</span>
                <span>{deliveryFee > 0 ? `Rs. ${deliveryFee}` : 'Free'}</span>
              </div>
              <div className="flex justify-between items-end text-neutral-900 dark:text-white pt-3 border-t border-neutral-200 dark:border-white/10 mt-2">
                <span className="font-medium text-neutral-400 uppercase tracking-widest text-[10px] font-black">Total Payable</span>
                <span className="font-black text-2xl text-yellow-500">Rs. {total}</span>
              </div>
            </div>

            {!allowOrder && cartItems.length > 0 && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-xs font-bold">
                <AlertCircle size={14} className="shrink-0" />
                <span>Minimum order of Rs. {minDelivery} required. Add more items to proceed.</span>
              </div>
            )}

            <button 
                onClick={() => onCheckout(appliedVoucher ?? '', appliedVoucherAmount)}
                disabled={!allowOrder}
                className="w-full bg-yellow-500 text-neutral-900 dark:text-white font-black text-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 transition-all hover:scale-[1.01] shadow-[0_4px_20px_rgba(234,179,8,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-yellow-500"
            >
              <span>CHECKOUT</span>
              <ArrowRight size={20} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};




