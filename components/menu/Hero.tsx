'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useGetBannersQuery } from '@/store/apiSlice';
import { useLocation } from '@/context/LocationContext';

export const Hero: React.FC = () => {
  const { location } = useLocation();
  const { data: banners = [] } = useGetBannersQuery(location.city);
  const [current, setCurrent] = useState(0);

  useEffect(() => { setCurrent(0); }, [location.city]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="w-full rounded-[2rem] overflow-hidden shadow-xl dark:shadow-black/50 border border-neutral-200 dark:border-white/5 relative group bg-white dark:bg-[#121212]">
      <div className="relative w-full aspect-[16/9] md:aspect-[21/8]">
        {/* Slides */}
        {banners.map((src, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={src}
              alt={`Banner ${index + 1}`}
              fill
              className="object-cover object-center"
              priority={index === 0}
              sizes="100vw"
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 dark:to-black/50"></div>
          </div>
        ))}

        {/* Indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`
                  h-1.5 rounded-full transition-all duration-500 backdrop-blur-md
                  ${idx === current 
                    ? 'w-8 bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]' 
                    : 'w-2 bg-white/50 hover:bg-white/80'}
                `}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
