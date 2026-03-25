'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { X, MessageCircle, Search, ExternalLink, Loader2 } from 'lucide-react';
import { useGetAllOutletsQuery } from '@/store/apiSlice';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
    const [selectedOutletId, setSelectedOutletId] = useState('');
    const [search, setSearch] = useState('');
    const { data: outlets = [], isLoading, isFetching, refetch } = useGetAllOutletsQuery(undefined, {
        skip: !isOpen,
        refetchOnMountOrArgChange: true,
    });

    useEffect(() => {
        if (isOpen) {
            refetch();
        }
    }, [isOpen, refetch]);

    const filteredOutlets = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return outlets;
        return outlets.filter((o) => o.name.toLowerCase().includes(q));
    }, [outlets, search]);

    const handleStartFeedback = () => {
        if (!selectedOutletId) return;
        window.open(
            `https://feedback.broadwaypizza.com.pk/feedbackorder.html?OutletID=${encodeURIComponent(selectedOutletId)}`,
            '_blank',
        );
    };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-white/70 dark:bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
    <div className="relative w-full h-[100dvh] md:h-auto md:max-h-[90vh] md:max-w-2xl bg-white dark:bg-[#0a0a0a] border-0 md:border border-neutral-200 dark:border-white/10 rounded-none md:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-white/5 flex items-center justify-between shrink-0">
            <h2 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Feedback</h2>
            <button 
                onClick={onClose}
                className="p-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full text-neutral-900 dark:text-white transition-colors border border-neutral-200 dark:border-white/5"
            >
                <X size={20} />
            </button>
        </div>

        {/* Scrollable Form Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                        <div className="space-y-6">
                                <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#161616] p-4 text-neutral-700 dark:text-neutral-300 text-sm">
                                    Select outlet to start feedback.
                                </div>

                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors" size={16} />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search outlet"
                                        className="w-full bg-white dark:bg-[#161616] border border-neutral-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500 transition-colors text-sm"
                                    />
                                </div>

                                <div className="max-h-[45vh] overflow-y-auto custom-scrollbar rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111]">
                                    {isLoading || isFetching ? (
                                        <div className="py-10 flex items-center justify-center text-neutral-500 text-sm">
                                            <Loader2 size={18} className="animate-spin mr-2" /> Loading outlets...
                                        </div>
                                    ) : filteredOutlets.length === 0 ? (
                                        <div className="py-10 text-center text-neutral-500 text-sm">No outlets found</div>
                                    ) : (
                                        filteredOutlets.map((outlet) => (
                                            <button
                                                key={outlet.id}
                                                type="button"
                                                onClick={() => setSelectedOutletId(outlet.id)}
                                                className={`w-full text-left px-4 py-3 border-b border-neutral-200 dark:border-white/5 last:border-b-0 transition-colors ${
                                                    selectedOutletId === outlet.id
                                                        ? 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300'
                                                        : 'text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/5'
                                                }`}
                                            >
                                                {outlet.name}
                                            </button>
                                        ))
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleStartFeedback}
                                    disabled={!selectedOutletId}
                                    className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-base py-4 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                                >
                                    Start Feedback
                                    <ExternalLink size={18} strokeWidth={3} />
                                </button>

                                <p className="text-xs text-neutral-500 flex items-center gap-2">
                                    <MessageCircle size={14} className="text-yellow-500" />
                                    Feedback opens in the official Broadway feedback page.
                                </p>
                        </div>
        </div>
      </div>
    </div>
  );
};



