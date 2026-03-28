'use client'

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User as UserIcon,
  ShoppingBag,
  Package,
  MapPin,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Phone,
  Mail,
  Plus,
  Star,
  RotateCcw,
  MessageSquare,
  Settings,
  Shield,
  Bell,
  HelpCircle,
  CreditCard,
  Award,
  Heart,
  Wallet,
  Check,
  Loader2,
  AlertCircle,
  Trash2,
  Edit3,
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import {
  useGetMyOrdersQuery,
  useGetCustomerInfoQuery,
  useUpdateCustomerInfoMutation,
  useDeleteAccountMutation,
} from '@/store/apiSlice';
import { fetchReOrderDetails } from '@/services/api';
import { useAppDispatch } from '@/store';
import { cartActions } from '@/store/slices/cartSlice';

interface AccountPageProps {
  isOpen: boolean;
  onClose: () => void;
  onViewOrder?: (orderId: string, encOrderId: string) => void;
}

type AddressCard = {
  id: string;
  label: string;
  address: string;
  city: string;
  isDefault?: boolean;
};

type DisplayOrderItem = {
  cartId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  sizeLabel: string;
};

export const AccountPage: React.FC<AccountPageProps> = ({ isOpen, onClose, onViewOrder }) => {
  const { user, logout } = useUser();

  const dispatch = useAppDispatch();
  const [saveResult, setSaveResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [orderAgainLoading, setOrderAgainLoading] = useState<string | null>(null);
  const [orderItemsByEncId, setOrderItemsByEncId] = useState<Record<string, DisplayOrderItem[]>>({});

  const handleOrderAgain = async (e: React.MouseEvent, encId: string) => {
    e.stopPropagation();
    setOrderAgainLoading(encId);
    const details = await fetchReOrderDetails(encId);
    setOrderAgainLoading(null);
    if (!details?.products.length) return;
    details.products.forEach((item: any) => {
      const qty = parseInt(item.Quantity) || 1;
      const unitPrice = parseFloat(item.TotalProductPrice) / qty;
      dispatch(cartActions.addToCart({
        productId: String(item.ItemID),
        name: item.ProductName,
        image: item.ItemImage ?? '',
        price: unitPrice,
        quantity: qty,
      }));
    });
    setToastMsg(`${details.products.length} item(s) added to your cart!`);
    setTimeout(() => {
      setToastMsg('');
      onClose();
    }, 1500);
  };

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

  useEffect(() => {
    if (!isOpen || orders.length === 0) return;

    let active = true;

    const loadOrderItems = async () => {
      const selectedOrders = orders.slice(0, 8);
      const results = await Promise.all(
        selectedOrders.map(async (order) => {
          try {
            const details = await fetchReOrderDetails(order.encId);
            const items: DisplayOrderItem[] = (details?.products || []).map((p: any, idx: number) => {
              const qty = parseInt(String(p.Quantity ?? '1'), 10) || 1;
              const total = parseFloat(String(p.TotalProductPrice ?? '0')) || 0;
              const unit = qty > 0 ? total / qty : total;
              return {
                cartId: `${order.encId}-${idx}`,
                name: String(p.ProductName ?? 'Item'),
                image: String(p.ItemImage ?? ''),
                quantity: qty,
                price: unit,
                sizeLabel: String(p.SizeName ?? p.Size ?? 'Standard'),
              };
            });
            return [order.encId, items] as const;
          } catch {
            return [order.encId, []] as const;
          }
        }),
      );

      if (!active) return;
      setOrderItemsByEncId(Object.fromEntries(results));
    };

    loadOrderItems();
    return () => { active = false; };
  }, [isOpen, orders]);

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

  const totalOrders = customerInfo?.totalOrders ?? orders.length;
  const memberSinceLabel = customerInfo?.memberSince
    ? new Date(customerInfo.memberSince).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' })
    : 'N/A';

  const addresses: AddressCard[] = [
    {
      id: 'default',
      label: 'Primary',
      address: 'Address not available in this account record',
      city: 'Update during checkout',
      isDefault: true,
    },
    {
      id: 'pickup',
      label: 'Recent Outlet',
      address: orders[0]?.outletName || 'No recent outlet',
      city: 'Pakistan',
      isDefault: false,
    },
  ];

  const statusColor = (status: string) => {
    if (status === 'Confirmed') return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (status === 'Rejected') return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (status === 'Pending') return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
  };

  const statusIcon = (status: string) => {
    if (status === 'Confirmed') return <CheckCircle2 className="w-3.5 h-3.5" />;
    if (status === 'Rejected') return <XCircle className="w-3.5 h-3.5" />;
    if (status === 'Pending') return <Clock className="w-3.5 h-3.5" />;
    return <Truck className="w-3.5 h-3.5" />;
  };

  return (
    <div className="fixed inset-0 z-[400] bg-white dark:bg-[#0a0a0a] overflow-y-auto selection:bg-yellow-500 selection:text-black animate-in slide-in-from-bottom duration-300">
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[500] bg-yellow-500 text-black font-black text-sm px-6 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300 flex items-center gap-2">
          <Check size={16} strokeWidth={3} />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all active:scale-90"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-black tracking-tighter uppercase italic text-neutral-900 dark:text-white">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0a0a0a]"></span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-full transition-all font-bold text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Profile Hero */}
        <section className="relative overflow-hidden bg-neutral-900 rounded-[2.5rem] p-8 text-white border border-white/5 shadow-2xl shadow-black/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-[80px] -ml-32 -mb-32"></div>

          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-yellow-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="w-32 h-32 rounded-full bg-yellow-500 flex items-center justify-center text-black font-black text-4xl border-4 border-yellow-500 shadow-lg shadow-yellow-500/20 relative z-10">
                {initials || <UserIcon className="w-8 h-8" />}
              </div>
              <div className="absolute bottom-1 right-1 bg-yellow-500 p-2 rounded-full text-black z-20 shadow-lg">
                <Award className="w-4 h-4" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 border border-yellow-500/20">
                  <Star className="w-3 h-3 fill-current" />
                  Gold Member
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">{user?.name ?? 'Guest User'}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm text-neutral-400 font-medium">
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-yellow-500" />{user?.email ?? '-'}</span>
                  <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-yellow-500" />{user?.phone ?? '-'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <AccountStat icon={<Package className="w-4 h-4" />} label="Orders" value={String(totalOrders)} />
                <AccountStat icon={<Award className="w-4 h-4" />} label="Points" value="1,250" />
                <AccountStat icon={<Heart className="w-4 h-4" />} label="Fav Item" value="Cheesy Wedding" />
                <AccountStat icon={<Clock className="w-4 h-4" />} label="Joined" value={memberSinceLabel} />
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-8">
            {loadingAccount ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-yellow-500" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 italic text-neutral-900 dark:text-white">
                      <MapPin className="w-5 h-5 text-yellow-500" />
                      My Locations
                    </h3>
                    <button className="p-2 bg-yellow-500 text-black rounded-xl hover:scale-110 transition-all shadow-lg shadow-yellow-500/20 active:scale-90">
                      <Plus className="w-4 h-4" strokeWidth={3} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-5 rounded-3xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 hover:border-yellow-500/50 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-yellow-500 uppercase tracking-widest">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="text-[9px] bg-yellow-500 text-black px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Default</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-neutral-400 font-medium leading-relaxed">
                          {addr.address}, {addr.city}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 italic px-2 text-neutral-900 dark:text-white">
                    <Settings className="w-5 h-5 text-yellow-500" />
                    Quick Settings
                  </h3>
                  <div className="bg-gray-50 dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
                    <SettingItem icon={<CreditCard className="w-4 h-4" />} label="Payment Methods" />
                    <SettingItem icon={<Bell className="w-4 h-4" />} label="Notifications" />
                    <SettingItem icon={<Shield className="w-4 h-4" />} label="Security & Privacy" />
                    <SettingItem icon={<HelpCircle className="w-4 h-4" />} label="Help & Support" last />
                  </div>
                </div>

                <div className="bg-white dark:bg-[#121212] rounded-3xl border border-neutral-200 dark:border-white/5 p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-1">Broadway Wallet</div>
                      <div className="text-3xl font-black text-yellow-500">Rs. {(customerInfo?.walletBalance ?? 0).toLocaleString()}</div>
                      <p className="text-neutral-600 dark:text-neutral-400 text-xs mt-1">Available balance for your next order</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                      <Wallet size={28} className="text-yellow-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#121212] rounded-3xl border border-red-500/10 p-6">
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

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-[#121212] rounded-3xl border border-neutral-200 dark:border-white/5 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                  <Edit3 size={14} className="text-black" />
                </div>
                <h3 className="text-neutral-900 dark:text-white font-bold text-lg uppercase tracking-wide">Personal Information</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest ml-1 mb-2 block">Full Name</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                    className="w-full bg-neutral-100 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-xl py-4 px-4 text-neutral-900 dark:text-white focus:border-yellow-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
                  <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                    className="w-full bg-neutral-100 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-xl py-4 px-4 text-neutral-900 dark:text-white focus:border-yellow-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest ml-1 mb-2 block">Phone Number</label>
                  <input type="tel" value={customerInfo?.phone ?? user?.phone ?? ''} disabled
                    className="w-full bg-neutral-100 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/5 rounded-xl py-4 px-4 text-neutral-500 cursor-not-allowed"
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

            <div className="px-2 flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-3 text-neutral-900 dark:text-white">
                <Package className="w-6 h-6 text-yellow-500" />
                Recent Orders
              </h3>
              <button className="text-xs font-bold text-yellow-500 hover:text-yellow-600 uppercase tracking-widest border-b-2 border-yellow-500/20 hover:border-yellow-500 transition-all">
                View All Orders
              </button>
            </div>

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
              <div className="space-y-6">
                {orders.map(order => (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-black/5 transition-all cursor-pointer"
                    onClick={() => onViewOrder?.(order.id, order.encId)}
                  >
                    <div className="p-5 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/20">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-800 flex items-center justify-center border border-gray-200 dark:border-neutral-700 shadow-sm">
                          <Package className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Order Reference</div>
                          <div className="font-mono font-black text-lg tracking-tight text-neutral-900 dark:text-white">{order.id}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColor(order.status)}`}>
                          {statusIcon(order.status)}
                          {order.status === 'Rejected' ? 'Cancelled' : order.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      {(orderItemsByEncId[order.encId] || []).length === 0 ? null : (
                        (orderItemsByEncId[order.encId] || []).slice(0, 3).map((item) => (
                          <div key={item.cartId} className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-16 h-16 rounded-2xl object-cover border border-gray-100 dark:border-neutral-800 bg-neutral-100 dark:bg-[#0a0a0a] overflow-hidden">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : null}
                              </div>
                              <span className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 text-black text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-neutral-900">
                                {item.quantity}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="text-base font-black tracking-tight leading-tight text-neutral-900 dark:text-white">{item.name}</div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400 font-bold mt-0.5">
                                {item.sizeLabel} • Rs. {item.price.toFixed(0)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-black text-neutral-900 dark:text-white">Rs. {(item.price * item.quantity).toFixed(0)}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-6 bg-gray-50/50 dark:bg-neutral-800/20 border-t border-gray-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div>
                          <div className="text-[10px] text-neutral-400 uppercase font-black tracking-widest mb-0.5">Date & Time</div>
                          <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                            {new Date(order.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                        <div className="h-8 w-px bg-gray-200 dark:bg-neutral-800 hidden sm:block"></div>
                        <div>
                          <div className="text-[10px] text-neutral-400 uppercase font-black tracking-widest mb-0.5">Amount Paid</div>
                          <div className="text-xl font-black text-yellow-500 tracking-tighter italic">Rs. {order.amount.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        {order.feedbackUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(order.feedbackUrl, '_blank', 'noopener,noreferrer');
                            }}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-xs font-black uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all active:scale-95"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Feedback
                          </button>
                        )}
                        <button
                          onClick={e => handleOrderAgain(e, order.encId)}
                          disabled={orderAgainLoading === order.encId}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-yellow-500 text-black text-xs font-black uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20 active:scale-95 disabled:opacity-70"
                        >
                          {orderAgainLoading === order.encId
                            ? <Loader2 size={14} className="animate-spin" />
                            : <RotateCcw size={14} />}
                          Order Again
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-0 pb-2">
          <div className="bg-yellow-500 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-black">
            <div className="text-center md:text-left">
              <h4 className="text-2xl font-black uppercase tracking-tighter italic">Need help with an order?</h4>
              <p className="font-bold opacity-80">Our customer support is available 24/7 to assist you.</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform active:scale-95">
                Chat with Us
              </button>
              <button className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
                <Phone className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

const AccountStat = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-center hover:bg-white/10 transition-colors">
    <div className="flex justify-center text-yellow-500 mb-1">{icon}</div>
    <div className="text-lg font-black tracking-tighter leading-none">{value}</div>
    <div className="text-[8px] uppercase tracking-widest font-bold opacity-50 mt-1">{label}</div>
  </div>
);

const SettingItem = ({
  icon,
  label,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  last?: boolean;
}) => (
  <button
    className={`w-full flex items-center justify-between p-5 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors ${!last ? 'border-b border-gray-100 dark:border-neutral-800' : ''}`}
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 flex items-center justify-center text-yellow-500 border border-gray-100 dark:border-neutral-700">
        {icon}
      </div>
      <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white">{label}</span>
    </div>
    <ChevronRight className="w-4 h-4 text-neutral-400" />
  </button>
);
