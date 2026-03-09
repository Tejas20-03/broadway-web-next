'use client'


import React from 'react';
import Image from 'next/image';
import { Plus, Star, Flame, Sparkles, TrendingUp, Zap, Percent } from 'lucide-react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  const imageUrl = product.image && product.image.length > 0
    ? product.image 
    : 'https://images.unsplash.com/photo-1513104890138-7c749659a591';

  const discountPercentage = product.originalPrice && product.originalPrice > product.basePrice
    ? Math.round(((product.originalPrice - product.basePrice) / product.originalPrice) * 100)
    : 0;

  const renderBadges = () => {
    const badges = [];
    if (product.isNew) {
      badges.push(
        <div key="new" className="backdrop-blur-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={8} fill="currentColor" />
            NEW
        </div>
      );
    }
    if (discountPercentage > 0) {
      badges.push(
        <div key="off" className="backdrop-blur-md bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Percent size={8} strokeWidth={3} />
            {discountPercentage}%
        </div>
      );
    }
    return badges;
  };

  return (
    <div 
      onClick={() => onAdd(product)}
      className="
        group relative flex flex-col h-full cursor-pointer
        bg-[#0f0f0f]/80 backdrop-blur-xl
        rounded-[1.5rem] md:rounded-[2rem] overflow-hidden
        border border-white/5 
        transition-all duration-500 ease-out
        hover:border-yellow-500/30
        hover:shadow-[0_0_30px_-10px_rgba(234,179,8,0.2)]
      "
    >
      {/* Image Section - Edge to Edge on Mobile */}
      <div className="relative h-40 md:h-56 w-full overflow-hidden p-0 md:p-3 md:pb-0">
        <div className="w-full h-full md:rounded-[1.5rem] overflow-hidden relative bg-[#1a1a1a]">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent opacity-60"></div>
            <div className="absolute top-2 left-2 flex flex-col items-start gap-1.5 z-10">
                {renderBadges()}
            </div>
            {product.rating && (
                <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-lg flex items-center gap-1 border border-white/10 shadow-lg z-10">
                    <Star size={8} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-[9px] font-bold text-white tracking-wide">{product.rating}</span>
                </div>
            )}
        </div>
      </div>

      {/* Content Section - Reduced Padding for Mobile */}
      <div className="flex flex-col flex-1 px-2.5 pb-2.5 pt-2 md:px-5 md:pb-5 md:pt-3 relative z-10">
        <h3 className="text-white text-sm md:text-[17px] font-black leading-tight group-hover:text-yellow-500 transition-colors line-clamp-1 tracking-tight">
          {product.name}
        </h3>
        <p className="text-neutral-500 text-[9px] md:text-xs leading-relaxed line-clamp-1 md:line-clamp-2 mt-1 font-medium">
          {product.description || "Freshly baked with premium ingredients."}
        </p>

        <div className="mt-auto pt-3 flex items-end justify-between">
            <div className="flex flex-col leading-none">
                {discountPercentage > 0 && (
                    <span className="text-[8px] md:text-[10px] text-neutral-600 font-bold line-through mb-0.5">
                        Rs. {product.originalPrice}
                    </span>
                )}
                <div className="flex items-baseline gap-0.5">
                    <span className="text-yellow-500 text-[9px] md:text-xs font-bold">Rs.</span>
                    <span className="text-white text-lg md:text-2xl font-black tracking-tighter">
                        {product.basePrice}
                    </span>
                </div>
            </div>
            <button className="w-8 h-8 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#252525] text-white border border-white/10 flex items-center justify-center transition-all hover:border-yellow-500 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                <Plus size={16} strokeWidth={3} className="md:w-5 md:h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

