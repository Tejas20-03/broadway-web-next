'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

// Layout
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Footer } from '../components/layout/Footer';
import { NavigationDrawer } from '../components/layout/NavigationDrawer';

// Menu
import { Hero } from '../components/menu/Hero';
import { CategoryNav } from '../components/menu/CategoryNav';
import { ProductCard } from '../components/menu/ProductCard';

// Modals
import { CartDrawer } from '../components/modals/CartDrawer';
import { ProductModal } from '../components/modals/ProductModal';
import { LocationModal } from '../components/modals/LocationModal';
import { ContactModal } from '../components/modals/ContactModal';
import { FranchiseModal } from '../components/modals/FranchiseModal';
import { BirthdayModal } from '../components/modals/BirthdayModal';
import { FeedbackModal } from '../components/modals/FeedbackModal';
import { SpinWheelModal } from '../components/modals/SpinWheelModal';

// Full-screen views
import { CheckoutPage } from '../components/views/CheckoutPage';
import { OrderConfirmationPage } from '../components/views/OrderConfirmationPage';
import { LoginPage } from '../components/views/LoginPage';
import { AccountPage } from '../components/views/AccountPage';

// State and Data
import { useCart } from '../context/CartContext';
import { useApp } from '../context/AppContext';
import { useLocation } from '../context/LocationContext';
import { useUser } from '../context/UserContext';
import { useGetPendingOrdersQuery } from '../store/apiSlice';
import type { PendingOrder } from '../services/api';
import { useMenu } from '../hooks/useMenu';
import { calculateOrderTotals } from '../lib/utils';
import { Product } from '../types';

// SEO helper (client-side only)
function updateMeta(title: string, description: string, product?: Product) {
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);

  let script = document.getElementById('json-ld-schema') as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = 'json-ld-schema';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  if (product) {
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      image: product.image,
      description: product.description || `Fresh and delicious ${product.name} from Broadway Pizza.`,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'PKR',
        price: product.basePrice,
        availability: 'https://schema.org/InStock',
      },
    });
  } else {
    script.textContent = '';
  }
}

export default function Home() {
  const {
    cartItems,
    cartCount,
    isCartOpen,
    addToCart,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
  } = useCart();

  const {
    isDark,
    toggleTheme,
    isMenuOpen, openMenu, closeMenu,
    isLocationOpen, openLocation, closeLocation,
    isCheckoutOpen, openCheckout, closeCheckout,
    isOrderConfirmed, confirmOrder, closeOrderConfirmation,
    isLoginOpen, openLogin, closeLogin,
    isContactOpen, openContact, closeContact,
    isFranchiseOpen, openFranchise, closeFranchise,
    isBirthdayOpen, openBirthday, closeBirthday,
    isFeedbackOpen, openFeedback, closeFeedback,
    isSpinOpen, openSpin, closeSpin,
    lastOrder, setLastOrder,
  } = useApp();

  // Re-fetches automatically when city or area/outlet changes
  const { location, isHydrated, hasSetLocation } = useLocation();
  const { categories, products, isLoading } = useMenu(
    location.city,
    location.area,
    location.orderType === 'pickup' ? location.outlet : undefined,
  );

  // Auto-open location modal for first-time visitors
  useEffect(() => {
    if (isHydrated && !hasSetLocation) {
      openLocation();
    }
  }, [isHydrated, hasSetLocation, openLocation]);

  const { user } = useUser();
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [trackDismissed, setTrackDismissed] = useState(false);

  // RTK Query: auto-fetches and refetches when user logs in/out
  const { data: pendingOrders = [] } = useGetPendingOrdersQuery(
    user?.phone ?? '',
    { skip: !user?.phone, pollingInterval: 60000 },
  );

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    if (isLoading || products.length === 0) return;
    const syncFromUrl = () => {
      const productId = new URLSearchParams(window.location.search).get('item');
      setSelectedProduct(productId ? (products.find(p => p.id === productId) ?? null) : null);
    };
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, [products, isLoading]);

  useEffect(() => {
    if (selectedProduct) {
      updateMeta(
        `${selectedProduct.name} - Broadway Pizza`,
        selectedProduct.description || `Order ${selectedProduct.name} online from Broadway Pizza.`,
        selectedProduct,
      );
    } else {
      updateMeta(
        'Broadway Pizza - Modern Pizza Ordering',
        'The best pizza in town. Order online for fast delivery and exclusive deals.',
      );
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (isLoading || categories.length === 0) return;
    const handleScroll = () => {
      const scrollPos = window.scrollY + 250;
      for (const cat of categories) {
        const el = document.getElementById(cat.id);
        if (el && scrollPos >= el.offsetTop && scrollPos < el.offsetTop + el.offsetHeight) {
          setActiveCategory(cat.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories, isLoading]);

  const handleOpenProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    try {
      const params = new URLSearchParams(window.location.search);
      params.set('item', product.id);
      window.history.pushState({ productId: product.id }, '', `${window.location.pathname}?${params}`);
    } catch { /* no-op */ }
  }, []);

  const handleCloseProduct = useCallback(() => {
    setSelectedProduct(null);
    try {
      window.history.pushState({}, '', window.location.pathname);
    } catch { /* no-op */ }
  }, []);

  const scrollToCategory = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 150, behavior: 'smooth' });
      setActiveCategory(id);
    }
  }, []);

  const handlePlaceOrder = useCallback((orderAddress?: string) => {
    const totals = calculateOrderTotals(cartItems, location.deliveryFee, location.deliveryTax);
    setLastOrder({ items: [...cartItems], ...totals, orderAddress });
    clearCart();
    confirmOrder();
  }, [cartItems, location.deliveryFee, location.deliveryTax, clearCart, confirmOrder, setLastOrder]);

  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] transition-colors">
        <Loader2 size={48} className="animate-spin text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Loading Menu...
        </h2>
        <p className="text-neutral-500 mt-2">Fetching delicious deals for you</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-yellow-500 selection:text-black bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300">

      <Sidebar
        onOpenMenu={openMenu}
        toggleCart={() => (isCartOpen ? closeCart() : openCart())}
        cartCount={cartCount}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onOpenLogin={openLogin}
        onOpenAccount={() => user ? setIsAccountOpen(true) : openLogin()}
        onOpenSpin={openSpin}
      />

      <NavigationDrawer
        isOpen={isMenuOpen}
        onClose={closeMenu}
        onOpenContact={openContact}
        onOpenFranchise={openFranchise}
        onOpenBirthday={openBirthday}
        onOpenFeedback={openFeedback}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenLogin={openLogin}
      />

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={handleCloseProduct}
        onAddToCart={addToCart}
      />

      <LocationModal
        isOpen={isLocationOpen}
        onClose={closeLocation}
        onOpenLogin={openLogin}
        onPendingOrders={() => { setTrackDismissed(false); }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={closeCart}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        onCheckout={() => { closeCart(); openCheckout(); }}
        products={products}
        onAddToCart={addToCart}
      />

      <ContactModal isOpen={isContactOpen} onClose={closeContact} />
      <FranchiseModal isOpen={isFranchiseOpen} onClose={closeFranchise} />
      <BirthdayModal isOpen={isBirthdayOpen} onClose={closeBirthday} />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={closeFeedback} />
      <SpinWheelModal isOpen={isSpinOpen} onClose={closeSpin} />

      <CheckoutPage
        isOpen={isCheckoutOpen}
        onBack={closeCheckout}
        cartItems={cartItems}
        subtotal={cartSubtotal}
        onPlaceOrder={handlePlaceOrder}
      />

      <OrderConfirmationPage
        isOpen={isOrderConfirmed}
        onClose={closeOrderConfirmation}
        cartItems={lastOrder?.items ?? []}
        subtotal={lastOrder?.subtotal ?? 0}
        tax={lastOrder?.tax ?? 0}
        deliveryFee={lastOrder?.deliveryFee ?? 0}
        total={lastOrder?.total ?? 0}
        orderAddress={lastOrder?.orderAddress}
        orderType={location.orderType}
      />

      <LoginPage isOpen={isLoginOpen} onClose={closeLogin} />
      <AccountPage isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} />

      <div className="flex-1 md:pl-24 transition-all duration-300 flex flex-col min-h-screen">

        {/* Pending Orders Track FAB - fixed bottom right */}
        {pendingOrders.length > 0 && !trackDismissed && (() => {
          const latest = pendingOrders[0];
          const isConfirmed = latest.status === 'Confirmed';
          return (
            <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-1">
              {/* Dismiss button */}
              <button
                onClick={() => setTrackDismissed(true)}
                className="w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-xs leading-none hover:bg-black/80 transition-colors"
                aria-label="Dismiss"
              >
                &times;
              </button>
              {/* Track pill */}
              <button
                onClick={() => {/* tracking will use EncOrderID once API is shared */}}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl font-bold text-sm text-black transition-transform active:scale-95 ${isConfirmed ? 'bg-green-500' : 'bg-yellow-400'}`}
              >
                <span className="w-2 h-2 rounded-full bg-black/30 animate-pulse shrink-0" />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-xs font-black uppercase tracking-widest">
                    {isConfirmed ? 'Order Confirmed' : 'Track Order'}
                    {pendingOrders.length > 1 && ` (${pendingOrders.length})`}
                  </span>
                  <span className="text-xs font-normal opacity-70">#{latest.id} · Rs. {latest.amount.toLocaleString()}</span>
                </span>
              </button>
            </div>
          );
        })()}
        <Navbar
          cartCount={cartCount}
          toggleCart={() => (isCartOpen ? closeCart() : openCart())}
          onOpenMenu={openMenu}
          onOpenLocation={openLocation}
        />

        <main className="pb-20 pt-[5px] flex-grow">
          <div className="w-[95%] mx-auto mb-[5px]">
            <Hero />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <CategoryNav
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={scrollToCategory}
            />

            <div className="pt-2 pb-12">
              {categories.map(cat => {
                const sectionProducts = products.filter(p => p.category === cat.id);
                if (sectionProducts.length === 0) return null;

                return (
                  <section key={cat.id} id={cat.id} className="scroll-mt-48 mb-16">
                    <div className="flex items-end gap-4 my-[10px] border-b border-neutral-200 dark:border-white/5 pb-[10px] px-2 md:px-0">
                      <h2 className="text-2xl md:text-4xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase">
                        {cat.label}
                      </h2>
                      <span className="text-neutral-500 text-sm md:text-base font-medium pb-1 md:pb-1.5">
                        {sectionProducts.length} Items
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                      {sectionProducts.map(product => (
                        <ProductCard
                          key={`${cat.id}-${product.id}`}
                          product={product}
                          onAdd={handleOpenProduct}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </main>

        <Footer
          onOpenContact={openContact}
          onOpenFeedback={openFeedback}
        />
      </div>
    </div>
  );
}
