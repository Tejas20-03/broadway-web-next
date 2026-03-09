'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, ChevronRight, LogOut, Info, FileText, 
  PenLine, Utensils, Gift, Briefcase, Store, 
  MessageCircle, Facebook, Instagram, PhoneCall,
  MapPin, Sun, Moon, ThumbsUp, User
} from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact?: () => void;
  onOpenFranchise?: () => void;
  onOpenBirthday?: () => void;
  onOpenFeedback?: () => void;
  onOpenAccount?: () => void;
  onOpenLogin?: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ 
  isOpen, 
  onClose, 
  onOpenContact, 
  onOpenFranchise,
  onOpenBirthday,
  onOpenFeedback,
  onOpenAccount,
  onOpenLogin,
  isDark,
  toggleTheme
}) => {
  const router = useRouter();
  const { user, logout } = useUser();

  const initials = user
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : null;

  const handleLogout = () => { logout(); onClose(); };
  const handleAccountClick = () => {
    onClose();
    if (user) onOpenAccount?.();
    else onOpenLogin?.();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className={`fixed inset-y-0 left-0 w-[320px] bg-white dark:bg-[#0a0a0a] border-r border-neutral-200 dark:border-white/5 z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header - User Profile */}
        <div className="p-6 border-b border-neutral-200 dark:border-white/5 flex items-center justify-between bg-neutral-50 dark:bg-[#121212]">
           <button onClick={handleAccountClick} className="flex items-center gap-3 flex-1 min-w-0 text-left">
             <div className="w-14 h-14 rounded-full bg-yellow-500 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-yellow-500/20 ring-4 ring-white dark:ring-[#0a0a0a] shrink-0">
               {initials ?? <User size={24} />}
             </div>
             <div className="min-w-0">
               <h3 className="text-neutral-900 dark:text-white font-bold text-lg leading-tight truncate">
                 {user ? user.name : 'Sign In'}
               </h3>
               <p className="text-yellow-600 dark:text-yellow-500 text-xs font-bold uppercase tracking-wider">
                 {user ? user.phone : 'Tap to login'}
               </p>
             </div>
           </button>
           <button onClick={onClose} className="text-neutral-400 hover:text-black dark:hover:text-white bg-transparent hover:bg-neutral-200 dark:hover:bg-white/10 rounded-full p-2 transition-colors shrink-0">
             <X size={24} />
           </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Main Navigation */}
          <div className="py-2">
            <NavItem icon={<MapPin size={20} />} label="Our Locations" onClick={() => { onClose(); router.push('/locations'); }} />
            <NavItem icon={<FileText size={20} />} label="Broadway Blog" onClick={() => { onClose(); router.push('/blog'); }} />
            <NavItem icon={<MessageCircle size={20} />} label="Support & Contact" onClick={() => { onClose(); onOpenContact?.(); }} />
            <NavItem icon={<ThumbsUp size={20} />} label="Share Feedback" onClick={() => { onClose(); onOpenFeedback?.(); }} />
          </div>

          <div className="border-t border-neutral-100 dark:border-white/5 mx-6"></div>
          
          {/* Extra Services */}
          <div className="py-2">
            <NavItem icon={<Utensils size={20} />} label="Catering Services" />
            <NavItem icon={<Gift size={20} />} label="Birthday Parties" onClick={() => { onClose(); onOpenBirthday?.(); }} />
            <NavItem icon={<Briefcase size={20} />} label="Corporate Deals" />
            <NavItem icon={<Store size={20} />} label="Franchise Info" onClick={() => { onClose(); onOpenFranchise?.(); }} />
          </div>

          <div className="border-t border-neutral-100 dark:border-white/5 mx-6"></div>

          {/* Theme Toggle Area */}
          <div className="px-6 py-6">
            <button 
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-4 bg-neutral-100 dark:bg-white/5 rounded-2xl border border-transparent dark:border-white/5 transition-all group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1a1a1a] flex items-center justify-center text-yellow-500 shadow-sm transition-transform group-active:scale-90">
                        {isDark ? <Moon size={18} fill="currentColor" /> : <Sun size={18} fill="currentColor" />}
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-bold text-neutral-900 dark:text-white">Dark Mode</span>
                        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide">{isDark ? 'Enabled' : 'Disabled'}</span>
                    </div>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isDark ? 'bg-yellow-500' : 'bg-neutral-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${isDark ? 'left-6' : 'left-1'}`}></div>
                </div>
            </button>
          </div>

          {/* Social Links */}
          <div className="px-6 py-4">
            <h4 className="text-neutral-400 dark:text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Social Network</h4>
            <div className="grid grid-cols-3 gap-2">
                <SocialPill icon={<Facebook size={16} />} label="Facebook" href="https://www.facebook.com/Broadwaypizzaa" />
                <SocialPill icon={<Instagram size={16} />} label="Instagram" href="https://www.instagram.com/broadwaypizzaa/?theme=dark" />
                <SocialPill icon={<MessageCircle size={16} />} label="WhatsApp" href="https://api.whatsapp.com/send/?phone=%2B9221111339339&text&type=phone_number&app_absent=0" />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-[#121212]">
           {user ? (
             <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-red-600 dark:text-red-500 hover:text-white hover:bg-red-600 dark:hover:bg-red-600 transition-all w-full font-bold py-3.5 rounded-xl bg-red-50 dark:bg-red-500/10">
               <LogOut size={20} />
               <span>Log Out</span>
             </button>
           ) : (
             <button onClick={handleAccountClick} className="flex items-center justify-center gap-2 text-black dark:text-white hover:bg-yellow-500 hover:text-white transition-all w-full font-bold py-3.5 rounded-xl bg-yellow-500/10 dark:bg-yellow-500/10">
               <User size={20} />
               <span>Sign In</span>
             </button>
           )}
           <p className="text-neutral-400 dark:text-neutral-600 text-[10px] mt-4 text-center font-bold uppercase tracking-widest opacity-50">Broadway App v2.4.0</p>
        </div>
      </div>
    </>
  );
};

const NavItem = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between px-6 py-4 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors group"
  >
    <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-yellow-500 transition-colors">
      <span className="text-neutral-400 dark:text-neutral-500 group-hover:text-black dark:group-hover:text-yellow-500 transition-colors">
        {icon}
      </span>
      <span className="font-bold text-base tracking-tight">{label}</span>
    </div>
    <ChevronRight size={16} className="text-neutral-300 dark:text-neutral-700 group-hover:text-black dark:group-hover:text-white transition-colors" />
  </button>
);

const SocialPill = ({ icon, label, href }: { icon: React.ReactNode, label: string, href?: string }) => (
    <a 
      href={href || "#"} 
      target={href ? "_blank" : "_self"}
      rel="noreferrer"
      className="flex flex-col items-center justify-center gap-1.5 py-3 bg-neutral-100 dark:bg-white/5 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-white hover:bg-yellow-500 transition-all"
    >
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
    </a>
);
