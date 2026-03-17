'use client'

import React, { useState } from 'react';
import { X, Utensils, ArrowRight } from 'lucide-react';
import { useSubmitCateringEventMutation } from '@/store/apiSlice';

interface CateringModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CateringModal: React.FC<CateringModalProps> = ({ isOpen, onClose }) => {
  const [submitCateringEvent, { isLoading }] = useSubmitCateringEventMutation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [noofPerson, setNoofPerson] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [instructions, setInstructions] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setNoofPerson('');
    setDateTime('');
    setLocation('');
    setInstructions('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!name.trim() || !phone.trim() || !email.trim() || !noofPerson.trim() || !dateTime.trim() || !location.trim()) {
      setStatus({ ok: false, text: 'Please type all the required fields.' });
      return;
    }

    const res = await submitCateringEvent({
      Name: name.trim(),
      Phone: phone.trim(),
      Email: email.trim(),
      NoofPerson: noofPerson.trim(),
      date_time: dateTime,
      Location: location.trim(),
      Instructions: instructions.trim(),
    }).unwrap();

    if (res.success) {
      resetForm();
      setStatus({
        ok: true,
        text: res.message ?? 'Your information has been sent to our team, You will get a callback from us to assist you accordingly.',
      });
      return;
    }

    setStatus({ ok: false, text: res.message ?? 'Could not submit your catering request. Please try again.' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />

      <div className="relative w-full h-[100dvh] md:h-[680px] max-w-4xl bg-[#0a0a0a] border-0 md:border border-white/10 rounded-none md:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
        <div className="md:hidden sticky top-4 right-4 z-[110] flex justify-end px-4 mb-[-40px] pointer-events-none">
          <button onClick={onClose} className="pointer-events-auto p-2 bg-black/60 backdrop-blur-md hover:bg-black/80 rounded-full text-white transition-colors border border-white/10 shadow-lg">
            <X size={20} />
          </button>
        </div>

        <div className="w-full md:w-[36%] bg-[#121212] border-b md:border-b-0 md:border-r border-white/5 flex flex-col p-8">
          <div className="pt-6 md:pt-0">
            <div className="w-14 h-14 rounded-2xl bg-yellow-500 flex items-center justify-center text-black mb-6 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
              <Utensils size={28} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none mb-3">Catering<br/>Services</h2>
            <p className="text-neutral-500 text-sm font-medium leading-relaxed">
              Broadway Pizza on Wheels for family gatherings and large events.
            </p>
          </div>

          <div className="mt-auto pt-8 border-t border-white/5">
            <a href="downloads/CateringMenu.pdf" target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-bold py-3 transition-colors border border-white/10">
              Download Catering Menu
            </a>
          </div>
        </div>

        <div className="w-full md:flex-1 bg-[#0a0a0a] flex flex-col relative h-auto md:h-full md:overflow-y-auto">
          <button onClick={onClose} className="hidden md:block absolute top-6 right-6 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5">
            <X size={20} />
          </button>

          <div className="flex-1 p-8">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2">Tell us about your event</h3>
              <p className="text-neutral-500 text-sm mb-8">We will contact you with a tailored catering plan.</p>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Full Name *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm placeholder:text-neutral-700" placeholder="Type your name here" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Your Phone *</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm placeholder:text-neutral-700" placeholder="Type your number here" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Email Address *</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm placeholder:text-neutral-700" placeholder="Type your email address here" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Number of Persons *</label>
                    <input type="number" value={noofPerson} onChange={(e) => setNoofPerson(e.target.value)} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm placeholder:text-neutral-700" placeholder="Enter here" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Date and Time of Event *</label>
                    <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm [color-scheme:dark]" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Event Location *</label>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm placeholder:text-neutral-700" placeholder="Type your location here" required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Special Instructions</label>
                  <textarea rows={3} value={instructions} onChange={(e) => setInstructions(e.target.value)} className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors text-sm resize-none placeholder:text-neutral-700" placeholder="Type your message here" />
                </div>

                {status && (
                  <div className={`rounded-xl px-4 py-3 text-sm font-medium ${status.ok ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                    {status.text}
                  </div>
                )}

                <button type="submit" disabled={isLoading} className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-base py-4 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wide">
                  <span>{isLoading ? 'Submitting...' : 'Submit your query'}</span>
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
