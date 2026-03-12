'use client'

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Check, Clock, MapPin, Home, Copy, Bike, ChefHat, ShoppingBag, Receipt, Phone, RotateCcw, XCircle } from 'lucide-react';
import { useGetOrderStatusQuery, useGetReOrderDetailsQuery } from '@/store/apiSlice';
import { useAppDispatch } from '@/store';
import { cartActions } from '@/store/slices/cartSlice';

interface OrderConfirmationPageProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  encOrderId?: string;
  orderAddress?: string;
  orderType?: string;
}

// Derive visual phase from Cordova status + time math (mirrors thankyou.html logic).
// "Confirmed" means the kitchen acknowledged — we then use elapsed time to sub-divide.
function derivePhase(
  status: string,
  deliveryTimeMins: number,
  orderCreated: string,
  isPickup: boolean,
): 'pending' | 'preparing' | 'onTheWay' | 'delivered' | 'rejected' {
  if (status === 'Rejected') return 'rejected';
  if (status !== 'Confirmed') return 'pending';

  // Cordova: cookingTime = deliveryTime / 2
  const cookingMs = (deliveryTimeMins / 2) * 60 * 1000;
  const deliveryMs = (deliveryTimeMins + 10) * 60 * 1000;

  const orderTime = orderCreated ? new Date(orderCreated).getTime() : 0;
  if (!orderTime) return 'preparing';

  const elapsed = Date.now() - orderTime;

  if (elapsed >= deliveryMs) return 'delivered';
  if (elapsed >= cookingMs) return 'onTheWay';
  return 'preparing';
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  isOpen, onClose,
  orderId, encOrderId, orderAddress, orderType = 'delivery',
}) => {
  // Poll live status every 2 s, matching Cordova's setInterval(checkDeliveryStatus, 2000)
  const { data: orderStatus } = useGetOrderStatusQuery(encOrderId ?? '', {
    skip: !encOrderId,
    pollingInterval: 2000,
  });

  // Fetch full order receipt from ReOrderV1
  const { data: reOrderData } = useGetReOrderDetailsQuery(encOrderId ?? '', {
    skip: !encOrderId,
  });

  // Use live reOrderData.orderType when available; fall back to prop for initial render
  const isPickup = reOrderData
    ? reOrderData.orderType.toLowerCase() === 'pickup'
    : orderType === 'pickup';

  const dispatch = useAppDispatch();
  const [toastMsg, setToastMsg] = useState('');

  const handleOrderAgain = () => {
    if (!reOrderData?.products.length) return;
    reOrderData.products.forEach((item: any) => {
      const qty = parseInt(item.Quantity) || 1;
      const unitPrice = parseFloat(item.TotalProductPrice) / qty;
      dispatch(cartActions.addToCart({
        productId: String(item.ItemID),
        name: item.ProductName,
        image: item.ItemImage ?? '',
        price: unitPrice,
        quantity: qty,
      }));
    });
    setToastMsg(`${reOrderData.products.length} item(s) added to your cart!`);
    setTimeout(() => {
      setToastMsg('');
      onClose();
    }, 1500);
  };

  const deliveryTimeMins = parseInt(orderStatus?.deliveryTime ?? '30', 10);
  const phase = useMemo(
    () => orderStatus
      ? derivePhase(orderStatus.status, deliveryTimeMins, orderStatus.created, isPickup)
      : 'pending',
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderStatus?.status, orderStatus?.created, deliveryTimeMins, isPickup],
  );

  if (!isOpen) return null;

  // Toast overlay
  const toastEl = toastMsg ? (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[600] bg-yellow-500 text-black font-black text-sm px-6 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300 flex items-center gap-2">
      <Check size={16} strokeWidth={3} />
      {toastMsg}
    </div>
  ) : null;

  // Cancelled order overlay
  if (phase === 'rejected') {
    return (
      <div className="fixed inset-0 z-[500] bg-[#050505] flex flex-col items-center justify-center p-6">
        {toastEl}
        <XCircle size={80} className="text-red-500 mb-6" />
        <h1 className="text-3xl font-black text-white uppercase mb-3">Order Cancelled</h1>
        <p className="text-neutral-400 text-center mb-2">
          We&apos;re sorry, your order #{orderId} has been cancelled.
        </p>
        <p className="text-neutral-500 text-sm text-center mb-8">Please call 111-339-339 for further details.</p>
        <button
          onClick={onClose}
          className="bg-yellow-500 text-black font-black px-8 py-4 rounded-xl uppercase tracking-widest hover:bg-yellow-400 transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  const progressWidth =
    phase === 'pending' ? '0%' :
    phase === 'preparing' ? '33%' :
    phase === 'onTheWay' ? '66%' : '100%';

  const statusLabel =
    phase === 'pending' ? 'Awaiting Confirmation' :
    phase === 'preparing' ? 'In Kitchen' :
    phase === 'onTheWay' ? (isPickup ? 'Ready for Pickup' : 'On the Way') : 'Delivered';

  const etaDisplay = orderStatus?.deliveryTime
    ? `${orderStatus.deliveryTime} MINS`
    : '25-35 MINS';

  return (
    <div className="fixed inset-0 z-[500] bg-[#050505] overflow-y-auto animate-in zoom-in-95 duration-500 custom-scrollbar flex flex-col items-center">
      {toastEl}
      
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
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-1">Order Ref</span>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-white tracking-tight">#{orderId ?? '—'}</span>
                    {orderId && (
                        <button
                            onClick={() => navigator.clipboard.writeText(orderId)}
                            className="text-neutral-500 hover:text-yellow-500 transition-colors"
                        >
                            <Copy size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Time */}
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-1">
                    {isPickup ? 'Ready In' : 'Arrival Window'}
                </span>
                <div className="flex items-center gap-2 text-yellow-500">
                    <Clock size={20} strokeWidth={2.5} />
                    <span className="text-2xl font-black tracking-tight">{etaDisplay}</span>
                </div>
            </div>

            {/* Total */}
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-1">Payment Success</span>
                <span className="text-2xl font-black text-white tracking-tight">Rs. {reOrderData?.orderAmount ?? '—'}</span>
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
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse ${
                            phase === 'delivered'
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                        }`}>
                            {statusLabel}
                        </span>
                    </div>

                    <div className="relative flex justify-between px-2">
                        <div className="absolute top-[14px] left-0 w-full h-1 bg-[#222] rounded-full z-0"></div>
                        <div
                            className="absolute top-[14px] left-0 h-1 bg-yellow-500 rounded-full z-0 transition-all duration-1000"
                            style={{ width: progressWidth }}
                        ></div>

                        {/* Placed */}
                        <div className="relative z-10 flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center border-4 border-[#121212] shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                                <Check size={16} className="text-black" strokeWidth={4} />
                            </div>
                            <span className="text-[8px] font-black text-white uppercase">Placed</span>
                        </div>

                        {/* Prep */}
                        <div className={`relative z-10 flex flex-col items-center gap-2 transition-opacity ${phase === 'preparing' || phase === 'onTheWay' || phase === 'delivered' ? 'opacity-100' : 'opacity-30'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                phase === 'preparing' || phase === 'onTheWay' || phase === 'delivered'
                                    ? 'bg-[#121212] border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                                    : 'bg-[#1a1a1a] border-[#333]'
                            }`}>
                                <ChefHat size={18} className={phase === 'preparing' || phase === 'onTheWay' || phase === 'delivered' ? 'text-yellow-500' : 'text-neutral-500'} />
                            </div>
                            <span className={`text-[8px] font-black uppercase ${phase === 'preparing' ? 'text-yellow-500' : 'text-neutral-500'}`}>Prep</span>
                        </div>

                        {/* Transit / Ready */}
                        <div className={`relative z-10 flex flex-col items-center gap-2 transition-opacity ${phase === 'onTheWay' || phase === 'delivered' ? 'opacity-100' : 'opacity-30'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                phase === 'onTheWay' || phase === 'delivered'
                                    ? 'bg-[#121212] border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                                    : 'bg-[#1a1a1a] border-[#333]'
                            }`}>
                                {isPickup
                                    ? <ShoppingBag size={18} className={phase === 'onTheWay' || phase === 'delivered' ? 'text-yellow-500' : 'text-neutral-500'} />
                                    : <Bike size={18} className={phase === 'onTheWay' || phase === 'delivered' ? 'text-yellow-500' : 'text-neutral-500'} />
                                }
                            </div>
                            <span className={`text-[8px] font-black uppercase ${phase === 'onTheWay' ? 'text-yellow-500' : 'text-neutral-500'}`}>
                                {isPickup ? 'Ready' : 'Transit'}
                            </span>
                        </div>

                        {/* Done */}
                        <div className={`relative z-10 flex flex-col items-center gap-2 transition-opacity ${phase === 'delivered' ? 'opacity-100' : 'opacity-30'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                phase === 'delivered'
                                    ? 'bg-green-500 border-4 border-[#121212] shadow-[0_0_15px_rgba(74,222,128,0.4)]'
                                    : 'bg-[#1a1a1a] border-2 border-[#333]'
                            }`}>
                                {phase === 'delivered'
                                    ? <Check size={16} className="text-black" strokeWidth={4} />
                                    : <Home size={18} className="text-neutral-500" />
                                }
                            </div>
                            <span className={`text-[8px] font-black uppercase ${phase === 'delivered' ? 'text-green-400' : 'text-neutral-500'}`}>Done</span>
                        </div>
                    </div>
                </div>

                {/* Rider Info (delivery only, shown when API provides it) */}
                {!isPickup && (reOrderData?.riderName || orderStatus?.riderName) && (
                    <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 md:p-8">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wide mb-4">Your Rider</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-yellow-500/20 border-2 border-yellow-500/40 flex items-center justify-center">
                                <Bike size={24} className="text-yellow-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-bold text-lg">{reOrderData?.riderName || orderStatus?.riderName}</p>
                                {(reOrderData?.riderPhone || orderStatus?.riderPhone) && (
                                    <a
                                        href={`tel:${reOrderData?.riderPhone || orderStatus?.riderPhone}`}
                                        className="flex items-center gap-1.5 text-yellow-500 text-sm font-bold hover:underline mt-1"
                                    >
                                        <Phone size={14} />
                                        {reOrderData?.riderPhone || orderStatus?.riderPhone}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Dispatch Info */}
                <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 md:p-8">
                     <h3 className="text-lg font-bold text-white uppercase tracking-wide mb-6">Order Dispatch</h3>
                     <div className="space-y-6">
                        {isPickup ? (
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-yellow-500 shrink-0">
                                <ShoppingBag size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-1">Pickup From</p>
                                <p className="text-white font-medium text-sm">{orderAddress || 'Your selected outlet'}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-yellow-500 shrink-0">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-1">Destination</p>
                                <p className="text-white font-medium text-sm">{reOrderData?.deliveryAddress || orderAddress || '—'}</p>
                            </div>
                          </div>
                        )}
                     </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 bg-white hover:bg-neutral-200 text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-colors">
                        Return Home
                    </button>
                    <button
                        onClick={handleOrderAgain}
                        disabled={!reOrderData}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-colors shadow-[0_0_20px_rgba(234,179,8,0.3)] flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={14} />
                        Order Again
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
                        {!reOrderData ? (
                            <div className="space-y-4 animate-pulse">
                                {[1,2,3].map(i => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] shrink-0" />
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="h-2 bg-[#1a1a1a] rounded w-3/4" />
                                            <div className="h-2 bg-[#1a1a1a] rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {reOrderData.products.map((item: any, index: number) => {
                                    const opts: string[] = Array.isArray(item.options)
                                        ? item.options.map((o: any) => o.OptionName ?? o.optionName ?? '').filter(Boolean)
                                        : [];
                                    return (
                                        <div key={index} className="flex gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-[#0a0a0a] overflow-hidden shrink-0 relative">
                                                {item.ItemImage ? (
                                                    <Image src={item.ItemImage} alt={item.ProductName ?? ''} fill sizes="40px" className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-[#1a1a1a]" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-white truncate uppercase italic">
                                                    <span className="text-yellow-500 mr-1">{item.Quantity}x</span> {item.ProductName}
                                                </p>
                                                {opts.length > 0 && (
                                                    <p className="text-[9px] text-neutral-500 uppercase font-black">{opts.join(', ')}</p>
                                                )}
                                            </div>
                                            <span className="text-xs font-bold text-white whitespace-nowrap">Rs. {item.TotalProductPrice}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {reOrderData && (() => {
                        const itemsTotal = reOrderData.products.reduce(
                            (s: number, i: any) => s + parseFloat(i.TotalProductPrice || '0'), 0
                        );
                        const totalDiscount = reOrderData.products.reduce(
                            (s: number, i: any) => s + parseFloat(i.discountGiven || '0'), 0
                        );
                        return (
                        <div className="p-6 bg-[#0a0a0a] border-t border-white/5 space-y-2">
                            <div className="flex justify-between text-neutral-500 text-xs">
                                <span>Items Total</span>
                                <span>Rs. {itemsTotal}</span>
                            </div>
                            {totalDiscount > 0 && (
                                <div className="flex justify-between text-green-500 text-xs font-bold">
                                    <span>Deal Savings</span>
                                    <span>- Rs. {totalDiscount}</span>
                                </div>
                            )}
                            {reOrderData.taxAmount > 0 && (
                                <div className="flex justify-between text-neutral-600 text-[10px]">
                                    <span>Incl. GST{reOrderData.tax ? ` (${reOrderData.tax}%)` : ''}</span>
                                    <span>Rs. {reOrderData.taxAmount}</span>
                                </div>
                            )}
                            {reOrderData.deliveryFee > 0 && (
                                <div className="flex justify-between text-neutral-500 text-xs">
                                    <span>Delivery Fee</span>
                                    <span>Rs. {reOrderData.deliveryFee}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-neutral-500 text-xs">
                                <span>Payment</span>
                                <span className="text-neutral-300 font-bold">{reOrderData.paymentType}</span>
                            </div>
                            <div className="flex justify-between items-end pt-2 border-t border-white/5">
                                <span className="text-neutral-400 font-black uppercase text-[10px] tracking-[0.2em]">Grand Total</span>
                                <span className="text-xl font-black text-yellow-500">Rs. {reOrderData.orderAmount}</span>
                            </div>
                        </div>
                        );
                    })()}
                    {!reOrderData && (
                        <div className="p-6 bg-[#0a0a0a] border-t border-white/5">
                            <div className="flex justify-between items-end">
                                <span className="text-neutral-400 font-black uppercase text-[10px] tracking-[0.2em]">Grand Total</span>
                                <span className="text-xl font-black text-yellow-500">—</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
