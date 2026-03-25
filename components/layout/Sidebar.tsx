'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Home, ShoppingBag, LogOut, Sun, Moon, User, MapPin, Gift, Flame } from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface SidebarProps {
  onOpenMenu: () => void;
  toggleCart: () => void;
  cartCount: number;
  isDark: boolean;
  toggleTheme: () => void;
  onOpenLogin: () => void;
  onOpenAccount?: () => void;
  onOpenSpin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onOpenMenu, 
  toggleCart, 
  cartCount, 
  isDark, 
  toggleTheme, 
  onOpenLogin,
  onOpenAccount,
  onOpenSpin,
}) => {
  const router = useRouter();
  const { user, logout } = useUser();
  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-24 flex-col items-center bg-white dark:bg-[#0a0a0a] border-r border-neutral-200 dark:border-white/5 py-8 z-50 transition-colors duration-300">
        {/* Top: Menu Icon */}
        <button 
          onClick={onOpenMenu}
          className="mb-8 w-12 h-12 flex items-center justify-center text-neutral-600 dark:text-white bg-neutral-100 dark:bg-white/5 rounded-2xl transition-all duration-300 hover:bg-yellow-500 hover:text-white dark:hover:bg-yellow-500 dark:hover:text-white hover:shadow-[0_0_20px_rgba(234,179,8,0.6)]"
        >
          <Menu size={22} strokeWidth={2.5} />
        </button>

        {/* Nav Icons */}
        <nav className="flex-1 flex flex-col gap-6 w-full items-center custom-scrollbar overflow-y-auto">
          <NavItem icon={<Home size={22} />} active tooltip="Home" />
          
          {/* Hot Deals Fire Icon */}
          <NavItem 
            icon={<Flame size={22} className="text-red-500 animate-pulse" />} 
            tooltip="Hot Deals" 
            onClick={() => router.push('/hot-deals')} 
          />

          <NavItem icon={<MapPin size={22} />} tooltip="Locations" onClick={() => router.push('/locations')} />
          
          {/* Spin & Win Button */}
          <NavItem 
            icon={<Gift size={22} className="text-pink-500" />} 
            tooltip="Spin & Win" 
            onClick={onOpenSpin} 
          />

          <NavItem
            icon={user ? (
              <span className="text-[13px] font-black">
                {user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            ) : <User size={22} />}
            tooltip={user ? 'My Account' : 'Sign In'}
            onClick={user ? onOpenAccount : onOpenLogin}
          />
          
          {/* Cart Icon in Sidebar with Badge */}
          <div className="relative mt-2">
              <button 
                  onClick={toggleCart}
                  className={`
                    w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 group relative
                    ${cartCount > 0 ? 'text-yellow-500 bg-yellow-500/10' : 'text-neutral-500 dark:text-neutral-500 hover:text-yellow-500'}
                    hover:bg-yellow-500/20 hover:shadow-[0_0_20px_rgba(234,179,8,0.6)]
                  `}
              >
                  <ShoppingBag size={22} strokeWidth={2.5} />
                  {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-[#0a0a0a]">
                          {cartCount}
                      </span>
                  )}
              </button>
          </div>
        </nav>

        {/* Bottom: Theme Toggle & Logout */}
        <div className="mt-auto flex flex-col gap-6 w-full items-center pb-4 pt-4 bg-white dark:bg-[#0a0a0a]">
          
          {/* Theme Toggle in Sidebar */}
          <button 
            onClick={toggleTheme}
            className="w-12 h-12 flex items-center justify-center rounded-2xl text-neutral-500 dark:text-neutral-400 hover:text-yellow-500 dark:hover:text-yellow-500 hover:bg-neutral-100 dark:hover:bg-white/5 hover:shadow-[0_0_15px_rgba(234,179,8,0.5)] transition-all duration-300"
          >
            {isDark ? <Sun size={22} /> : <Moon size={22} />}
          </button>

          {user && (
            <button
              onClick={logout}
              title="Log Out"
              className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </aside>

      {/* --- MOBILE FLOATING DOCK NAV --- */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className="bg-white/95 dark:bg-[#121212]/90 backdrop-blur-xl border border-neutral-200 dark:border-white/10 rounded-[2.5rem] px-2 py-2 flex items-center justify-between shadow-[0_10px_30px_-10px_rgba(148,163,184,0.35)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]">
            
            {/* 1. Home */}
            <div className="flex-1 flex justify-center">
                <button className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-white/5 backdrop-blur-sm flex items-center justify-center text-yellow-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] active:scale-95 transition-transform border border-neutral-200 dark:border-white/5">
                    <Home size={20} strokeWidth={2.5} fill="currentColor" fillOpacity={0.2} />
                </button>
            </div>

            {/* 2. Hot Deals (Fire Icon) - Replaced Utensils */}
            <div className="flex-1 flex justify-center">
                <button 
                  onClick={() => router.push('/hot-deals')}
                  className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-white/5 backdrop-blur-sm flex items-center justify-center text-red-500 hover:text-red-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] active:scale-95 transition-all border border-neutral-200 dark:border-white/5"
                >
                    <Flame size={20} strokeWidth={2.5} fill="currentColor" fillOpacity={0.2} className="animate-pulse" />
                </button>
            </div>

            {/* 3. Cart (Center - Elevated/Highlighted) */}
            <div className="flex-1 flex justify-center -mt-8">
                <button 
                    onClick={toggleCart}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white shadow-[0_8px_25px_rgba(234,179,8,0.5)] border-[4px] border-white dark:border-[#0a0a0a] active:scale-95 transition-transform relative"
                >
                    <ShoppingBag size={24} strokeWidth={2.5} />
                    {cartCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-[#0a0a0a]">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>

            {/* 4. Spin (Gift) */}
            <div className="flex-1 flex justify-center">
                <button 
                    onClick={onOpenSpin}
                  className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-white/5 backdrop-blur-sm flex items-center justify-center text-pink-500 hover:text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] active:scale-95 transition-all border border-neutral-200 dark:border-white/5"
                >
                    <Gift size={20} strokeWidth={2} />
                </button>
            </div>

            {/* 5. Hamburger Menu (Far Right) */}
            <div className="flex-1 flex justify-center">
                <button 
                    onClick={onOpenMenu}
                  className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-white/5 backdrop-blur-sm flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] active:scale-95 transition-all border border-neutral-200 dark:border-white/5"
                >
                    <Menu size={20} strokeWidth={2} />
                </button>
            </div>

        </div>
      </div>
    </>
  );
};

const NavItem = ({ icon, active, tooltip, onClick }: { icon: React.ReactNode, active?: boolean, tooltip: string, onClick?: () => void }) => (
  <button 
    title={tooltip}
    onClick={onClick}
    className={`
      w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 group relative
      ${active 
        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-[0_0_20px_rgba(234,179,8,0.6)]' 
        : 'text-neutral-500 dark:text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]'}
    `}
  >
    {icon}
  </button>
);

