'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import { ArrowLeft, MapPin, CreditCard, Banknote, User, Phone, Mail, ChevronRight, ShieldCheck, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { CartItem } from '@/types';
import { useUser } from '@/context/UserContext';
import { useLocation } from '@/context/LocationContext';
import { usePlaceOrderMutation } from '@/store/apiSlice';
import { useAppSelector } from '@/store';
import type { OrderPayload } from '@/services/api';

interface CheckoutPageProps {
  isOpen: boolean;
  onBack: () => void;
  cartItems: CartItem[];
  subtotal: number;
  discountAmount?: number;
  voucher?: string;
  onPlaceOrder: (orderAddress?: string, orderId?: string, encOrderId?: string) => void;
}

type XpayInstance = {
    element: (selector: string, options: Record<string, unknown>) => void;
    confirmPayment: (
        method: string,
        clientSecret: string,
        customer: Record<string, unknown>,
        encryptionKey: string,
    ) => Promise<{ error?: string; message?: string; success?: boolean; status?: string }>;
};

type XpayConfirmResult = {
    error?: string;
    message?: string;
    success?: boolean;
    status?: string;
};

declare global {
    interface Window {
        Xpay?: new (publishableKey: string, accountId: string, hmacSecret: string) => XpayInstance;
    }
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ isOpen, onBack, cartItems, subtotal, discountAmount = 0, voucher = '', onPlaceOrder }) => {
  const { user } = useUser();
  const { location } = useLocation();
  const guestPhone = useAppSelector(state => state.user.guestPhone);

    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'xpay'>('cod');
  const [deliveryTime, setDeliveryTime] = useState<'asap' | 'schedule'>('asap');
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? guestPhone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [remarks, setRemarks] = useState('');
  const [orderResult, setOrderResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isXpayScriptLoaded, setIsXpayScriptLoaded] = useState(false);
    const [isXpaySubmitting, setIsXpaySubmitting] = useState(false);
        const [isXpayElementReady, setIsXpayElementReady] = useState(false);
    const [xpayError, setXpayError] = useState('');
    const [xpay, setXpay] = useState<XpayInstance | null>(null);
        const [isXpayModalOpen, setIsXpayModalOpen] = useState(false);
  const [submitOrder, { isLoading: isSubmitting }] = usePlaceOrderMutation();

    const xpayPublishableKey = process.env.NEXT_PUBLIC_XPAY_PUBLISHABLE_KEY ?? '';
    const xpayAccountId = process.env.NEXT_PUBLIC_XPAY_ACCOUNT_ID ?? '';
    const xpayHmacSecret = process.env.NEXT_PUBLIC_XPAY_HMAC_SECRET ?? '';
    const isXpayConfigured = Boolean(xpayPublishableKey && xpayAccountId && xpayHmacSecret);

  // Reset transactional fields each time the checkout page opens (matching Cordova:
  // form fields are freshly rendered per order; name/phone/email come from profile).
  useEffect(() => {
    if (isOpen) {
      setAddress('');
      setLandmark('');
      setRemarks('');
      setOrderResult(null);
      setPaymentMethod('cod');
      setDeliveryTime('asap');
    setXpayError('');
    setXpay(null);
        setIsXpayElementReady(false);
        setIsXpayModalOpen(false);
      // Re-sync contact fields from user profile in case they changed
      setName(user?.name ?? '');
      setPhone(user?.phone ?? guestPhone ?? '');
      setEmail(user?.email ?? '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // For pickup orders delivery fee is always 0 (matching Cordova: appDeliveryFeeCurrent = 0 for Pickup)
  const deliveryFee = location.orderType === 'pickup' ? 0 : location.deliveryFee;
  // Apply voucher discount first (matching Cordova: totalPc = totalPc - vouch)
  const effectiveSubtotal = Math.max(0, subtotal - discountAmount);
  // GST is included in product prices (tax-inclusive pricing), so it is
  // extracted for the breakdown display only — NOT added on top.
  // Normalize: API returns decimal (0.15) but old persisted state may store whole number (15)
  const taxRate = location.deliveryTax >= 1 ? location.deliveryTax / 100 : location.deliveryTax;
  // Rounded values for clean UI display
  const taxBreakdown = Math.round(effectiveSubtotal * taxRate);
  const total = effectiveSubtotal + deliveryFee;
  // Unrounded values for API payload (matching Cordova: taxToDed = totalPrice * gst/100, subtotal = totalPrice - taxToDed)
  const apiTaxAmount = effectiveSubtotal * taxRate;
  const apiOrderAmount = effectiveSubtotal - apiTaxAmount;

  const areaDisplay = location.orderType === 'delivery'
    ? [location.area, location.city].filter(Boolean).join(', ')
    : location.outlet || 'Pickup';

    useEffect(() => {
        if (typeof window !== 'undefined' && window.Xpay) {
            setIsXpayScriptLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (paymentMethod !== 'xpay' || !isXpayModalOpen) return;
        setXpayError('');
        setIsXpayElementReady(false);

        if (!isXpayScriptLoaded) {
            setXpayError('Please wait while the payment form loads.');
            return;
        }
        if (!window.Xpay) {
            setXpayError('Payment form is currently unavailable. Please refresh and try again.');
            return;
        }
        if (!isXpayConfigured) {
            setXpayError('Payment form is currently unavailable. Please try another method.');
            return;
        }
        const formHost = document.querySelector('#xpay-form-popup') as HTMLElement | null;
        if (!formHost) return;
        if (xpay && formHost.childElementCount > 0) {
            setXpayError('');
            setIsXpayElementReady(true);
            return;
        }
        formHost.innerHTML = '';

        const instance = new window.Xpay(xpayPublishableKey, xpayAccountId, xpayHmacSecret);
        instance.element('#xpay-form-popup', {
            override: true,
            fields: {
                creditCard: {
                    placeholder: '1234 1234 1234 1234',
                    label: 'Card Number',
                },
                exp: {
                    placeholder: 'MM/YY',
                },
            },
            style: {
                '.input': {},
                '.invalid': {},
                '.label': {},
            },
        });

        setXpay(instance);
        setXpayError('');
        setIsXpayElementReady(true);
    }, [paymentMethod, isXpayModalOpen, isXpayScriptLoaded, isXpayConfigured, xpayPublishableKey, xpayAccountId, xpayHmacSecret, xpay]);

    const placeOrderAfterPayment = async (payload: OrderPayload, fullAddress: string, skipGatewayRedirect = false) => {
        const result = await submitOrder(payload).unwrap();
        if (result.success) {
            if (!skipGatewayRedirect && result.paymentUrl) {
                window.location.href = result.paymentUrl;
                return;
            }
            setOrderResult({ success: true, message: `Order placed! ID: ${result.orderId ?? 'N/A'}` });
            setTimeout(() => onPlaceOrder(fullAddress, result.orderId, result.encOrderId), 2000);
            return;
        }
        setOrderResult({ success: false, message: result.message ?? 'Order failed. Please try again.' });
    };

    const isXpayPaymentSuccessful = (result: XpayConfirmResult | null | undefined): boolean => {
        if (!result || result.error) return false;

        if (result.success === true) return true;

        const status = String(result.status ?? '').toLowerCase();
        if (status.includes('success') || status.includes('succeed') || status.includes('paid')) return true;

        const msg = String(result.message ?? '').toLowerCase();
        return msg.includes('success') || msg.includes('approved') || msg.includes('paid');
    };

    const confirmXpayWithTimeout = async (
        instance: XpayInstance,
        clientSecret: string,
        encryptionKey: string,
    ): Promise<XpayConfirmResult> => {
        const timeoutPromise = new Promise<XpayConfirmResult>((_, reject) => {
            setTimeout(() => reject(new Error('XPay confirmation timed out. Please try again.')), 90000);
        });

        const confirmPromise = instance.confirmPayment(
            'card',
            clientSecret,
            { name, email, phone },
            encryptionKey,
        );

        return Promise.race([confirmPromise, timeoutPromise]);
    };

    const openXpayPopup = () => {
        setPaymentMethod('xpay');
        setOrderResult(null);
        setIsXpayModalOpen(true);
    };

  const handleConfirmOrder = async () => {
        if (!name.trim() || !phone.trim()) {
            setOrderResult({ success: false, message: 'Please enter your full name and phone number before payment.' });
            return;
        }
    setOrderResult(null);
    // Build orderdata matching Cordova's cart.products structure exactly.
    // Key corrections vs previous version:
    //   - ItemID/SizeID/OptionID are numbers (Cordova stores them as numbers)
    //   - OptionGroupName is the group's display name, not its ID
    //   - CategoryName from cart item (stored when adding to cart)
    //   - No ProductDescription field (Cordova doesn't send it)
    const orderdata = cartItems.map(item => {
      const options = item.selectedOptions
        ? Object.entries(item.selectedOptions).flatMap(([groupId, opts]) =>
            opts.map(opt => ({
              OptionID: parseInt(opt.id, 10) || opt.id,
              OptionName: opt.name,
              // Use stored group name; fall back to groupId only if name unavailable
              OptionGroupName: item.selectedOptionGroupNames?.[groupId] ?? groupId,
              Price: opt.price,
              Quantity: 1,
            }))
          )
        : [];
      return {
        ItemID: parseInt(item.productId, 10) || item.productId,
        ProductName: item.name,
        ItemImage: item.image,
        Quantity: item.quantity,
        CategoryName: item.category ?? '',
        MinimumDelivery: item.minimumDelivery ?? 0,
        CookingInstructions: '',
        options,
        SizeID: item.selectedSize ? (parseInt(item.selectedSize.id, 10) || item.selectedSize.id) : '',
        Price: item.price,
        TotalProductPrice: item.price * item.quantity,
        discountGiven: item.discountGiven ?? 0,
      };
    });
        try {
            const isPickupOrder = location.orderType === 'pickup';
            const locationFields = isPickupOrder
                ? { Outlet: location.outlet }
                : {
                        Area: location.area,
                        cityname: location.city,
                        customeraddress: address,
                        customerEmail: email,
                        Landmark: landmark,
                    };

            const fullAddress = location.orderType === 'pickup'
                ? (location.outlet || location.area || location.city || 'Pickup')
                : [address, landmark, location.area, location.city].filter(Boolean).join(', ');

            const payload: OrderPayload = {
        customerNumberVerification: null,  // Cordova always sends this
        fullname: name,
        phone,
        email,
        ...locationFields,
        ordertype: isPickupOrder ? 'Pickup' : 'Delivery',
        Remarks: remarks,
                paymenttype: paymentMethod === 'cod' ? 'Cash' : 'Card',
        // Unrounded floats matching Cordova: taxToDed = totalPrice * gst/100, orderamount = totalPrice - taxToDed
        orderamount: apiOrderAmount,
        taxamount: apiTaxAmount,
        tax: apiTaxAmount,
        deliverytime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        totalamount: effectiveSubtotal,
        deliverycharges: deliveryFee,
        discountamount: discountAmount > 0 ? discountAmount : '0',  // Cordova sends string "0" when no discount
        Voucher: voucher,
        orderdata,
        WalletVerificationCode: user?.walletCode ?? '',
        platform: 'Web',
        AppVersion: 1,
        DeviceSignalID: '',
            };

            if (paymentMethod === 'xpay') {
                if (!isXpayModalOpen) {
                    openXpayPopup();
                    return;
                }
                if (!xpay) {
                    setOrderResult({ success: false, message: 'XPay card form is not ready yet.' });
                    return;
                }

                setIsXpaySubmitting(true);
                setOrderResult(null);
                const intentRes = await fetch('/api/xpay/create-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: Math.round(total),
                        currency: 'PKR',
                        customer: {
                            name,
                            phone,
                            email,
                        },
                        shipping: {
                            address1: address || landmark || location.area || location.outlet || 'N/A',
                            city: location.city || 'Karachi',
                            country: 'PK',
                            province: location.city || 'Sindh',
                            zip: '00000',
                        },
                        metadata: {
                            source: 'broadway-web-next',
                            order_type: isPickupOrder ? 'Pickup' : 'Delivery',
                        },
                    }),
                });

                const intentData = await intentRes.json();
                if (!intentRes.ok || !intentData?.clientSecret || !intentData?.encryptionKey) {
                    throw new Error(intentData?.message || 'Could not initialize XPay payment.');
                }

                const paymentResult = await confirmXpayWithTimeout(
                  xpay,
                  intentData.clientSecret,
                  intentData.encryptionKey,
                );
                                if (!isXpayPaymentSuccessful(paymentResult)) {
                                        throw new Error(paymentResult?.error || paymentResult?.message || 'XPay payment was not confirmed. Order was not placed.');
                                }

                await placeOrderAfterPayment(payload, fullAddress, true);
                setIsXpayModalOpen(false);
                return;
      }

            await placeOrderAfterPayment(payload, fullAddress);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Order failed. Please try again.';
            setOrderResult({ success: false, message });
        } finally {
            setIsXpaySubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] bg-gray-50 dark:bg-[#0a0a0a] overflow-y-auto animate-in slide-in-from-bottom duration-300 custom-scrollbar">
      
      {/* Header */}
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-neutral-200 dark:border-white/10 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onBack}
                    className="p-2 rounded-full bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-900 dark:text-white transition-colors border border-neutral-200 dark:border-white/5"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl md:text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight italic">Secure Checkout</h1>
            </div>
            <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-green-500" />
                <span className="text-xs font-bold text-green-500 uppercase tracking-wider hidden md:block">Verified Encryption</span>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* LEFT COLUMN: FORMS */}
            <div className="flex-1 space-y-8">
                
                {/* 1. Contact Info */}
                <section className="bg-white dark:bg-[#121212] rounded-3xl p-6 md:p-8 border border-neutral-200 dark:border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center font-bold text-sm">1</div>
                        <h2 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white uppercase tracking-wide">Personal Information</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="group/input relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within/input:text-yellow-500 transition-colors" size={18} />
                            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-neutral-100 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-neutral-900 dark:text-white focus:border-yellow-500 focus:outline-none transition-all placeholder:text-neutral-500 dark:placeholder:text-neutral-600" />
                        </div>
                        <div className="group/input relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within/input:text-yellow-500 transition-colors" size={18} />
                            <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-neutral-100 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-neutral-900 dark:text-white focus:border-yellow-500 focus:outline-none transition-all placeholder:text-neutral-500 dark:placeholder:text-neutral-600" />
                        </div>
                        <div className="group/input relative md:col-span-2">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within/input:text-yellow-500 transition-colors" size={18} />
                            <input type="email" placeholder="Email Address (Optional)" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-neutral-100 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-neutral-900 dark:text-white focus:border-yellow-500 focus:outline-none transition-all placeholder:text-neutral-500 dark:placeholder:text-neutral-600" />
                        </div>
                    </div>
                </section>

                {/* 2. Delivery Address / Pickup Outlet */}
                <section className="bg-white dark:bg-[#121212] rounded-3xl p-6 md:p-8 border border-neutral-200 dark:border-white/5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center font-bold text-sm">2</div>
                            <h2 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white uppercase tracking-wide">
                                {location.orderType === 'pickup' ? 'Pickup Outlet' : 'Delivery Address'}
                            </h2>
                        </div>
                        {location.orderType !== 'pickup' && (
                            <button className="text-yellow-500 text-xs font-bold uppercase hover:underline">Edit Map</button>
                        )}
                    </div>

                    <div className="w-full h-36 rounded-xl bg-neutral-100 dark:bg-[#161616] mb-6 relative overflow-hidden border border-neutral-200 dark:border-white/10 group cursor-pointer">
                        <div className="absolute inset-0 opacity-20">
                           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />
                           </svg>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <MapPin className="text-yellow-500 fill-yellow-500 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]" size={32} />
                        </div>
                        <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 z-10 flex items-center gap-2">
                            <p className="text-xs text-white font-bold uppercase tracking-tight">{areaDisplay || 'Select a location'}</p>
                        </div>
                    </div>

                    {location.orderType === 'pickup' ? (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-sm text-yellow-300 font-medium">
                            You will collect your order from the outlet above.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <input type="text" placeholder="Apartment / House / Office No." value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-neutral-100 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-xl py-4 px-4 text-neutral-900 dark:text-white focus:border-yellow-500 focus:outline-none transition-all placeholder:text-neutral-500 dark:placeholder:text-neutral-600" />
                            <input type="text" placeholder="Street Name / Landmarks" value={landmark} onChange={e => setLandmark(e.target.value)} className="w-full bg-neutral-100 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-xl py-4 px-4 text-neutral-900 dark:text-white focus:border-yellow-500 focus:outline-none transition-all placeholder:text-neutral-500 dark:placeholder:text-neutral-600" />
                        </div>
                    )}
                </section>

                {/* 3. Payment Method */}
                <section className="bg-white dark:bg-[#121212] rounded-3xl p-6 md:p-8 border border-neutral-200 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center font-bold text-sm">3</div>
                        <h2 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white uppercase tracking-wide">Payment Choice</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div 
                            onClick={() => setPaymentMethod('cod')}
                            className={`
                                relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center text-center gap-3 group
                                ${paymentMethod === 'cod' 
                                    ? 'border-yellow-500 bg-yellow-500/10' 
                                    : 'border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-[#0a0a0a] hover:border-neutral-300 dark:hover:border-white/20'}
                            `}
                        >
                            <div className={`p-3 rounded-full ${paymentMethod === 'cod' ? 'bg-yellow-500 text-black' : 'bg-neutral-200 dark:bg-[#1a1a1a] text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white'}`}>
                                <Banknote size={24} />
                            </div>
                            <h3 className={`font-bold ${paymentMethod === 'cod' ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white'}`}>Cash on Delivery</h3>
                            {paymentMethod === 'cod' && <div className="absolute top-3 right-3 w-3 h-3 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>}
                        </div>

                        <div 
                            onClick={() => setPaymentMethod('card')}
                            className={`
                                relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center text-center gap-3 group
                                ${paymentMethod === 'card' 
                                    ? 'border-yellow-500 bg-yellow-500/10' 
                                    : 'border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-[#0a0a0a] hover:border-neutral-300 dark:hover:border-white/20'}
                            `}
                        >
                            <div className={`p-3 rounded-full ${paymentMethod === 'card' ? 'bg-yellow-500 text-black' : 'bg-neutral-200 dark:bg-[#1a1a1a] text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white'}`}>
                                <CreditCard size={24} />
                            </div>
                            <h3 className={`font-bold ${paymentMethod === 'card' ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white'}`}>Digital Payment</h3>
                            {paymentMethod === 'card' && <div className="absolute top-3 right-3 w-3 h-3 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>}
                        </div>

                        <div
                            onClick={openXpayPopup}
                            className={`
                                relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center text-center gap-3 group
                                ${paymentMethod === 'xpay'
                                    ? 'border-yellow-500 bg-yellow-500/10'
                                    : 'border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-[#0a0a0a] hover:border-neutral-300 dark:hover:border-white/20'}
                            `}
                        >
                            <div className={`p-3 rounded-full ${paymentMethod === 'xpay' ? 'bg-yellow-500 text-black' : 'bg-neutral-200 dark:bg-[#1a1a1a] text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white'}`}>
                                <CreditCard size={24} />
                            </div>
                            <h3 className={`font-bold ${paymentMethod === 'xpay' ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white'}`}>XPay (Card)</h3>
                            {paymentMethod === 'xpay' && <div className="absolute top-3 right-3 w-3 h-3 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>}
                        </div>
                    </div>

                    {paymentMethod === 'xpay' && (
                        <div className="mt-5 rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-[#0a0a0a] p-4 space-y-3">
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                Card entry opens automatically in a secure popup. Payment will be completed first, then your order will be placed.
                            </p>
                            {xpayError && <p className="text-xs text-yellow-500">{xpayError}</p>}
                        </div>
                    )}
                </section>
                {/* 4. Cooking / Special Instructions */}
                <section className="bg-white dark:bg-[#121212] rounded-3xl p-6 md:p-8 border border-neutral-200 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center font-bold text-sm">4</div>
                        <h2 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white uppercase tracking-wide">Special Instructions</h2>
                    </div>
                    <textarea
                        placeholder="Any special requests? (e.g. extra spicy, no onions...)"
                        value={remarks}
                        onChange={e => setRemarks(e.target.value)}
                        rows={3}
                        className="w-full bg-neutral-100 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-xl py-4 px-4 text-neutral-900 dark:text-white focus:border-yellow-500 focus:outline-none transition-all placeholder:text-neutral-500 dark:placeholder:text-neutral-600 resize-none text-sm"
                    />
                </section>
            </div>
            <div className="lg:w-[400px] shrink-0">
                <div className="bg-white dark:bg-[#121212] rounded-3xl p-6 md:p-8 border border-neutral-200 dark:border-white/5 sticky top-32">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white uppercase tracking-wide mb-6">Payment Summary</h2>
                    
                    <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar mb-6 pr-2">
                        {cartItems.map(item => (
                            <div key={item.cartId} className="flex gap-3">
                                <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-[#0a0a0a] overflow-hidden border border-neutral-200 dark:border-white/5 shrink-0 relative">
                                    <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                                            <span className="text-yellow-500 mr-1">{item.quantity}x</span> {item.name}
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-neutral-500 uppercase font-black">Rs. {item.price * item.quantity}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-neutral-200 dark:border-white/5 pt-4 space-y-2 mb-6">
                        <div className="flex justify-between text-neutral-400 text-xs">
                            <span>Items Total</span>
                            <span>Rs. {subtotal}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-green-500 text-xs font-bold">
                              <span>Voucher ({voucher})</span>
                              <span>- Rs. {discountAmount}</span>
                          </div>
                        )}
                        {taxRate > 0 && (
                          <div className="flex justify-between text-neutral-500 text-[10px]">
                              <span>Incl. GST ({Math.round(taxRate * 100)}%)</span>
                              <span>Rs. {taxBreakdown}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-neutral-400 text-xs">
                            <span>Delivery Fee</span>
                            <span>{deliveryFee > 0 ? `Rs. ${deliveryFee}` : 'Free'}</span>
                        </div>
                    </div>

                    <div className="bg-neutral-100 dark:bg-white/5 rounded-xl p-4 border border-neutral-200 dark:border-white/5 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest">Total Payable</span>
                            <span className="text-2xl font-black text-yellow-500">Rs. {total}</span>
                        </div>
                    </div>

                    {orderResult && (
                        <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
                            orderResult.success ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        }`}>
                            {orderResult.success ? <CheckCircle size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                            {orderResult.message}
                        </div>
                    )}

                    <button
                        onClick={handleConfirmOrder}
                        disabled={isSubmitting || isXpaySubmitting}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-black py-4 rounded-xl font-black text-lg uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
                    >
                                                {(isSubmitting || isXpaySubmitting)
                                                    ? <Loader2 className="animate-spin" size={20} />
                            : <><span>{paymentMethod === 'xpay' ? 'Open XPay Popup' : 'Confirm Order'}</span><ChevronRight size={20} strokeWidth={3} /></>}
                    </button>
                </div>
            </div>
        </div>
      </main>
            {paymentMethod === 'xpay' && isXpayModalOpen && (
                <div className="fixed inset-0 z-[520] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121212] p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-neutral-900 dark:text-white uppercase tracking-wide">Enter Card Details</h3>
                            <button
                                type="button"
                                onClick={() => setIsXpayModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <X size={18} className="text-neutral-700 dark:text-neutral-300" />
                            </button>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                            Your card data is handled by XPay securely.
                        </p>
                        {xpayError && (
                            <p className="text-xs text-yellow-500 mb-3">{xpayError}</p>
                        )}
                        <div id="xpay-form-popup" className="min-h-[72px] rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#0a0a0a] p-2" />
                        <div className="mt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsXpayModalOpen(false)}
                                className="flex-1 rounded-xl border border-neutral-200 dark:border-white/10 px-4 py-3 text-sm font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmOrder}
                                disabled={isSubmitting || isXpaySubmitting}
                                className="flex-1 rounded-xl bg-yellow-500 hover:bg-yellow-400 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-black px-4 py-3 text-sm font-black uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
                            >
                                {(isSubmitting || isXpaySubmitting)
                                    ? <Loader2 className="animate-spin" size={16} />
                                    : <><span>Pay & Submit</span><ChevronRight size={16} strokeWidth={3} /></>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Script
                src="https://js.xstak.com/xpay-stage.js"
                strategy="afterInteractive"
                onLoad={() => setIsXpayScriptLoaded(true)}
                onError={() => setXpayError('Could not load XPay SDK. Please refresh and try again.')}
            />
    </div>
  );
};

