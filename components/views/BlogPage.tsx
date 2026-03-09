'use client'

import React from 'react';
import Image from 'next/image';
import { X, ArrowRight, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { useGetBlogPostsQuery } from '@/store/apiSlice';
import { BlogPost } from '@/types';

interface BlogPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Behind the Scenes': 'bg-yellow-500',
  'Foodie Guide': 'bg-red-500',
  'Community': 'bg-purple-500',
  'Hacks': 'bg-blue-500',
  'Lifestyle': 'bg-pink-500',
};

export const BlogPage: React.FC<BlogPageProps> = ({ isOpen, onClose }) => {
  const { data: posts = [], isLoading } = useGetBlogPostsQuery(undefined, { skip: !isOpen });

  if (!isOpen) return null;

  const featured = posts[0] ?? null;
  const rest = posts.slice(1);

  return (
    <div className="fixed inset-0 z-[80] bg-[#0a0a0a] overflow-y-auto animate-in slide-in-from-right duration-300 custom-scrollbar">

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight italic transform -skew-x-6">Broadway Blogs</h1>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5 hover:rotate-90 duration-300"
        >
          <X size={24} />
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Hero Section */}
        <div className="mb-12 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-32 bg-yellow-500/20 blur-[80px] rounded-full pointer-events-none"></div>
          <h2 className="relative text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
            Fresh Dough.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">Fresh Stories.</span>
          </h2>
          <p className="text-neutral-400 font-medium max-w-xl mx-auto text-sm md:text-base">
            Dive into the world of cheesy goodness, spicy takes, and everything happening at Broadway.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-32 text-neutral-500">
            <Loader2 size={32} className="animate-spin mr-3" /> Loading posts...
          </div>
        )}

        {/* Bento Grid Layout */}
        {!isLoading && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[300px] md:auto-rows-[250px]">

            {/* Large Featured Post */}
            {featured && (
              <div className="md:col-span-2 md:row-span-2 group relative rounded-3xl overflow-hidden cursor-pointer border border-white/5 bg-[#121212]">
                {featured.image && (
                  <Image
                    src={featured.image}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 66vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                    priority
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide flex items-center gap-1">
                    <Sparkles size={12} /> Featured
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
                  <div className="flex items-center gap-2 mb-2 text-neutral-300 text-xs font-bold uppercase tracking-wider">
                    <span>{featured.date}</span>
                    {featured.readTime && <><span>•</span><span>{featured.readTime}</span></>}
                  </div>
                  <h3 className="text-3xl md:text-5xl font-black text-white leading-none mb-4 group-hover:text-yellow-400 transition-colors">
                    {featured.title}
                  </h3>
                  <p className="text-neutral-300 text-sm md:text-lg line-clamp-2 md:w-3/4 mb-6">
                    {featured.excerpt}
                  </p>
                  <button className="bg-white text-black px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wide hover:bg-yellow-400 transition-colors">
                    Read Now
                  </button>
                </div>
              </div>
            )}

            {/* Smaller Posts */}
            {rest.map((post) => (
              <div key={post.id} className="group relative rounded-3xl overflow-hidden cursor-pointer border border-white/5 bg-[#121212] flex flex-col">
                <div className="h-1/2 overflow-hidden relative">
                  {post.image && (
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`${CATEGORY_COLORS[post.category] ?? 'bg-yellow-500'} text-white px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide shadow-lg`}>
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="flex-1 p-5 flex flex-col relative z-10 bg-[#121212]">
                  <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">{post.date}</div>
                  <h3 className="text-lg font-black text-white leading-tight mb-2 group-hover:text-yellow-500 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-neutral-400 text-xs line-clamp-2 mb-4 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
                    <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[8px] text-white">BP</div>
                    <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Newsletter Box */}
            <div className="md:col-span-1 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <TrendingUp className="text-white mb-4" size={32} />
                <h3 className="text-2xl font-black text-white uppercase leading-none mb-2">Stay in the loop</h3>
                <p className="text-white/80 text-xs mb-4">{"Don't miss out on the latest drops."}</p>
                <div className="flex gap-2">
                  <input type="email" placeholder="Email..." className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder:text-white/50 focus:outline-none focus:bg-black/40" />
                  <button className="bg-white text-black rounded-lg px-3 py-2 font-bold text-xs hover:bg-yellow-400 transition-colors">GO</button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Empty State */}
        {!isLoading && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 opacity-30">
            <h2 className="text-xl font-black uppercase tracking-widest">No Posts Found</h2>
          </div>
        )}

      </div>
    </div>
  );
};
