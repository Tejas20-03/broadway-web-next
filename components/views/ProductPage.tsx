'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Minus, Plus, ShoppingBag, Star, Users } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { useMenu } from '@/hooks/useMenu';
import { useCart } from '@/context/CartContext';
import { useGetProductOptionsQuery } from '@/store/apiSlice';
import { Product, ProductOption, ProductOptionGroup, ProductSize } from '@/types';

interface ProductPageProps {
  isOpen: boolean;
  productId: string;
  onClose: () => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({ isOpen, productId, onClose }) => {
  const router = useRouter();
  const { location } = useLocation();
  const { addToCart } = useCart();

  const { products, categories, isLoading } = useMenu(
    location.city,
    location.area,
    location.orderType === 'pickup' ? location.outlet : undefined,
  );

  const baseProduct = useMemo(() => products.find((p) => p.id === productId) ?? null, [products, productId]);

  const { data: optionData } = useGetProductOptionsQuery(
    { itemId: baseProduct?.id ?? '', city: location.city, area: location.area },
    { skip: !baseProduct?.id },
  );

  const product = useMemo<Product | null>(() => {
    if (!baseProduct) return null;
    return { ...baseProduct, ...(optionData ?? {}) };
  }, [baseProduct, optionData]);

  const categoryLabel = useMemo(
    () => (product ? categories.find((c) => c.id === product.category)?.label : ''),
    [categories, product],
  );

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, ProductOption[]>>({});

  useEffect(() => {
    if (!product) return;
    setQuantity(1);
    const nextSize = product.sizes?.[0] ?? null;
    setSelectedSize(nextSize);
    setSelectedOptions({});
    window.scrollTo(0, 0);
  }, [product?.id, product?.sizes]);

  useEffect(() => {
    if (!product) return;

    const groups: ProductOptionGroup[] =
      (selectedSize && product.sizeOptionGroups?.[selectedSize.id])
      ?? product.optionGroups
      ?? [];

    const defaults: Record<string, ProductOption[]> = {};
    groups.forEach((group) => {
      if (group.options.length > 0 && group.maxSelection === 1 && group.minSelection === 0) {
        defaults[group.id] = [group.options[0]];
      }
    });

    setSelectedOptions(defaults);
  }, [product?.id, product?.optionGroups, product?.sizeOptionGroups, selectedSize?.id]);

  if (!isOpen) return null;

  if (isLoading || !product) {
    return (
      <div className="fixed inset-0 z-[300] bg-[#0a0a0a] overflow-y-auto custom-scrollbar">
        <div className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center gap-4">
          <button onClick={onClose} className="bg-white/5 hover:bg-white/10 text-white p-2.5 rounded-full border border-white/10 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-black text-white uppercase tracking-tighter">Product Details</h1>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-12 text-center text-neutral-400 font-bold">Loading product...</div>
      </div>
    );
  }

  const activeGroups: ProductOptionGroup[] =
    (selectedSize && product.sizeOptionGroups?.[selectedSize.id])
    ?? product.optionGroups
    ?? [];

  const displayImage = product.image;

  const isPickup = location.orderType === 'pickup';
  const baseSizePrice = isPickup
    ? (selectedSize?.takeAwayPrice ?? selectedSize?.price ?? product.basePrice ?? 0)
    : (selectedSize?.price ?? product.basePrice ?? 0);
  const optionsPrice = Object.values(selectedOptions).flat().reduce((sum, opt) => sum + (opt.price ?? 0), 0);
  const unitPrice = baseSizePrice + optionsPrice;
  const totalPrice = unitPrice * quantity;

  const getCategoryText = (catId: string) => {
    switch (catId) {
      case '56385':
        return 'Dessert';
      case '56386':
        return 'Beverage';
      case '56383':
        return 'Starter';
      default:
        return 'Pizza';
    }
  };

  const toggleOption = (groupId: string, option: ProductOption, maxSelection: number, minSelection: number) => {
    const current = selectedOptions[groupId] ?? [];
    const alreadySelected = current.some((o) => o.id === option.id);

    if (alreadySelected) {
      if (minSelection > 0 && current.length <= minSelection) return;
      setSelectedOptions((prev) => ({
        ...prev,
        [groupId]: current.filter((o) => o.id !== option.id),
      }));
      return;
    }

    if (maxSelection === 1) {
      setSelectedOptions((prev) => ({ ...prev, [groupId]: [option] }));
      return;
    }

    if (maxSelection > 1 && current.length >= maxSelection) return;
    setSelectedOptions((prev) => ({ ...prev, [groupId]: [...current, option] }));
  };

  const handleAddToCart = () => {
    const groupNames: Record<string, string> = {};
    activeGroups.forEach((group) => {
      groupNames[group.id] = group.name;
    });

    addToCart({
      productId: product.id,
      name: product.name,
      image: displayImage,
      price: unitPrice,
      quantity,
      category: product.category,
      selectedSize: selectedSize ?? undefined,
      selectedOptions,
      selectedOptionGroupNames: groupNames,
      minimumDelivery: product.minimumDelivery,
    });

    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-[#0a0a0a] overflow-y-auto custom-scrollbar"
    >
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="bg-white/5 hover:bg-white/10 text-white p-2.5 rounded-full border border-white/10 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-base sm:text-xl font-black text-white uppercase tracking-tighter">Product Details</h1>
        </div>
        <div className="flex items-center gap-4">
          {categoryLabel && (
            <button
              onClick={() => router.push(`/category/${encodeURIComponent(product.category)}`)}
              className="hidden sm:flex bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all"
            >
              {categoryLabel}
            </button>
          )}
          <div className="hidden sm:flex items-center gap-2 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-black text-yellow-500">{product.rating || '4.8'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 pb-32 lg:pb-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="lg:w-1/2 space-y-8">
            <div className="relative aspect-square sm:aspect-[4/3] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
              <motion.img
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5 }}
                src={displayImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 flex flex-wrap gap-2 sm:gap-3 pr-4">
                {product.isNew && (
                  <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                    New Arrival
                  </span>
                )}
                <span className="bg-yellow-500 text-black text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                  {getCategoryText(product.category)}
                </span>
                {product.serves && (
                  <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-white/10">
                    <Users size={12} />
                    Serves {product.serves}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-4 sm:mb-6 break-words">
                  {product.name}
                </h2>
                <p className="text-neutral-400 text-base sm:text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
                  {product.description || 'Experience the ultimate flavor explosion with our signature recipe, crafted with premium ingredients and passion.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                {product.tags?.map((tag) => (
                  <span key={tag} className="bg-white/5 text-neutral-400 text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10 uppercase tracking-widest">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 space-y-10">
            {product.sizes && product.sizes.length > 1 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center font-black text-sm">01</span>
                  <h3 className="text-xl font-black text-white uppercase tracking-wider">Select Size</h3>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {product.sizes.map((size) => {
                    const active = selectedSize?.id === size.id;
                    const displaySizePrice = isPickup
                      ? (size.takeAwayPrice ?? size.price)
                      : size.price;
                    return (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 border ${
                          active ? 'bg-yellow-500/10 border-yellow-500/50 scale-105' : 'bg-white/5 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-black text-base transition-all ${
                          active ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'bg-neutral-800 text-neutral-500'
                        }`}>
                          {(size.label || '?').charAt(0)}
                        </div>
                        <div className="text-center">
                          <div className={`text-xs font-black uppercase tracking-tighter ${active ? 'text-white' : 'text-neutral-500'}`}>{size.label}</div>
                          <div className="text-[10px] text-yellow-500 font-bold">Rs. {displaySizePrice}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {activeGroups.map((group, idx) => {
              const step = (product.sizes && product.sizes.length > 1 ? 2 : 1) + idx;
              const selectedInGroup = selectedOptions[group.id] ?? [];
              const hasImages = group.options.some((o) => o.image);
              return (
                <section key={group.id}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center font-black text-sm">{String(step).padStart(2, '0')}</span>
                    <h3 className="text-xl font-black text-white uppercase tracking-wider">{group.name}</h3>
                    {group.minSelection > 0 && <span className="text-red-400 font-black">*</span>}
                  </div>
                  <div className={`grid gap-4 ${hasImages ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {group.options.map((opt) => {
                      const active = selectedInGroup.some((o) => o.id === opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => toggleOption(group.id, opt, group.maxSelection, group.minSelection)}
                          className={`relative rounded-2xl border-2 transition-all ${
                            hasImages ? 'aspect-square overflow-hidden' : 'p-4 text-left'
                          } ${active ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                        >
                          {hasImages && opt.image ? (
                            <>
                              <img src={opt.image} alt={opt.name} className="w-full h-full object-cover opacity-60" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              <div className="absolute bottom-2 left-2 right-2 text-center">
                                <span className="text-[10px] font-black text-white uppercase tracking-tighter block">{opt.name}</span>
                                {opt.price > 0 && <span className="text-[10px] text-yellow-500 font-bold">+ Rs. {opt.price}</span>}
                              </div>
                            </>
                          ) : (
                            <div>
                              <div className={`font-black text-sm uppercase tracking-tighter ${active ? 'text-white' : 'text-neutral-300'}`}>{opt.name}</div>
                              {opt.price > 0 && <div className="text-[11px] text-yellow-500 font-bold mt-1">+ Rs. {opt.price}</div>}
                            </div>
                          )}
                          {active && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Check size={12} className="text-black" strokeWidth={4} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            <div className="fixed bottom-0 left-0 right-0 lg:sticky lg:bottom-8 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl lg:bg-[#121212] border-t lg:border border-white/10 lg:rounded-[3rem] p-3 sm:p-4 lg:p-4 shadow-[0_-10px_50px_rgba(0,0,0,0.5)] lg:shadow-2xl flex items-center gap-3 sm:gap-4 lg:gap-6">
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 bg-white/5 rounded-[2rem] p-1.5 lg:p-2 border border-white/10 shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <Minus size={20} strokeWidth={3} />
                </button>
                <span className="text-lg sm:text-xl lg:text-2xl font-black text-white w-6 lg:w-8 text-center tabular-nums">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <Plus size={20} strokeWidth={3} />
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="flex-1 h-14 lg:h-20 bg-yellow-500 hover:bg-yellow-400 text-black rounded-[2rem] lg:rounded-[2.5rem] font-black text-base sm:text-lg lg:text-xl flex items-center justify-between px-4 sm:px-6 lg:px-10 shadow-[0_20px_50px_rgba(234,179,8,0.3)] transition-all group"
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <ShoppingBag size={20} strokeWidth={3} />
                  <span className="tracking-tighter uppercase">Add to Cart</span>
                </div>
                <div className="flex items-center gap-1 lg:gap-2">
                  <span className="text-[10px] lg:text-sm opacity-60 font-bold">Rs.</span>
                  <span className="text-2xl lg:text-3xl tracking-tighter">{totalPrice}</span>
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
