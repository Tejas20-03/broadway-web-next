'use client'


import React, { useState, useEffect } from 'react';
import { X, Gift, Sparkles, Copy, Check, PartyPopper, Mail, ArrowRight, Frown, Trophy, Star } from 'lucide-react';

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Prize {
  id: string;
  label: string;
  value: string;
  type: 'win' | 'loss';
  color: string;
}

const PRIZES: Prize[] = [
  { id: '1', label: '10% OFF', value: 'SAVE10', type: 'win', color: '#111111' },
  { id: '2', label: 'NOTHING', value: 'TRYAGAIN', type: 'loss', color: '#B91C1C' },
  { id: '3', label: 'FREE DRINK', value: 'FREECOKE', type: 'win', color: '#111111' },
  { id: '4', label: '20% OFF', value: 'SAVE20', type: 'win', color: '#B91C1C' },
  { id: '5', label: 'FREE CAKE', value: 'LAVAFREE', type: 'win', color: '#111111' },
  { id: '6', label: 'NOTHING', value: 'TRYAGAIN', type: 'loss', color: '#B91C1C' },
  { id: '7', label: 'FREE DELIVERY', value: 'FREESHIP', type: 'win', color: '#111111' },
  { id: '8', label: 'JACKPOT', value: 'BROADWAY', type: 'win', color: '#B91C1C' },
];

export const SpinWheelModal: React.FC<SpinWheelModalProps> = ({ isOpen, onClose }) => {
  const [stage, setStage] = useState<'START' | 'SPINNING' | 'CLAIM' | 'SUCCESS'>('START');
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Prize | null>(null);
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (stage !== 'SUCCESS') {
        setRotation(0);
        setResult(null);
        setStage('START');
        setEmail('');
      }
    }
  }, [isOpen]);

  const spinWheel = () => {
    if (stage !== 'START') return;
    setStage('SPINNING');
    setResult(null);

    const winnerIndex = Math.floor(Math.random() * PRIZES.length);
    const sliceAngle = 360 / PRIZES.length;
    const spins = 10; 
    
    // In our SVG layout, the first slice (index 0) is centered around 0 degrees (pointing right).
    // To have it land at the TOP (270 degrees), we calculate accordingly.
    const sliceCenter = (winnerIndex * sliceAngle) + (sliceAngle / 2);
    const targetRotation = 270 - sliceCenter + (360 * spins);

    setRotation(targetRotation);

    setTimeout(() => {
      setResult(PRIZES[winnerIndex]);
      setStage('CLAIM');
    }, 4500);
  };

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      setStage('SUCCESS');
    }
  };

  const copyCode = () => {
    if (result && result.value !== 'TRYAGAIN') {
      navigator.clipboard.writeText(result.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dark Backdrop */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300" onClick={onClose} />

      {/* Casino Modal Container */}
      <div className="relative w-full max-w-[460px] bg-gradient-to-b from-[#1a1a1a] to-[#050505] border border-white/10 rounded-[3.5rem] shadow-[0_0_120px_rgba(234,179,8,0.25)] overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col items-center">
        
        <style>{`
          @keyframes bulbPulse {
            0%, 100% { opacity: 1; filter: drop-shadow(0 0 10px #eab308); }
            50% { opacity: 0.3; filter: drop-shadow(0 0 2px #eab308); }
          }
          .bulb { animation: bulbPulse 1s infinite; }
          .clip-pointer { clip-path: polygon(0% 0%, 100% 0%, 50% 100%); }
          .casino-font { font-family: 'Inter', sans-serif; font-weight: 900; }
        `}</style>

        {/* Top Gold Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-yellow-500 shadow-[0_0_25px_#eab308] z-50"></div>
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 bg-black/60 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors border border-white/5">
          <X size={20} />
        </button>

        {(stage !== 'SUCCESS') && (
          <div className="flex flex-col items-center w-full py-12 px-6">
            
            {/* Header Titles */}
            <div className={`text-center transition-all duration-700 ${stage === 'CLAIM' ? 'scale-75 -mb-10 opacity-60' : 'mb-12'}`}>
              <div className="inline-flex items-center gap-2 bg-yellow-500/10 px-4 py-1.5 rounded-full border border-yellow-500/20 mb-4">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.25em]">Broadway Royal Casino</span>
              </div>
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                SPIN <span className="text-yellow-500">TO</span> WIN
              </h2>
            </div>

            {/* THE WHEEL ASSEMBLY */}
            <div className={`relative transition-all duration-1000 ease-out ${stage === 'CLAIM' ? 'scale-[0.55] -mt-20 mb-0' : 'scale-100 mb-12'}`}>
              
              {/* Outer Bulbs Ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[390px] h-[390px] border-[18px] border-[#222] rounded-full shadow-[0_0_60px_rgba(0,0,0,0.8)] flex items-center justify-center bg-[#0a0a0a] ring-2 ring-white/5">
                {[...Array(16)].map((_, i) => (
                  <div 
                    key={i}
                    className="bulb absolute w-3.5 h-3.5 bg-yellow-400 rounded-full border border-yellow-100 shadow-[0_0_8px_#eab308]"
                    style={{ transform: `rotate(${i * 22.5}deg) translateY(-178px)` }}
                  />
                ))}
              </div>

              {/* The Pointer (Fixed at Top) */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.8)]">
                <div className="w-16 h-18 bg-white clip-pointer flex items-start justify-center pt-2 border-t-4 border-yellow-500 shadow-2xl">
                  <div className="w-5 h-5 rounded-full bg-red-600 shadow-inner ring-4 ring-red-400/20"></div>
                </div>
              </div>

              {/* SVG Wheel Graphics */}
              <div 
                className="w-[330px] h-[330px] rounded-full border-[12px] border-yellow-600/40 relative overflow-hidden transition-transform cubic-bezier(0.1, 0.8, 0.2, 1) shadow-[0_0_80px_rgba(0,0,0,0.6)]"
                style={{ 
                    transform: `rotate(${rotation}deg)`, 
                    transitionDuration: stage === 'SPINNING' ? '4500ms' : '0s' 
                }}
              >
                <svg viewBox="0 0 500 500" className="w-full h-full">
                  {PRIZES.map((prize, index) => {
                    const angle = 360 / PRIZES.length;
                    const startAngle = index * angle;
                    const endAngle = (index + 1) * angle;
                    
                    // Convert degrees to radians for point calculation
                    const radStart = (startAngle * Math.PI) / 180;
                    const radEnd = (endAngle * Math.PI) / 180;
                    
                    const x1 = 250 + 250 * Math.cos(radStart);
                    const y1 = 250 + 250 * Math.sin(radStart);
                    const x2 = 250 + 250 * Math.cos(radEnd);
                    const y2 = 250 + 250 * Math.sin(radEnd);

                    const d = `M 250 250 L ${x1} ${y1} A 250 250 0 0 1 ${x2} ${y2} Z`;
                    const midAngle = startAngle + angle / 2;

                    return (
                      <g key={prize.id}>
                        {/* Slice Background */}
                        <path d={d} fill={prize.color} stroke="#2a2a2a" strokeWidth="2" />
                        
                        {/* Text Label - Radiating from center */}
                        <g transform={`rotate(${midAngle}, 250, 250)`}>
                          <text
                            x="370"
                            y="250"
                            fill="#FFFFFF"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="casino-font"
                            style={{ 
                                fontSize: '22px', 
                                letterSpacing: '0.05em',
                                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                                transform: 'rotate(0deg)',
                                transformOrigin: '370px 250px'
                            }}
                          >
                            {prize.label}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>

                {/* Metallic Center Hub */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-[#555] to-[#000] rounded-full border-[6px] border-yellow-500 shadow-2xl flex items-center justify-center z-10">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(234,179,8,0.6)]">
                    <span className="text-[11px] text-black font-black uppercase tracking-tighter">GOLD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION AREA (Buttons / Form) */}
            <div className="w-full max-w-sm z-10">
              {stage === 'START' || stage === 'SPINNING' ? (
                <button 
                  onClick={spinWheel}
                  disabled={stage === 'SPINNING'}
                  className="w-full bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-black text-2xl py-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(234,179,8,0.4)] transition-all active:scale-95 disabled:opacity-50 flex flex-col items-center justify-center group"
                >
                  {stage === 'SPINNING' ? (
                    <span className="animate-pulse tracking-widest italic">ROLLING THE DICE...</span>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Sparkles size={28} fill="black" />
                      <span>SPIN TO WIN</span>
                    </div>
                  )}
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] mt-1 opacity-70">1 Spin Per Day</span>
                </button>
              ) : (
                <div className="animate-in slide-in-from-bottom-12 duration-500 bg-[#121212] p-8 rounded-[3rem] border border-white/10 shadow-3xl">
                  {result?.type === 'loss' ? (
                    <div className="text-center py-4">
                      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-inner">
                        <Frown size={44} className="text-red-500" />
                      </div>
                      <h3 className="text-3xl font-black text-white uppercase italic mb-3 tracking-tighter italic">NO LUCK!</h3>
                      <p className="text-neutral-500 text-sm mb-8 font-medium">The house wins this round. Please try your luck again tomorrow!</p>
                      <button onClick={onClose} className="w-full bg-[#1a1a1a] hover:bg-white/10 text-white font-black py-4 rounded-2xl transition-all border border-white/10 uppercase tracking-[0.3em] text-xs">Close Table</button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <PartyPopper className="text-yellow-500" size={32} />
                        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter italic">WINNER!</h3>
                      </div>
                      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl py-5 px-6 mb-8 inline-block shadow-lg ring-1 ring-yellow-500/10">
                        <p className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.4em] mb-2">Jackpot Reward</p>
                        <p className="text-4xl font-black text-white uppercase tracking-tighter italic drop-shadow-lg">{result?.label}</p>
                      </div>
                      <form onSubmit={handleClaim} className="space-y-4">
                        <div className="relative group">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-yellow-500 transition-colors" size={20} />
                          <input 
                            type="email" required placeholder="Email to claim code" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-4 text-white text-base focus:border-yellow-500 outline-none transition-all placeholder:text-neutral-700 font-bold"
                          />
                        </div>
                        <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xl py-5 rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(234,179,8,0.2)] transition-transform active:scale-95 uppercase tracking-wide">
                          CLAIM MY PRIZE <ArrowRight size={22} strokeWidth={3} />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUCCESS SCREEN */}
        {stage === 'SUCCESS' && result && (
          <div className="w-full py-16 px-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-700 relative min-h-[550px] justify-center">
            
            <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
              <div className="absolute top-10 left-10 text-yellow-500 animate-bounce"><Sparkles size={50} /></div>
              <div className="absolute top-1/3 right-12 text-yellow-500 animate-pulse"><Star size={32} fill="currentColor" /></div>
              <div className="absolute bottom-20 left-20 text-yellow-500 animate-bounce delay-300"><Sparkles size={40} /></div>
            </div>

            <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-600 flex items-center justify-center mb-10 shadow-[0_0_80px_rgba(234,179,8,0.7)] ring-4 ring-yellow-500/20 scale-110 animate-in slide-in-from-bottom-10">
              <Trophy size={72} className="text-white drop-shadow-2xl" strokeWidth={1.5} />
            </div>

            <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-4 drop-shadow-2xl">YOU DID IT!</h2>
            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] mb-12">Coupon Generated Successfully</p>

            <button onClick={copyCode} className="w-full bg-black/60 border-2 border-dashed border-yellow-500/40 hover:border-yellow-500/80 rounded-[2.5rem] p-10 mb-12 transition-all group relative active:scale-95 flex flex-col items-center gap-4 shadow-3xl">
              <span className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.5em]">Tap to Copy Promo</span>
              <h3 className="text-5xl font-black text-yellow-500 tracking-[0.25em] font-mono group-hover:scale-105 transition-transform drop-shadow-lg">{result.value}</h3>
              {copied && (
                <div className="absolute inset-0 bg-yellow-500 flex items-center justify-center rounded-[2.5rem] animate-in fade-in duration-300 z-10">
                  <span className="text-black font-black text-2xl flex items-center gap-4"><Check size={36} strokeWidth={4} /> COPIED!</span>
                </div>
              )}
            </button>

            <div className="space-y-4 animate-in fade-in duration-1000 delay-500">
              <p className="text-3xl font-black text-white uppercase italic tracking-widest drop-shadow-lg italic">Enjoy Your Meal! ðŸ•</p>
              <p className="text-neutral-600 text-[10px] font-black uppercase tracking-[0.3em] opacity-80 italic">A summary has been sent to: {email}</p>
            </div>
            
            <button onClick={onClose} className="mt-14 text-neutral-700 hover:text-white text-xs font-black uppercase tracking-[0.4em] underline decoration-neutral-900 hover:decoration-white transition-all">
              Back to Ordering
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

