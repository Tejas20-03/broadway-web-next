'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube, Phone } from 'lucide-react';
import { MessageCircle } from 'lucide-react';

interface FooterProps {
  onOpenContact?: () => void;
  onOpenFeedback?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContact, onOpenFeedback }) => {
  return (
    <footer className="bg-white dark:bg-[#0a0a0a] border-t border-neutral-200 dark:border-white/5 pt-16 pb-24 md:pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: App Download & Brand */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-16 bg-neutral-50 dark:bg-[#121212] p-8 rounded-[2rem] border border-neutral-100 dark:border-white/5">
          <div className="text-center lg:text-left max-w-lg">
            <h2 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white tracking-tighter mb-3">
              Order faster with our App
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
              Download the Broadway Pizza App for exclusive deals, real-time order tracking, and seamless reordering.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a href="#" className="group transition-transform hover:scale-105 duration-300 focus:outline-none">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
                width={160}
                height={56}
                className="h-14 w-auto drop-shadow-sm group-hover:drop-shadow-lg transition-all"
              />
            </a>
            <a href="#" className="group transition-transform hover:scale-105 duration-300 focus:outline-none">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                alt="Download on the App Store"
                width={160}
                height={56}
                className="h-14 w-auto drop-shadow-sm group-hover:drop-shadow-lg transition-all"
              />
            </a>
          </div>
        </div>

        {/* Middle Section: Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
            <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <Image
                        src="https://www.broadwaypizza.com.pk/assets/broadwayPizzaLogo.png"
                        alt="Broadway Logo"
                        width={140}
                        height={40}
                        className="h-10 w-auto opacity-80 grayscale hover:grayscale-0 transition-all"
                    />
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                    Taste the perfection in every slice. We are committed to serving the best pizza in town with premium ingredients.
                </p>
            </div>

            <div>
                <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest mb-6">Company</h3>
                <ul className="space-y-3">
                <li><Link href="/" className="text-sm text-neutral-500 hover:text-yellow-500 transition-colors">Home</Link></li>
                    <li><Link href="/blog" className="text-sm text-neutral-500 hover:text-yellow-500 transition-colors">Blog</Link></li>
                <li><Link href="/hot-deals" className="text-sm text-neutral-500 hover:text-yellow-500 transition-colors">Hot Deals</Link></li>
                <li><Link href="/account" className="text-sm text-neutral-500 hover:text-yellow-500 transition-colors">My Account</Link></li>
                </ul>
            </div>
            
            <div>
                <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest mb-6">Support</h3>
                <ul className="space-y-3">
                    <li><button onClick={onOpenContact} className="text-sm text-neutral-500 hover:text-yellow-500 transition-colors">Contact Us</button></li>
                    <li><button onClick={onOpenFeedback} className="text-sm text-neutral-500 hover:text-yellow-500 transition-colors">Feedback</button></li>
                    <li><Link href="/locations" className="text-sm text-neutral-500 hover:text-yellow-500 transition-colors">Our Locations</Link></li>
                </ul>
            </div>

             <div>
                <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest mb-6">Social</h3>
                <div className="flex gap-3">
                    <SocialIcon href="https://www.facebook.com/Broadwaypizzaa" icon={<Facebook size={18} />} />
                    <SocialIcon href="https://www.instagram.com/broadwaypizzaa/?theme=dark" icon={<Instagram size={18} />} />
                    <SocialIcon href="https://api.whatsapp.com/send/?phone=%2B9221111339339&text&type=phone_number&app_absent=0" icon={<MessageCircle size={18} />} />
                    <SocialIcon href="tel:021-111-339-339" icon={<Phone size={18} />} />
                </div>
                <div className="mt-6">
                    <p className="text-xs text-neutral-500 italic leading-relaxed">
                        &ldquo;Wherever your craving calls — we&apos;re already there, one perfect slice away.&rdquo;
                    </p>
                </div>
            </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="border-t border-neutral-100 dark:border-white/5 pt-8 flex flex-col items-center gap-3">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                <p className="text-xs text-neutral-400 font-medium text-center md:text-left">
                    © {new Date().getFullYear()} Broadway Pizza Pakistan [J &amp; S CORPORATION]. All rights reserved.
                </p>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">
                    Created and managed with care by{' '}
                    <a
                      href="https://cloubuzz.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-yellow-500/60 underline-offset-2 hover:decoration-yellow-400 transition-colors"
                    >
                      Cloubuzz
                    </a>
                  </span>
                </div>
            </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ icon, href }: { icon: React.ReactNode; href: string }) => (
    <a href={href} target={href.startsWith('tel:') ? '_self' : '_blank'} rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-yellow-500 hover:text-black dark:hover:bg-yellow-500 dark:hover:text-black transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {icon}
    </a>
)
