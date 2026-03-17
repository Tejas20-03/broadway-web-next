'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Minus, Plus, Check, ChevronRight, ArrowLeft } from 'lucide-react';
import { Product, ProductSize, ProductOption, ProductOptionGroup } from '@/types';
import { useGetProductOptionsQuery } from '@/store/apiSlice';
import { useLocation } from '@/context/LocationContext';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: any) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
  const { location } = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, ProductOption[]>>({});
  const [resolvedProduct, setResolvedProduct] = useState<Product | null>(null);

  // RTK Query — cached, no duplicate requests for the same product
  const { data: optionData, isFetching: isLoadingOptions } = useGetProductOptionsQuery(
    { itemId: product?.id ?? '', city: location.city, area: location.area },
    { skip: !product?.id },
  );

  // Reset UI state and merge options whenever product or fetched options change
  useEffect(() => {
    if (!product) { setResolvedProduct(null); return; }
    const merged = { ...product, ...(optionData ?? {}) };
    setResolvedProduct(merged);
    setQuantity(1);
    setSelectedOptions({});
    setSelectedSize(merged.sizes?.[0] ?? null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, optionData]);

  // Reset selected options to defaults whenever the size or enriched product changes
  useEffect(() => {
    if (!resolvedProduct) return;
    const groups: ProductOptionGroup[] =
      (selectedSize && resolvedProduct.sizeOptionGroups?.[selectedSize.id])
      ?? resolvedProduct.optionGroups
      ?? [];
    const defaults: Record<string, ProductOption[]> = {};
    groups.forEach(group => {
      if (group.options.length > 0 && group.maxSelection === 1) {
        defaults[group.id] = [group.options[0]];
      }
    });
    setSelectedOptions(defaults);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSize?.id, resolvedProduct?.sizeOptionGroups, resolvedProduct?.optionGroups]);

  if (!isOpen || !resolvedProduct) return null;

  const activeGroups: ProductOptionGroup[] =
    (selectedSize && resolvedProduct.sizeOptionGroups?.[selectedSize.id])
    ?? resolvedProduct.optionGroups
    ?? [];

  // Price = selected size price (or basePrice) + sum of all selected option prices.
  // Use DeliveryPrice for delivery orders, TakeAwayPrice for pickup — matching Cordova.
  const isPickup = location.orderType === 'pickup';
  const baseSizePrice = isPickup
    ? (selectedSize?.takeAwayPrice ?? selectedSize?.price ?? resolvedProduct.basePrice ?? 0)
    : (selectedSize?.price ?? resolvedProduct.basePrice ?? 0);
  const optionsPrice = Object.values(selectedOptions).flat().reduce((sum, opt) => sum + (opt.price ?? 0), 0);
  const unitPrice = baseSizePrice + optionsPrice;
  const totalPrice = unitPrice * quantity;

  const leftImage = resolvedProduct.image;

  // Badge labels for left panel
  const sizeLabel = selectedSize?.label ?? '';
  const firstGroupFirstOption = Object.values(selectedOptions)[0]?.[0]?.name ?? '';

  // Hide the size picker when there is only one size or its label is '-'
  // (auto-selected by useEffect — user has nothing to choose)
  const isSingleOrDashSize =
    !resolvedProduct.sizes ||
    resolvedProduct.sizes.length === 0 ||
    resolvedProduct.sizes.length === 1 ||
    resolvedProduct.sizes.every(s => s.label === '-');

  const toggleOption = (groupId: string, option: ProductOption, maxSelection: number) => {
    setSelectedOptions(prev => {
      const current = prev[groupId] ?? [];
      const alreadySelected = current.some(o => o.id === option.id);
      if (alreadySelected) {
        const group = activeGroups.find(g => g.id === groupId);
        if (group && group.minSelection > 0 && current.length <= 1) return prev;
        return { ...prev, [groupId]: current.filter(o => o.id !== option.id) };
      }
      if (maxSelection === 1) {
        return { ...prev, [groupId]: [option] };
      }
      if (maxSelection > 1 && current.length >= maxSelection) return prev;
      return { ...prev, [groupId]: [...current, option] };
    });
  };

  const handleAddToCart = () => {
    // Build groupId → groupName map so the order payload can send group names (not IDs)
    const groupNames: Record<string, string> = {};
    activeGroups.forEach(g => { groupNames[g.id] = g.name; });
    onAddToCart({
      productId: resolvedProduct.id,
      name: resolvedProduct.name,
      image: resolvedProduct.image,
      price: unitPrice,
      quantity,
      category: resolvedProduct.category,
      selectedSize: selectedSize ? { id: selectedSize.id, label: selectedSize.label } : undefined,
      selectedOptions,
      selectedOptionGroupNames: groupNames,
      minimumDelivery: resolvedProduct.minimumDelivery,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity animate-in fade-in" onClick={onClose}></div>
      
      <div className="relative bg-[#0a0a0a] w-full h-[100dvh] sm:h-[85vh] sm:max-w-6xl sm:rounded-[2.5rem] flex flex-col md:flex-row shadow-2xl animate-slide-in border-none sm:border sm:border-white/10 overflow-hidden">
        
        <button onClick={onClose} className="md:hidden absolute top-4 left-4 z-[210] bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-3 rounded-full border border-white/10 shadow-lg">
          <ArrowLeft size={24} />
        </button>

        {/* LEFT PANEL — product image */}
        <div className="hidden md:block relative w-[40%] bg-[#121212] shrink-0 group h-full">
          <Image src={leftImage} alt={resolvedProduct.name} fill sizes="40vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/30"></div>
          <button onClick={onClose} className="absolute top-4 left-4 bg-black/40 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur transition-all border border-white/10 z-20">
            <X size={24} />
          </button>
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex gap-2 mb-2 flex-wrap">
              {sizeLabel && <span className="bg-yellow-500 text-white text-xs font-black px-2 py-1 rounded uppercase tracking-wider">{sizeLabel}</span>}
              {firstGroupFirstOption && <span className="bg-white/20 text-white backdrop-blur text-xs font-bold px-2 py-1 rounded">{firstGroupFirstOption}</span>}
            </div>
            <h2 className="text-4xl font-black text-white uppercase leading-none mb-1 drop-shadow-xl">{resolvedProduct.name}</h2>
            <p className="text-neutral-400 text-sm font-medium line-clamp-2 drop-shadow-md">{resolvedProduct.description || 'The perfect cheesy delight loaded with toppings.'}</p>
          </div>
        </div>

        {/* RIGHT PANEL — options */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a] relative overflow-hidden h-full">
          <div className="flex-1 overflow-y-auto custom-scrollbar">

            {/* Mobile image */}
            <div className="md:hidden relative w-full h-72 bg-[#121212] shrink-0">
              <Image src={leftImage} alt={resolvedProduct.name} fill sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/30"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex gap-2 mb-2 flex-wrap">
                  {sizeLabel && <span className="bg-yellow-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">{sizeLabel}</span>}
                  {firstGroupFirstOption && <span className="bg-white/20 text-white backdrop-blur text-[10px] font-bold px-2 py-1 rounded">{firstGroupFirstOption}</span>}
                </div>
                <h2 className="text-2xl font-black text-white uppercase leading-none mb-1 drop-shadow-xl">{resolvedProduct.name}</h2>
                <p className="text-neutral-400 text-xs font-medium line-clamp-2 drop-shadow-md">{resolvedProduct.description}</p>
              </div>
            </div>

            {isLoadingOptions ? (
              /* Loading skeleton */
              <div className="p-5 md:p-8 space-y-8 pb-32">
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-neutral-800 animate-pulse" />
                      <div className="h-4 bg-neutral-800 rounded animate-pulse w-36" />
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                      {[1, 2, 3, 4, 5, 6].map(j => (
                        <div key={j} className="aspect-square bg-neutral-800 rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 md:p-8 space-y-8 pb-32">

                {/* SIZE SECTION — hidden when there is only one size or label is "-" */}
                {resolvedProduct.sizes && resolvedProduct.sizes.length > 0 && !isSingleOrDashSize && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-[10px] md:text-xs">1</span>
                      <h3 className="text-base md:text-lg font-bold text-white uppercase tracking-wider">Choose Size</h3>
                    </div>
                    <div className="grid grid-cols-5 gap-2 sm:gap-4">
                      {resolvedProduct.sizes.map((size) => {
                        const active = selectedSize?.id === size.id;
                        return (
                          <button key={size.id} onClick={() => setSelectedSize(size)}
                            className={`flex flex-col items-center gap-1.5 p-1.5 md:p-2 rounded-xl transition-all duration-300 ${active ? 'bg-white/5 scale-105' : 'hover:bg-white/5'}`}
                          >
                            <div className={`relative rounded-full border-2 overflow-hidden flex items-center justify-center transition-all duration-300 ${active ? 'w-12 h-12 md:w-16 md:h-16 border-yellow-500 bg-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'w-10 h-10 md:w-14 md:h-14 border-neutral-700 bg-neutral-900'}`}>
                              {size.image
                                ? <Image src={size.image} alt={size.label} fill sizes="64px" className={`object-contain p-1.5 transition-opacity ${active ? 'opacity-100' : 'opacity-40'}`} />
                                : <span className={`font-black text-sm md:text-base ${active ? 'text-white' : 'text-neutral-600'}`}>{size.label[0] ?? '?'}</span>
                              }
                            </div>
                            <div className="text-center">
                              <div className={`text-[9px] md:text-xs font-bold uppercase ${active ? 'text-white' : 'text-neutral-500'}`}>{size.label}</div>
                              <div className={`text-[8px] md:text-[9px] font-medium ${active ? 'text-yellow-500' : 'text-neutral-600'}`}>Rs. {size.price}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* DYNAMIC OPTION GROUPS */}
                {activeGroups.map((group, groupIdx) => {
                  const stepNum = (!isSingleOrDashSize && resolvedProduct.sizes && resolvedProduct.sizes.length > 0 ? 2 : 1) + groupIdx;
                  const isMulti = group.maxSelection !== 1;
                  const currentSelected = selectedOptions[group.id] ?? [];
                  const hasImages = group.options.some(o => o.image);

                  return (
                    <section key={group.id}>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-[10px] md:text-xs">{stepNum}</span>
                        <h3 className="text-base md:text-lg font-bold text-white uppercase tracking-wider">{group.name}</h3>
                        {group.minSelection > 0 && <span className="text-red-500 text-lg leading-none">*</span>}
                        {isMulti && group.maxSelection > 1 && group.maxSelection < 99 && (
                          <span className="text-[10px] text-neutral-500 font-medium ml-1">(max {group.maxSelection})</span>
                        )}
                      </div>

                      {hasImages ? (
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                          {group.options.map(option => {
                            const active = currentSelected.some(o => o.id === option.id);
                            return (
                              <div key={option.id} onClick={() => toggleOption(group.id, option, group.maxSelection)}
                                className={`relative aspect-square rounded-2xl border-2 cursor-pointer overflow-hidden group transition-all duration-300 ${active ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'border-neutral-800 hover:border-neutral-600'}`}
                              >
                                <div className="absolute inset-0 bg-[#121212]">
                                  <Image src={option.image!} alt={option.name} fill sizes="(max-width: 768px) 33vw, 20vw" className="object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                  <div className={`absolute inset-0 ${active ? 'bg-yellow-500/10' : 'bg-black/20'}`}></div>
                                </div>
                                {active && (
                                  <div className="absolute top-2 right-2 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg z-10 animate-in zoom-in duration-300">
                                    <Check size={12} className="text-black" strokeWidth={4} />
                                  </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black via-black/80 to-transparent">
                                  <div className={`font-bold text-[10px] md:text-xs text-center leading-tight ${active ? 'text-white' : 'text-neutral-300'}`}>{option.name}</div>
                                  {option.price > 0 && <div className="text-[9px] md:text-[10px] text-yellow-500 font-bold text-center">+ Rs. {option.price}</div>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                          {group.options.map(option => {
                            const active = currentSelected.some(o => o.id === option.id);
                            return (
                              <div key={option.id} onClick={() => toggleOption(group.id, option, group.maxSelection)}
                                className={`relative aspect-square rounded-2xl border-2 cursor-pointer overflow-hidden flex flex-col items-center justify-center p-2 transition-all duration-300 ${active ? 'border-yellow-500 bg-yellow-500/10' : 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800'}`}
                              >
                                {active && (
                                  <div className="absolute top-2 right-2 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg z-10 animate-in zoom-in duration-300">
                                    <Check size={12} className="text-black" strokeWidth={4} />
                                  </div>
                                )}
                                <div className={`font-bold text-[10px] md:text-xs text-center leading-tight mb-0.5 ${active ? 'text-white' : 'text-neutral-400'}`}>{option.name}</div>
                                {option.price > 0 && <div className="text-[9px] md:text-[10px] text-yellow-500 font-bold">+ Rs. {option.price}</div>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  );
                })}

              </div>
            )}
          </div>

          {/* FOOTER — quantity + add to cart */}
          <div className="w-full bg-[#0a0a0a] border-t border-white/10 p-4 md:p-6 shrink-0 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
            <div className="flex gap-3 md:gap-4 items-center">
              <div className="flex items-center gap-2 md:gap-4 bg-[#141414] rounded-xl md:rounded-2xl p-1 md:p-1.5 border border-white/5">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg md:rounded-xl transition-colors">
                  <Minus size={18} className="md:w-5 md:h-5" />
                </button>
                <span className="text-lg md:text-xl font-black text-white w-6 md:w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg md:rounded-xl transition-colors">
                  <Plus size={18} className="md:w-5 md:h-5" />
                </button>
              </div>
              <button onClick={handleAddToCart}
                className="flex-1 h-[52px] md:h-[60px] bg-yellow-500 hover:bg-yellow-400 text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg flex items-center justify-between px-4 md:px-8 shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all transform hover:scale-[1.02] active:scale-95"
              >
                <span className="flex items-center gap-1 md:gap-2">ADD <ChevronRight size={18} className="md:w-5 md:h-5" strokeWidth={3} /></span>
                <span className="text-sm md:text-base">Rs. {totalPrice}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  