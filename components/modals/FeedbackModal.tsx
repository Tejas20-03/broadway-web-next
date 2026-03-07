'use client'

import React, { useState } from 'react';
import { X, Frown, Meh, Smile, Laugh, Angry, Send } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [foodRating, setFoodRating] = useState<number>(0);
  const [deliveryRating, setDeliveryRating] = useState<number>(0);
  const [experienceRating, setExperienceRating] = useState<number>(0);
  const [remarks, setRemarks] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle submission logic here
    console.log({ foodRating, deliveryRating, experienceRating, remarks, name, phone, email });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full h-[100dvh] md:h-auto md:max-h-[90vh] md:max-w-2xl bg-[#0a0a0a] border-0 md:border border-white/10 rounded-none md:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Share Your Experience</h2>
            <button 
                onClick={onClose}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors border border-white/5"
            >
                <X size={20} />
            </button>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="flex flex-col items-center mb-6">
                    <img 
                        src="https://www.broadwaypizza.com.pk/assets/broadwayPizzaLogo.png" 
                        alt="Logo" 
                        className="h-12 w-auto object-contain mb-2 opacity-80"
                    />
                    <p className="text-neutral-500 text-sm">We value your feedback to serve you better.</p>
                </div>

                {/* Rating Sections */}
                <RatingSection label="How was the Food?" value={foodRating} onChange={setFoodRating} />
                <RatingSection label="How was the Delivery?" value={deliveryRating} onChange={setDeliveryRating} />
                <RatingSection label="How was the Experience?" value={experienceRating} onChange={setExperienceRating} />

                {/* Remarks */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-white uppercase tracking-wide">Any complaints or suggestions?</label>
                    <textarea 
                        rows={3}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Type your remarks here..."
                        className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500 transition-colors text-sm font-medium resize-none"
                    />
                </div>

                {/* Contact Info */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <p className="text-sm font-bold text-yellow-500 uppercase tracking-wide">Contact Information</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            type="text" 
                            placeholder="Your Name" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm"
                        />
                        <input 
                            type="tel" 
                            placeholder="Contact Number" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            maxLength={12}
                            className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm"
                        />
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm md:col-span-2"
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wide"
                >
                    Submit Feedback
                    <Send size={18} strokeWidth={3} />
                </button>

            </form>
        </div>
      </div>
    </div>
  );
};

// Helper for Rating
const RatingSection = ({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) => {
    
    const emojis = [
        { icon: Angry, label: 'Very Dissatisfied', color: 'text-red-500' },
        { icon: Frown, label: 'Dissatisfied', color: 'text-orange-500' },
        { icon: Meh, label: 'Neutral', color: 'text-yellow-500' },
        { icon: Smile, label: 'Satisfied', color: 'text-lime-500' },
        { icon: Laugh, label: 'Very Satisfied', color: 'text-green-500' },
    ];

    return (
        <div className="space-y-3">
            <p className="text-sm font-bold text-white uppercase tracking-wide">{label}</p>
            <div className="flex justify-between md:justify-start md:gap-8 bg-[#161616] p-4 rounded-xl border border-white/5">
                {emojis.map((item, index) => {
                    const ratingValue = index + 1;
                    const isActive = value === ratingValue;
                    const Icon = item.icon;
                    
                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={() => onChange(ratingValue)}
                            className={`flex flex-col items-center gap-1 transition-all duration-200 group ${isActive ? 'scale-110' : 'opacity-40 hover:opacity-70 hover:scale-105'}`}
                        >
                            <Icon 
                                size={32} 
                                className={`${isActive ? item.color : 'text-neutral-400'} transition-colors duration-300`} 
                                strokeWidth={isActive ? 2.5 : 2}
                                fill={isActive ? 'currentColor' : 'none'}
                                fillOpacity={0.2}
                            />
                        </button>
                    )
                })}
            </div>
            <div className="text-center md:text-left h-4">
                 {value > 0 && <span className={`text-xs font-bold uppercase tracking-widest ${emojis[value-1].color}`}>{emojis[value-1].label}</span>}
            </div>
        </div>
    )
}
