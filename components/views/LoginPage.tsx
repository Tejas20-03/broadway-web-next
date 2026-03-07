'use client'

import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, ShieldCheck, Lock, Smartphone, ChevronLeft, Loader2, Edit2, User, AlertCircle } from 'lucide-react';
import { useCheckNumberMutation, useVerifyCodeMutation } from '@/store/apiSlice';
import { useUser } from '@/context/UserContext';

interface LoginPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ isOpen, onClose }) => {
  const { login } = useUser();
  const [checkNumberMutation] = useCheckNumberMutation();
  const [verifyCodeMutation] = useVerifyCodeMutation();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [timer, setTimer] = useState(59);
  const [isNewCustomer, setIsNewCustomer] = useState(true);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setFullName('');
      setPhoneNumber('');
      setEmail('');
      setOtp(['', '', '', '', '', '']);
      setIsLoading(false);
      setErrorMsg('');
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10 || !fullName.trim() || !email.trim()) return;
    setIsLoading(true);
    setErrorMsg('');
    const fullPhone = '0' + phoneNumber;
    try {
      const result = await checkNumberMutation(fullPhone).unwrap();
      setIsLoading(false);
      if (result.success) {
        setIsNewCustomer(result.isNewCustomer ?? true);
        setStep('otp');
        setTimer(59);
      } else {
        setErrorMsg(result.message ?? 'Could not send OTP.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('Something went wrong.');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.filter(d => d).join('');
    if (code.length < 4) return;
    setIsLoading(true);
    setErrorMsg('');
    const fullPhone = '0' + phoneNumber;
    try {
      const result = await verifyCodeMutation({ name: fullName, phone: fullPhone, email, code }).unwrap();
      setIsLoading(false);
      if (result.success) {
        login({ name: fullName, phone: fullPhone, email, walletCode: result.walletCode ?? '' });
        onClose();
      } else {
        setErrorMsg(result.message ?? 'Invalid code.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('Verification failed.');
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    const fullPhone = '0' + phoneNumber;
    await checkNumberMutation(fullPhone).unwrap().catch(() => {});
    setIsLoading(false);
    setTimer(59);
    setOtp(['', '', '', '', '', '']);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 flex flex-col group/card min-h-[550px]">
        
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white backdrop-blur-sm border border-white/5 transition-all z-20"
        >
            <X size={20} />
        </button>

        {/* STEP 1: DETAILS */}
        {step === 'phone' && (
            <div className="flex-1 flex flex-col p-8 animate-in slide-in-from-left duration-300">
                
                {/* Brand Header */}
                <div className="flex flex-col items-center justify-center mt-4 mb-6">
                    <img 
                        src="https://www.broadwaypizza.com.pk/assets/broadwayPizzaLogo.png" 
                        alt="Logo" 
                        className="h-16 w-auto object-contain mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                    />
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight text-center">
                        Unlock Flavor
                    </h2>
                    <p className="text-neutral-500 text-xs font-medium text-center mt-2 max-w-[280px]">
                        Join the family to earn points and get exclusive deals.
                    </p>
                </div>

                <form onSubmit={handlePhoneSubmit} className="space-y-4 flex-1 flex flex-col justify-center">

                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest ml-4">Full Name</label>
                        <div className="relative">
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe"
                                className="w-full bg-[#0e0e0e] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-yellow-500 focus:outline-none transition-all placeholder:text-neutral-700 font-bold"
                            />
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest ml-4">Email</label>
                        <div className="relative">
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                                className="w-full bg-[#0e0e0e] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-yellow-500 focus:outline-none transition-all placeholder:text-neutral-700 font-bold"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 text-base">@</span>
                        </div>
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest ml-4">Mobile Number</label>
                        <div className="relative">
                            <div className="absolute left-0 top-0 bottom-0 w-14 bg-[#161616] border-r border-white/10 rounded-l-2xl flex items-center justify-center">
                                <span className="text-neutral-400 font-bold text-sm">+92</span>
                            </div>
                            <input type="tel" value={phoneNumber}
                                onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 10) setPhoneNumber(v); }}
                                placeholder="3001234567"
                                className="w-full bg-[#0e0e0e] border border-white/10 rounded-2xl py-4 pl-18 pr-12 text-white focus:border-yellow-500 focus:outline-none transition-all placeholder:text-neutral-700 font-bold tracking-widest"
                                style={{ paddingLeft: '3.75rem' }}
                            />
                            <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                        </div>
                    </div>

                    {/* Error Message */}
                    {errorMsg && (
                        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                            <AlertCircle size={16} className="shrink-0" />
                            <span className="text-xs font-medium">{errorMsg}</span>
                        </div>
                    )}

                    <button type="submit" disabled={phoneNumber.length < 10 || !fullName || !email || isLoading}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-black py-4 rounded-2xl font-black text-lg uppercase tracking-wide transition-all transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 mt-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <><span>Get Verification Code</span><ArrowRight size={20} strokeWidth={3} /></>}
                    </button>

                    <div className="pt-4 border-t border-dashed border-white/5 flex items-center justify-center gap-2 text-neutral-500">
                        <ShieldCheck size={14} className="text-green-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">100% Secure Login &bull; No Spam</span>
                    </div>
                </form>
            </div>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 'otp' && (
            <div className="flex-1 flex flex-col p-8 animate-in slide-in-from-right duration-300">
                
                {/* Navigation */}
                <button 
                    onClick={() => setStep('phone')}
                    className="self-start flex items-center gap-1 text-neutral-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider mb-6"
                >
                    <ChevronLeft size={16} />
                    Back
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#161616] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                        <Lock className="text-yellow-500" size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                        {isNewCustomer ? 'Verify Number' : 'Welcome Back!'}
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-neutral-400 text-sm">
                        <span>Code sent to <span className="text-white font-bold tracking-wider">+92{phoneNumber}</span></span>
                        <button type="button" onClick={() => setStep('phone')} className="p-1 hover:bg-white/10 rounded text-yellow-500">
                            <Edit2 size={12} />
                        </button>
                    </div>
                </div>

                {/* OTP Inputs */}
                <div className="flex justify-center gap-2 mb-8">
                    {otp.map((digit, idx) => (
                        <input key={idx}
                            ref={(el) => { otpRefs.current[idx] = el; }}
                            type="text" inputMode="numeric" maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className={`w-11 h-14 rounded-xl bg-[#0e0e0e] border-2 text-center text-2xl font-black text-white focus:outline-none transition-all ${
                                digit ? 'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'border-white/10 focus:border-yellow-500/50'
                            }`}
                        />
                    ))}
                </div>

                {/* Error */}
                {errorMsg && (
                    <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                        <AlertCircle size={16} className="shrink-0" />
                        <span className="text-xs font-medium">{errorMsg}</span>
                    </div>
                )}

                {/* Resend Timer */}
                <div className="text-center mb-6">
                    {timer > 0 ? (
                        <p className="text-xs text-neutral-500 font-medium">
                            Resend in <span className="text-yellow-500 font-bold">00:{timer < 10 ? `0${timer}` : timer}</span>
                        </p>
                    ) : (
                        <button type="button" onClick={handleResend} disabled={isLoading}
                            className="text-xs font-bold text-yellow-500 hover:text-white uppercase tracking-widest transition-all"
                        >
                            Resend Code
                        </button>
                    )}
                </div>

                <button type="button" onClick={handleVerify}
                    disabled={otp.filter(d => d).join('').length < 4 || isLoading}
                    className="w-full bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-black py-4 rounded-2xl font-black text-lg uppercase tracking-wide transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 mt-auto"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <><span>Verify &amp; Login</span><ShieldCheck size={20} /></>}
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

