'use client';

import React, { useMemo, useState } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingBag, Star, Sparkles, Users } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { useMenu } from '@/hooks/useMenu';
import { useCart } from '@/context/CartContext';

interface SimpleProductPageProps {
  isOpen: boolean;
  productId: string;
  onClose: () => void;
}

export const SimpleProductPage: React.FC<SimpleProductPageProps> = ({ isOpen, productId, onClose }) => {
  const { location } = useLocation();
  const { addToCart } = useCart();
  const { products, isLoading } = useMenu(
    location.city,
    location.area,
    location.orderType === 'pickup' ? location.outlet : undefined,
  );

  const product = useMemo(() => products.find((p) => p.id === productId) ?? null, [products, productId]);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const totalPrice = (product?.basePrice ?? 0) * quantity;

  const getCategoryLabel = (catId: string) => {
    switch (catId) {
      case '56385': return 'Dessert';
      case '56386': return 'Beverage';
      case '56383': return 'Starter';
      default: return 'Special';
    }
  };

  return (
    <div className="fixed inset-0 z-[350] bg-[#0a0a0a] overflow-y-auto custom-scrollbar">
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="bg-white/5 hover:bg-white/10 text-white p-2.5 rounded-full border border-white/10 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-base sm:text-xl font-black text-white uppercase tracking-tighter">Product Details</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        {isLoading ? (
          <div className="text-center text-neutral-400 font-bold">Loading product...</div>
        ) : !product ? (
          <div className="text-center text-neutral-400 font-bold">Product not found.</div>
        ) : (
          <div className="relative bg-[#0a0a0a] w-full sm:max-w-xl mx-auto rounded-2xl sm:rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col">
            <div className="relative w-full aspect-square sm:aspect-[16/10] overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/20"></div>
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-8 flex flex-wrap gap-2 pr-4">
                {product.isNew && (
                  <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-[0_5px_15px_rgba(16,185,129,0.4)]">
                    <Sparkles size={12} fill="currentColor" />
                    New Arrival
                  </span>
                )}
                <span className="bg-yellow-500 text-black text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-[0_5px_15px_rgba(234,179,8,0.4)]">
                  {getCategoryLabel(product.category)}
                </span>
                {product.serves && (
                  <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-white/10">
                    <Users size={12} />
                    Serves {product.serves}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 p-5 sm:p-10 space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-[0.9] break-words">{product.name}</h2>
                <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-2xl border border-yellow-500/20 shrink-0">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-base font-black text-yellow-500">{product.rating || '4.8'}</span>
                </div>
              </div>

              <p className="text-neutral-400 text-sm sm:text-lg font-medium leading-relaxed max-w-md">
                {product.description || 'Indulge in this premium treat, crafted with the finest ingredients for a truly satisfying experience.'}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 sm:py-8 border-y border-white/5 gap-5 sm:gap-0">
                <div>
                  <span className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] block mb-2">Total Price</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-yellow-500 font-black text-lg">Rs.</span>
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter">{totalPrice}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-6 bg-white/5 rounded-[2rem] p-2 border border-white/10 shadow-inner">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Minus size={24} strokeWidth={3} />
                  </button>
                  <span className="text-xl sm:text-2xl font-black text-white w-8 text-center tabular-nums">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Plus size={24} strokeWidth={3} />
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  addToCart({
                    productId: product.id,
                    name: product.name,
                    image: product.image,
                    price: product.basePrice,
                    quantity,
                    selectedSize: product.sizes?.[0] || { id: 'regular', label: 'Regular', price: product.basePrice },
                    selectedOptions: {},
                  });
                  onClose();
                }}
                className="w-full h-16 sm:h-20 bg-yellow-500 hover:bg-yellow-400 text-black rounded-[2rem] sm:rounded-[2.5rem] font-black text-base sm:text-xl flex items-center justify-between px-5 sm:px-10 shadow-[0_20px_50px_rgba(234,179,8,0.3)] hover:shadow-[0_25px_60px_rgba(234,179,8,0.5)] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-black/10 p-2.5 sm:p-3 rounded-2xl group-hover:bg-black/20 transition-colors">
                    <ShoppingBag size={20} strokeWidth={3} />
                  </div>
                  <span className="tracking-tighter">ADD TO CART</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm opacity-60 font-bold">Rs.</span>
                  <span className="text-2xl sm:text-3xl tracking-tighter">{totalPrice}</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
