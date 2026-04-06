'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Star, Sparkles, ArrowLeft, Users } from 'lucide-react';
import { Product } from '@/types';

interface SimpleProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: any) => void;
  onOpenProductPage: (productId: string) => void;
  onOpenCategoryPage: (categoryId: string) => void;
  categoryLabel?: string;
}

export const SimpleProductModal: React.FC<SimpleProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onOpenProductPage,
  onOpenCategoryPage,
  categoryLabel,
}) => {
  const [quantity, setQuantity] = useState(1);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (product) setQuantity(1);
  }, [product]);

  useEffect(() => {
    if (!isOpen || !product) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    modalRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!modalRef.current) return;

      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
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
  }, [isOpen, product, onClose]);

  if (!product) return null;

  const totalPrice = product.basePrice * quantity;

  const getCategoryText = (catId: string) => {
    switch (catId) {
      case '56385':
        return 'Dessert';
      case '56386':
        return 'Beverage';
      case '56383':
        return 'Starter';
      default:
        return 'Special';
    }
  };

  const handleAddToCart = () => {
    onAddToCart({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.basePrice,
      quantity,
      category: product.category,
      selectedSize: product.sizes?.[0] || { id: 'regular', label: 'Regular', price: product.basePrice },
      selectedOptions: {},
      minimumDelivery: product.minimumDelivery,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center sm:p-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label="Product quick view"
            tabIndex={-1}
            className="relative bg-[#0a0a0a] w-full h-full sm:h-auto sm:max-w-xl sm:rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col focus:outline-none"
          >
        <div className="sm:hidden absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="bg-black/40 backdrop-blur-md text-white p-3 rounded-full border border-white/10 shadow-lg">
            <ArrowLeft size={24} />
          </motion.button>
        </div>

        <div className="relative w-full aspect-square sm:aspect-[16/10] overflow-hidden">
          <motion.img
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/20" />

          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="hidden sm:flex absolute top-6 right-6 bg-black/40 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur transition-all border border-white/10 z-20"
          >
            <X size={24} />
          </motion.button>

          <div className="absolute bottom-6 left-8 flex flex-wrap gap-2">
            {product.isNew && (
              <motion.span
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-[0_5px_15px_rgba(16,185,129,0.4)]"
              >
                <Sparkles size={12} fill="currentColor" />
                New Arrival
              </motion.span>
            )}
            <motion.span
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-yellow-500 text-black text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-[0_5px_15px_rgba(234,179,8,0.4)]"
            >
              {getCategoryText(product.category)}
            </motion.span>
            {product.serves && (
              <motion.span
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/10 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-white/10"
              >
                <Users size={12} />
                Serves {product.serves}
              </motion.span>
            )}
          </div>
        </div>

        <div className="flex-1 p-8 sm:p-10 space-y-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-start gap-4 mb-4">
              <h2 onClick={() => onOpenProductPage(product.id)} className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-[0.9] drop-shadow-2xl cursor-pointer hover:text-yellow-500 transition-colors">
                {product.name}
              </h2>
              <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-2xl border border-yellow-500/20 shrink-0">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="text-base font-black text-yellow-500">{product.rating || '4.8'}</span>
              </div>
            </div>

            {categoryLabel && (
              <button onClick={() => onOpenCategoryPage(product.category)} className="mb-6 inline-block bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-white/5 transition-all">
                {categoryLabel}
              </button>
            )}
            <p className="text-neutral-400 text-base sm:text-lg font-medium leading-relaxed max-w-md">
              {product.description || 'Indulge in this premium treat, crafted with the finest ingredients for a truly satisfying experience.'}
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between py-8 border-y border-white/5"
          >
            <div className="flex flex-col">
              <span className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Price</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-yellow-500 font-black text-lg">Rs.</span>
                <span className="text-4xl font-black text-white tracking-tighter">{totalPrice}</span>
              </div>
            </div>

            <div className="flex items-center gap-6 bg-white/5 rounded-[2rem] p-2 border border-white/10 shadow-inner">
              <motion.button whileTap={{ scale: 0.8 }} onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <Minus size={24} strokeWidth={3} />
              </motion.button>
              <span className="text-2xl font-black text-white w-8 text-center tabular-nums">{quantity}</span>
              <motion.button whileTap={{ scale: 0.8 }} onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <Plus size={24} strokeWidth={3} />
              </motion.button>
            </div>
          </motion.div>

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            className="w-full h-20 bg-yellow-500 hover:bg-yellow-400 text-black rounded-[2.5rem] font-black text-xl flex items-center justify-between px-10 shadow-[0_20px_50px_rgba(234,179,8,0.3)] hover:shadow-[0_25px_60px_rgba(234,179,8,0.5)] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-black/10 p-3 rounded-2xl group-hover:bg-black/20 transition-colors">
                <ShoppingBag size={24} strokeWidth={3} />
              </div>
              <span className="tracking-tighter">ADD TO CART</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-60 font-bold">Rs.</span>
              <span className="text-3xl tracking-tighter">{totalPrice}</span>
            </div>
          </motion.button>
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
