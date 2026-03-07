'use client'

import React, { useEffect, useRef } from 'react';
import { Category } from '@/types';

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({ categories, activeCategory, setActiveCategory }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeCategory && containerRef.current) {
      // Find the button with the data-id matching the active category
      const activeButton = containerRef.current.querySelector(`[data-id="${activeCategory}"]`) as HTMLElement;
      
      if (activeButton) {
        // Calculate the center position
        const container = containerRef.current;
        const scrollLeft = activeButton.offsetLeft - container.offsetWidth / 2 + activeButton.offsetWidth / 2;
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [activeCategory]);

  return (
    <div className="sticky top-20 md:top-24 z-30 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur border-b border-neutral-200 dark:border-white/5 py-2 md:py-4 transition-colors duration-300 shadow-sm">
      <div 
        ref={containerRef}
        className="flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-1 mask-linear-fade px-2 md:px-0"
      >
          {categories.map((cat) => (
            <button
              key={cat.id}
              data-id={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                whitespace-nowrap px-4 py-2 md:px-6 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300 ease-out flex-shrink-0 border
                ${activeCategory === cat.id 
                  ? 'bg-yellow-500 text-white border-yellow-500 shadow-lg shadow-yellow-500/25 scale-105' 
                  : 'bg-neutral-100 dark:bg-[#1a1a1a] text-neutral-600 dark:text-neutral-400 border-transparent hover:bg-neutral-200 dark:hover:bg-[#252525] hover:text-black dark:hover:text-white'}
              `}
            >
              {cat.label}
            </button>
          ))}
      </div>
    </div>
  );
};
