'use client'

import React, { useState } from 'react';
import { X, Store, ArrowRight, Building2, Briefcase } from 'lucide-react';
import { useSubmitFranchiseRequestMutation } from '@/store/apiSlice';

interface FranchiseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FranchiseModal: React.FC<FranchiseModalProps> = ({ isOpen, onClose }) => {
    const [submitFranchiseRequest, { isLoading }] = useSubmitFranchiseRequestMutation();

    const [firstName, setFirstName] = useState('');
    const [contact, setContact] = useState('');
    const [email, setEmail] = useState('');
    const [occupation, setOccupation] = useState('');
    const [city, setCity] = useState('');
    const [ownOtherFranchises, setOwnOtherFranchises] = useState('');
    const [ownProperty, setOwnProperty] = useState('');
    const [hearAbout, setHearAbout] = useState('');
    const [totalLiquidAssets, setTotalLiquidAssets] = useState('PKR20 million');
    const [regions, setRegions] = useState('');
    const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

    const resetForm = () => {
        setFirstName('');
        setContact('');
        setEmail('');
        setOccupation('');
        setCity('');
        setOwnOtherFranchises('');
        setOwnProperty('');
        setHearAbout('');
        setTotalLiquidAssets('PKR20 million');
        setRegions('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);

        if (!firstName.trim() || !occupation.trim() || !city.trim() || !ownOtherFranchises.trim() || !regions.trim()) {
            setStatus({ ok: false, text: 'Please type all the required fields.' });
            return;
        }

        const res = await submitFranchiseRequest({
            firstName: firstName.trim(),
            contact: contact.trim(),
            Email: email.trim(),
            occupation: occupation.trim(),
            city: city.trim(),
            own_other_franchises: ownOtherFranchises.trim(),
            own_property: ownProperty,
            hearAbout,
            totalLiquidAssets,
            regions: regions.trim(),
        }).unwrap();

        if (res.success) {
            resetForm();
            setStatus({ ok: true, text: res.message ?? 'Your information has been sent to our team, You will get a callback from us to assist you accordingly.' });
            return;
        }

        setStatus({ ok: false, text: res.message ?? 'Could not submit your franchise request. Please try again.' });
    };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full h-[100dvh] md:h-[700px] max-w-5xl bg-[#0a0a0a] border-0 md:border border-white/10 rounded-none md:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
        
        {/* Mobile Sticky Close Button */}
        <div className="md:hidden sticky top-4 right-4 z-[110] flex justify-end px-4 mb-[-40px] pointer-events-none">
            <button 
                onClick={onClose}
                className="pointer-events-auto p-2 bg-black/60 backdrop-blur-md hover:bg-black/80 rounded-full text-white transition-colors border border-white/10 shadow-lg"
            >
                <X size={20} />
            </button>
        </div>
        
        {/* Left Panel: Info */}
        <div className="w-full md:w-[35%] bg-[#121212] border-b md:border-b-0 md:border-r border-white/5 flex flex-col relative shrink-0 h-auto md:h-full md:overflow-y-auto">
             {/* Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-[80px] pointer-events-none"></div>
            
             <div className="p-8 flex-1 flex flex-col">
                <div className="mb-8 pt-6 md:pt-0">
                    <div className="w-14 h-14 rounded-2xl bg-yellow-500 flex items-center justify-center text-black mb-6 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                        <Store size={28} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none mb-3">
                        Partner<br/>With Us
                    </h2>
                    <p className="text-neutral-500 text-sm font-medium leading-relaxed">
                        Join the fastest growing pizza chain in the country. Let's build a profitable future together.
                    </p>
                </div>

                <div className="space-y-6 mt-4">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-yellow-500 shrink-0 border border-white/5">
                            <Building2 size={16} />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm">Proven Business Model</h4>
                            <p className="text-neutral-500 text-xs mt-1">High ROI with established operational systems.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-yellow-500 shrink-0 border border-white/5">
                            <Briefcase size={16} />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm">Comprehensive Support</h4>
                            <p className="text-neutral-500 text-xs mt-1">From site selection to grand opening and marketing.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-8 border-t border-white/5">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Direct Contact</p>
                    <p className="text-white font-bold text-sm">franchise@broadwaypizza.com.pk</p>
                </div>
            </div>
        </div>

        {/* Right Panel: Form */}
        <div className="w-full md:flex-1 bg-[#0a0a0a] flex flex-col relative h-auto md:h-full md:overflow-y-auto">
             
             {/* Desktop Close Button */}
             <button 
                onClick={onClose}
                className="hidden md:block absolute top-6 right-6 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5"
            >
                <X size={20} />
            </button>

            <div className="flex-1 p-8">
                 <div className="max-w-2xl mx-auto">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2">Franchise Application</h3>
                    <p className="text-neutral-500 text-sm mb-8">Please fill out the form below to express your interest.</p>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Personal Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Your Name *</label>
                                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm placeholder:text-neutral-700" placeholder="Full Name" required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Phone Number *</label>
                                <input type="tel" value={contact} onChange={(e) => setContact(e.target.value)} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm placeholder:text-neutral-700" placeholder="0300..." />
                            </div>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Email Address *</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm placeholder:text-neutral-700" placeholder="email@example.com" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Current Occupation *</label>
                                <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm placeholder:text-neutral-700" placeholder="Business / Job Title" required />
                            </div>
                        </div>

                        {/* Location & Experience */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Target City *</label>
                                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm placeholder:text-neutral-700" placeholder="Which city?" required />
                            </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Other Franchises? *</label>
                                <input type="text" value={ownOtherFranchises} onChange={(e) => setOwnOtherFranchises(e.target.value)} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm placeholder:text-neutral-700" placeholder="Yes/No (Specify name)" required />
                            </div>
                        </div>

                        {/* Property */}
                        <div className="space-y-3">
                             <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Do you own the property? *</label>
                             <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="w-5 h-5 rounded-full border border-white/20 group-hover:border-yellow-500 flex items-center justify-center">
                                        <input type="radio" name="property" checked={ownProperty === 'Yes'} onChange={() => setOwnProperty('Yes')} className="appearance-none w-2.5 h-2.5 bg-yellow-500 rounded-full opacity-0 checked:opacity-100" />
                                    </div>
                                    <span className="text-sm text-white">Yes</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="w-5 h-5 rounded-full border border-white/20 group-hover:border-yellow-500 flex items-center justify-center">
                                        <input type="radio" name="property" checked={ownProperty === 'No'} onChange={() => setOwnProperty('No')} className="appearance-none w-2.5 h-2.5 bg-yellow-500 rounded-full opacity-0 checked:opacity-100" />
                                    </div>
                                    <span className="text-sm text-white">No</span>
                                </label>
                             </div>
                        </div>

                        {/* Investment & Source */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Investment Capital *</label>
                                                                <select value={totalLiquidAssets} onChange={(e) => setTotalLiquidAssets(e.target.value)} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm appearance-none cursor-pointer">
                                                                        <option value="PKR20 million">PKR20 million</option>
                                                                        <option value="PKR25 million">PKR25 million</option>
                                                                        <option value="PKR30 million">PKR30 million</option>
                                                                        <option value="PKR35 million">PKR35 million</option>
                                                                        <option value="PKR40 million">PKR40 million</option>
                                                                        <option value="PKR45 million">PKR45 million</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Heard About Us Via *</label>
                                                                <select value={hearAbout} onChange={(e) => setHearAbout(e.target.value)} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm appearance-none cursor-pointer">
                                                                        <option value="">Select</option>
                                                                        <option value="Email">Facebook</option>
                                                                        <option value="expo">Instagram</option>
                                                                        <option value="existing-franchise">Relative</option>
                                                                        <option value="franchise-broker">Restaurant</option>
                                                                        <option value="phone">Website</option>
                                                                        <option value="trade-show">Google</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                             <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Office Address *</label>
                                                         <textarea rows={3} value={regions} onChange={(e) => setRegions(e.target.value)} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm resize-none placeholder:text-neutral-700" placeholder="Your office address" required />
                        </div>

                                                {status && (
                                                    <div
                                                        className={`rounded-xl px-4 py-3 text-sm font-medium ${
                                                            status.ok
                                                                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                                                : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                                        }`}
                                                    >
                                                        {status.text}
                                                    </div>
                                                )}

                                                <button type="submit" disabled={isLoading} className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-base py-4 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wide">
                            <span>Submit Application</span>
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
