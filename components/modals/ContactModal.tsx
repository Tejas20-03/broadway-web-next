'use client'

import React from 'react';
import { X, Send, Phone, MessageCircle, Mail, MapPin, Headphones, ArrowRight, ExternalLink } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full h-[100dvh] md:h-[600px] max-w-4xl bg-[#0a0a0a] border-0 md:border border-white/10 rounded-none md:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
        
        {/* Mobile Sticky Close Button */}
        <div className="md:hidden sticky top-4 right-4 z-[110] flex justify-end px-4 mb-[-40px] pointer-events-none">
            <button 
                onClick={onClose}
                className="pointer-events-auto p-2 bg-black/60 backdrop-blur-md hover:bg-black/80 rounded-full text-white transition-colors border border-white/10 shadow-lg"
            >
                <X size={20} />
            </button>
        </div>

        {/* Left Panel: Contact Info & Quick Actions */}
        <div className="w-full md:w-[40%] bg-[#121212] border-b md:border-b-0 md:border-r border-white/5 flex flex-col relative shrink-0 h-auto md:h-full md:overflow-y-auto">
            {/* Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="p-8 flex-1 flex flex-col">
                
                {/* Header */}
                <div className="mb-8 pt-6 md:pt-0">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-500 flex items-center justify-center text-black mb-4 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                        <Headphones size={24} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none mb-2">Get in<br/>Touch</h2>
                    <p className="text-neutral-500 text-sm font-medium">We'd love to hear from you. Our team is always here to chat.</p>
                </div>

                {/* Direct Actions */}
                <div className="space-y-4 mb-8">
                    <a href="tel:111339339" className="group flex items-center gap-4 p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 hover:border-yellow-500/50 hover:bg-[#222] transition-all">
                        <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-black transition-colors">
                            <Phone size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Call Us (UAN)</p>
                            <p className="text-white font-black text-lg">111-339-339</p>
                        </div>
                    </a>

                    <a href="https://wa.me/9221111339339" target="_blank" rel="noreferrer" className="group flex items-center gap-4 p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 hover:border-yellow-500/50 hover:bg-[#222] transition-all">
                        <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-black transition-colors">
                            <MessageCircle size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">WhatsApp Support</p>
                            <p className="text-white font-black text-lg">Chat Now</p>
                        </div>
                    </a>
                </div>

                {/* Email Departments */}
                <div className="mt-auto">
                    <p className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Mail size={14} className="text-yellow-500" /> 
                        Department Emails
                    </p>
                    <div className="space-y-2">
                        {[
                            { label: 'General Info', email: 'info@broadwaypizza.com.pk' },
                            { label: 'Franchise', email: 'franchise@broadwaypizza.com.pk' },
                            { label: 'Marketing', email: 'marketing@broadwaypizza.com.pk' }
                        ].map((dept, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                <span className="text-xs text-neutral-500 font-medium">{dept.label}</span>
                                <a href={`mailto:${dept.email}`} className="text-xs text-neutral-300 hover:text-yellow-500 transition-colors flex items-center gap-1">
                                    {dept.email.split('@')[0]}...
                                    <ExternalLink size={10} />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>

        {/* Right Panel: Message Form */}
        <div className="w-full md:flex-1 bg-[#0a0a0a] flex flex-col relative h-auto md:h-full md:overflow-y-auto">
            
            {/* Desktop Close Button */}
            <button 
                onClick={onClose}
                className="hidden md:block absolute top-6 right-6 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5"
            >
                <X size={20} />
            </button>

            <div className="flex-1 p-8">
                <div className="max-w-md mx-auto h-full flex flex-col justify-center">
                    
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2">Send us a message</h3>
                        <p className="text-neutral-500 text-sm">Have a suggestion or complaint? Fill out the form below.</p>
                    </div>

                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5 group">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest group-focus-within:text-yellow-500 transition-colors">Name</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-700 focus:outline-none focus:border-yellow-500 focus:bg-[#1a1a1a] transition-all text-sm font-medium"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-1.5 group">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest group-focus-within:text-yellow-500 transition-colors">Phone</label>
                                <input 
                                    type="tel" 
                                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-700 focus:outline-none focus:border-yellow-500 focus:bg-[#1a1a1a] transition-all text-sm font-medium"
                                    placeholder="0300..."
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 group">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest group-focus-within:text-yellow-500 transition-colors">Subject</label>
                            <select className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 focus:bg-[#1a1a1a] transition-all text-sm font-medium appearance-none cursor-pointer">
                                <option>Feedback</option>
                                <option>Complaint</option>
                                <option>Franchise Query</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div className="space-y-1.5 group">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest group-focus-within:text-yellow-500 transition-colors">Message</label>
                            <textarea 
                                rows={4}
                                className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-700 focus:outline-none focus:border-yellow-500 focus:bg-[#1a1a1a] transition-all text-sm font-medium resize-none"
                                placeholder="How can we help you?"
                            />
                        </div>

                        <button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black text-base py-4 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wide">
                            <span>Submit Request</span>
                            <ArrowRight size={18} strokeWidth={3} />
                        </button>
                    </form>

                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
