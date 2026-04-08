'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Filter, Loader2 } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { useMenu } from '@/hooks/useMenu';
import { ProductCard } from '@/components/menu/ProductCard';
import { useLazyGetProductOptionsQuery } from '@/store/apiSlice';
import { CategoryTimeBadge } from '@/components/menu/CategoryTimeBadge';

interface CategoryPageProps {
  isOpen: boolean;
  categoryId: string;
  onClose: () => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ isOpen, categoryId, onClose }) => {
  const router = useRouter();
  const { location } = useLocation();
  const [resolveOpenLoading, setResolveOpenLoading] = React.useState(false);
  const [triggerProductOptions] = useLazyGetProductOptionsQuery();
  const { categories, products, isLoading } = useMenu(
    location.city,
    location.area,
    location.orderType === 'pickup' ? location.outlet : undefined,
  );

  if (!isOpen) return null;

  const category = categories.find((c) => c.id === categoryId);
  const categoryProducts = products.filter((p) => p.category === categoryId);

  const handleOpenProduct = React.useCallback(async (product: (typeof products)[number]) => {
    setResolveOpenLoading(true);
    let next = `/simple-product/${encodeURIComponent(product.id)}`;

    try {
      const result = await triggerProductOptions(
        { itemId: product.id, city: location.city, area: location.area },
        true,
      );

      const data = result.data;
      const optionGroupsCount = data?.optionGroups?.length ?? 0;
      const sizeCount = data?.sizes?.length ?? 0;
      const sizeOptionGroups = data?.sizeOptionGroups ?? {};
      const hasSizeOptionGroups = Object.values(sizeOptionGroups).some(
        (groups) => Array.isArray(groups) && groups.length > 0,
      );

      const hasRealOptions = optionGroupsCount > 0 || hasSizeOptionGroups || sizeCount > 1;
      next = hasRealOptions
        ? `/product/${encodeURIComponent(product.id)}`
        : `/simple-product/${encodeURIComponent(product.id)}`;
    } catch {
      const hasFallbackOptions =
        (product.optionGroups?.length ?? 0) > 0
        || (product.sizes?.length ?? 0) > 1
        || Object.keys(product.sizeOptionGroups ?? {}).length > 0;

      next = hasFallbackOptions
        ? `/product/${encodeURIComponent(product.id)}`
        : `/simple-product/${encodeURIComponent(product.id)}`;
    }

    setResolveOpenLoading(false);
    router.push(next);
  }, [triggerProductOptions, location.city, location.area, router]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[400] bg-[#0a0a0a] overflow-y-auto custom-scrollbar"
    >
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-4 py-4 md:px-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="bg-white/5 hover:bg-white/10 text-white p-2.5 rounded-full border border-white/10 transition-colors"
          >
            <ArrowLeft size={24} />
          </motion.button>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-none truncate max-w-[48vw] sm:max-w-none">
                {category?.label ?? 'Category'}
              </h1>
              <CategoryTimeBadge category={category} variant="dark" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[8px] md:text-[10px] text-yellow-500 font-black uppercase tracking-widest">
                {categoryProducts.length} Items
              </span>
              <span className="w-1 h-1 rounded-full bg-neutral-700"></span>
              <span className="text-[8px] md:text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                Premium Selection
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="hidden sm:flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all"
          >
            Menu
          </button>
          <button className="bg-white/5 hover:bg-white/10 text-white p-2.5 rounded-full border border-white/10 transition-colors flex sm:hidden">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="relative h-[30vh] md:h-[40vh] overflow-hidden">
        <motion.img
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src={`https://picsum.photos/seed/${categoryId}/1920/1080?blur=2`}
          alt={category?.label ?? 'Category'}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <span className="inline-block bg-yellow-500 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Explore Menu
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <h2 className="text-4xl sm:text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9] break-words">
                {category?.label ?? 'Category'}
              </h2>
              <CategoryTimeBadge category={category} variant="dark" />
            </div>
            <p className="text-neutral-400 max-w-xl mx-auto text-xs sm:text-sm md:text-lg font-medium leading-relaxed">
              Discover our premium selection of {(category?.label ?? 'category').toLowerCase()} items, crafted with the finest ingredients and authentic recipes.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {isLoading ? (
          <div className="text-center text-neutral-400 font-bold">Loading products...</div>
        ) : categoryProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {categoryProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard
                  product={product}
                  onAdd={handleOpenProduct}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-white/5 p-8 rounded-full mb-6">
              <ShoppingBag size={48} className="text-neutral-700" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">No Items Found</h3>
            <p className="text-neutral-500 mt-2">We couldn't find any items in this category.</p>
            <button
              onClick={onClose}
              className="mt-8 bg-yellow-500 text-black px-8 py-3 rounded-full font-black uppercase tracking-widest hover:bg-yellow-400 transition-colors"
            >
              Back to Menu
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-white/5 bg-white/[0.02] py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <h4 className="text-white font-black uppercase tracking-tighter">Fast Delivery</h4>
            <p className="text-neutral-500 text-sm">Hot and fresh to your doorstep in 30 mins.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-black uppercase tracking-tighter">Quality Ingredients</h4>
            <p className="text-neutral-500 text-sm">We use only the finest and freshest ingredients.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-black uppercase tracking-tighter">Authentic Taste</h4>
            <p className="text-neutral-500 text-sm">Traditional recipes passed down through generations.</p>
          </div>
        </div>
      </div>

      {resolveOpenLoading && (
        <div className="fixed inset-0 z-[430] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-yellow-500" />
        </div>
      )}
    </motion.div>
  );
};
