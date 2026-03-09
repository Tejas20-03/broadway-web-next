'use client'


import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2, TicketPercent, PlusCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { CartItem, ProductOption, Product } from '@/types';
import { useLocation } from '@/context/LocationContext';
import { useGetSuggestiveItemsQuery } from '@/store/apiSlice';
import type { SuggestiveItem } from '@/services/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  updateQuantity: (cartId: string, delta: number) => void;
  onCheckout: () => void;
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
  const [voucherError, setVoucherError] = useState(false);
  const { data: suggestiveItems = [] } = useGetSuggestiveItemsQuery(
    { city: location.city, area: location.area },
    { skip: !isOpen },
  );

  // Calculate Totals
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cartItems]);
  
  const tax = Math.round(subtotal * location.deliveryTax);
  const deliveryFee = location.deliveryFee;
  
  // Voucher Logic (Mock)
  const discount = appliedVoucher ? 250 : 0;
  const total = Math.max(0, subtotal + tax + deliveryFee - discount);

  // Filter out already-in-cart items from the API suggestive list
  const visibleSuggestive = useMemo(() => {
    const cartItemIds = new Set(cartItems.map(i => i.productId));
    return suggestiveItems.filter(s => !cartItemIds.has(s.itemId));
  }, [suggestiveItems, cartItems]);

  const handleApplyVoucher = () => {
    if (voucherCode.trim().length > 0) {
      setAppliedVoucher(voucherCode);
      setIsVoucherOpen(false);
      setVoucherError(false);
    } else {
      setVoucherError(true);
    }
  };

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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[250] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer - Higher Z-index than Modal */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-[#0a0a0a] border-l border-white/10 z-[300] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-slide-in">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#121212]">
          <div className="flex items-center gap-3">
            <div className="relative">
                <ShoppingBag className="text-yellow-500" size={24} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#121212]">
                    {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase italic">Order Summary</h2>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="p-6 space-y-6">
            {cartItems.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                    <ShoppingBag size={64} className="text-neutral-600" />
                    <p className="text-neutral-400 font-medium">Your cart is empty</p>
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
                            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10 relative">
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
                                        <h3 className="font-bold text-white text-sm truncate pr-2">{item.name}</h3>
                                        <span className="font-bold text-yellow-500 text-sm whitespace-nowrap">Rs. {item.price * item.quantity}</span>
                                    </div>
                                    <div className="text-[10px] text-neutral-500 leading-tight">
                                        {item.selectedSize && <span>{item.selectedSize.label}</span>}
                                        {allOptions.length > 0 && (
                                            <span> • {allOptions.map(o => o.name).join(', ')}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-lg p-1 w-fit mt-2 border border-white/5">
                                    <button 
                                        onClick={() => updateQuantity(item.cartId, -1)}
                                        className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                    >
                                        {item.quantity === 1 ? <Trash2 size={14} className="text-red-500" /> : <Minus size={14} />}
                                    </button>
                                    <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                                    <button 
                                        onClick={() => updateQuantity(item.cartId, 1)}
                                        className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 rounded transition-colors"
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
              <div className="mt-auto border-t border-dashed border-white/10 pt-6 pb-6 bg-[#0e0e0e]">
                  <div className="px-6 mb-3 flex items-center gap-2">
                      <PlusCircle size={16} className="text-yellow-500" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Complete your meal</h3>
                  </div>
                  <div className="flex overflow-x-auto gap-3 px-6 pb-2 no-scrollbar snap-x">
                      {visibleSuggestive.map(item => (
                          <div 
                            key={item.itemId} 
                            className="snap-start shrink-0 w-36 bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5 flex flex-col group cursor-pointer hover:border-yellow-500/50 transition-colors"
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
                                  <h4 className="text-xs font-bold text-white line-clamp-1 mb-1">{item.name}</h4>
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
          <div className="bg-[#121212] border-t border-white/10 p-6 space-y-4 shrink-0 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] z-20">
            <div className="border border-dashed border-white/20 rounded-xl overflow-hidden bg-[#0a0a0a] transition-all duration-300">
                {!isVoucherOpen && !appliedVoucher ? (
                    <button 
                        onClick={() => setIsVoucherOpen(true)}
                        className="w-full py-3 px-4 flex items-center justify-between text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
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
                                <span className="text-sm font-bold text-white uppercase tracking-wider">{appliedVoucher}</span>
                                <span className="text-[10px] text-green-500 font-bold">Coupon Applied</span>
                            </div>
                        </div>
                        <button onClick={() => setAppliedVoucher(null)} className="text-xs text-neutral-500 hover:text-white underline">Remove</button>
                    </div>
                ) : (
                    <div className="p-2 flex gap-2 animate-in slide-in-from-top-2">
                        <input 
                            type="text" 
                            autoFocus
                            placeholder="Enter Code" 
                            className={`flex-1 bg-[#1a1a1a] border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 uppercase placeholder:normal-case ${voucherError ? 'border-red-500' : 'border-white/10'}`}
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value)}
                        />
                        <button 
                            onClick={handleApplyVoucher}
                            className="bg-white text-black font-bold px-4 rounded-lg text-sm hover:bg-neutral-200 transition-colors"
                        >
                            Apply
                        </button>
                        <button 
                            onClick={() => { setIsVoucherOpen(false); setVoucherError(false); }}
                            className="p-2 text-neutral-500 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span>Rs. {subtotal}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Tax (16%)</span>
                <span>Rs. {tax}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Delivery Fee</span>
                <span>Rs. {deliveryFee}</span>
              </div>
              {appliedVoucher && (
                  <div className="flex justify-between text-green-500 font-bold animate-in slide-in-from-right">
                    <span>Voucher Discount</span>
                    <span>- Rs. {discount}</span>
                  </div>
              )}
              <div className="flex justify-between items-end text-white pt-3 border-t border-white/10 mt-2">
                <span className="font-medium text-neutral-400 uppercase tracking-widest text-[10px] font-black">Total Payable</span>
                <span className="font-black text-2xl text-yellow-500">Rs. {total}</span>
              </div>
            </div>

            <button 
                onClick={onCheckout}
                className="w-full bg-yellow-500 text-white font-black text-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 transition-all hover:scale-[1.01] shadow-[0_4px_20px_rgba(234,179,8,0.2)]"
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

