'use client'

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, ShoppingBag, User, Wallet, LogOut,
  Check, Loader2, AlertCircle, ChevronRight,
  RotateCcw, Star, Trash2, Edit3
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import {
  useGetMyOrdersQuery,
  useGetCustomerInfoQuery,
  useUpdateCustomerInfoMutation,
  useDeleteAccountMutation,
} from '@/store/apiSlice';

interface AccountPageProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'orders' | 'account';

export const AccountPage: React.FC<AccountPageProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useUser();

  const [tab, setTab] = useState<Tab>('orders');
  const [saveResult, setSaveResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const { data: orders = [], isLoading: loadingOrders } = useGetMyOrdersQuery(
    user?.phone ?? '', { skip: !isOpen || !user?.phone },
  );
  const { data: rawInfo, isLoading: loadingAccount } = useGetCustomerInfoQuery(
    user?.phone ?? '', { skip: !isOpen || !user?.phone },
  );
  const [updateInfo, { isLoading: saving }] = useUpdateCustomerInfoMutation();
  const [deleteAcc] = useDeleteAccountMutation();

  const customerInfo = rawInfo ?? (user ? {
    name: user.name, email: user.email, phone: user.phone,
    walletBalance: 0, totalOrders: 0, memberSince: '',
  } : null);

  useEffect(() => {
    if (customerInfo) {
      setEditName(customerInfo.name);
      setEditEmail(customerInfo.email);
    }
  }, [customerInfo?.name, customerInfo?.email]);

  const handleSave = async () => {
    if (!user) return;
    setSaveResult(null);
    try {
      const ok = await updateInfo({ name: editName, email: editEmail, phone: user.phone }).unwrap();
      setSaveResult({ ok, msg: ok ? 'Information updated!' : 'Update failed. Please try again.' });
    } catch {
      setSaveResult({ ok: false, msg: 'Update failed. Please try again.' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmed = window.confirm('Are you sure? Type DELETE to confirm.');
    if (!confirmed) return;
    await deleteAcc(user.phone).unwrap().catch(() => {});
    logout();
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isOpen) return null;

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const statusColor = (status: string) => {
    if (status === 'Confirmed') return 'text-green-400 bg-green-500/10';
    if (status === 'Rejected') return 'text-red-400 bg-red-500/10';
    return 'text-yellow-400 bg-yellow-500/10';
  };

  return (
    <div className="fixed inset-0 z-[400] bg-[#0a0a0a] overflow-y-auto animate-in slide-in-from-bottom duration-300">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-black text-white uppercase tracking-tight italic">My Account</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Profile Header Card */}
        <div className="bg-[#121212] rounded-3xl p-6 border border-white/5 mb-8 flex items-center gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/5 rounded-full blur-[60px] pointer-events-none"></div>
          <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-yellow-500/20 ring-4 ring-[#121212] shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{user?.name}</h2>
            <p className="text-neutral-500 text-sm font-medium">{user?.phone}</p>
            <p className="text-neutral-600 text-xs mt-0.5">{user?.email}</p>
            {customerInfo && (
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">
                  {customerInfo.totalOrders} Orders
                </span>
                {customerInfo.memberSince && (
                  <>
                    <span className="text-neutral-700">·</span>
                    <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">
                      Member since {new Date(customerInfo.memberSince).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' })}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="ml-auto text-right">
            <div className="text-2xl font-black text-yellow-500">Rs. {(customerInfo?.walletBalance ?? 0).toLocaleString()}</div>
            <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest flex items-center justify-end gap-1 mt-0.5">
              <Wallet size={10} /> Wallet Balance
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-2 mb-8 bg-[#121212] rounded-2xl p-1 border border-white/5">
          <button onClick={() => setTab('orders')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${tab === 'orders' ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'text-neutral-500 hover:text-white'}`}
          >
            <ShoppingBag size={16} /> My Orders
          </button>
          <button onClick={() => setTab('account')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${tab === 'account' ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'text-neutral-500 hover:text-white'}`}
          >
            <User size={16} /> My Account
          </button>
        </div>

        {/* MY ORDERS TAB */}
        {tab === 'orders' && (
          <div>
            {loadingOrders ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-yellow-500" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag size={48} className="text-neutral-700 mx-auto mb-4" />
                <p className="text-neutral-500 font-medium">No orders yet</p>
                <p className="text-neutral-600 text-sm mt-1">Your order history will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-[#121212] rounded-2xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Order #{order.id}</div>
                          <div className="text-sm font-bold text-white leading-tight mt-0.5">{order.outletName || 'Broadway Pizza'}</div>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${statusColor(order.status)}`}>
                          {order.status === 'Rejected' ? 'Cancelled' : order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <div className="text-neutral-500 text-xs uppercase tracking-wider">Total</div>
                          <div className="font-black text-yellow-500">Rs. {order.amount.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-neutral-500 text-xs uppercase tracking-wider">Date</div>
                          <div className="text-neutral-300 text-xs font-medium">{new Date(order.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-white/5 flex">
                      {order.feedbackUrl && (
                        <a href={order.feedbackUrl} target="_blank" rel="noopener noreferrer"
                          className="flex-1 text-center py-3 text-xs font-bold text-neutral-500 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5"
                        >
                          <Star size={12} /> Feedback
                        </a>
                      )}
                      <button className="flex-1 py-3 text-xs font-bold text-yellow-500 hover:bg-yellow-500/10 transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <RotateCcw size={12} /> Order Again
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MY ACCOUNT TAB */}
        {tab === 'account' && (
          <div className="space-y-6">
            {loadingAccount ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-yellow-500" />
              </div>
            ) : (
              <>
                {/* Wallet Card */}
                <div className="bg-[#121212] rounded-3xl border border-white/5 p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Broadway Wallet</div>
                      <div className="text-3xl font-black text-yellow-500">Rs. {(customerInfo?.walletBalance ?? 0).toLocaleString()}</div>
                      <p className="text-neutral-600 text-xs mt-1">Available balance for your next order</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                      <Wallet size={28} className="text-yellow-500" />
                    </div>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="bg-[#121212] rounded-3xl border border-white/5 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                      <Edit3 size={14} className="text-black" />
                    </div>
                    <h3 className="text-white font-bold text-lg uppercase tracking-wide">Personal Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest ml-1 mb-2 block">Full Name</label>
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-4 px-4 text-white focus:border-yellow-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
                      <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-4 px-4 text-white focus:border-yellow-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest ml-1 mb-2 block">Phone Number</label>
                      <input type="tel" value={customerInfo?.phone ?? user?.phone ?? ''} disabled
                        className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl py-4 px-4 text-neutral-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {saveResult && (
                    <div className={`flex items-center gap-2 mt-4 rounded-xl px-4 py-3 text-sm font-medium ${saveResult.ok ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                      {saveResult.ok ? <Check size={16} /> : <AlertCircle size={16} />}
                      {saveResult.msg}
                    </div>
                  )}

                  <button onClick={handleSave} disabled={saving}
                    className="w-full mt-6 bg-yellow-500 hover:bg-yellow-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-black py-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Update Information</>}
                  </button>
                </div>

                {/* Danger Zone */}
                <div className="bg-[#121212] rounded-3xl border border-red-500/10 p-6">
                  <h3 className="text-red-400 font-bold text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Trash2 size={16} /> Danger Zone
                  </h3>
                  <p className="text-neutral-500 text-sm mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
                  <button onClick={handleDeleteAccount}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
                  >
                    Delete My Account
                  </button>
                </div>
              </>
            )}
          </div>
        )}

      </main>
    </div>
  );
};
