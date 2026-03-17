'use client'
import { useRouter } from 'next/navigation';
import { HotDealsPage } from '@/components/views/HotDealsPage';
import { useCart } from '@/context/CartContext';

export default function HotDealsRoute() {
  const router = useRouter();
  const { addToCart } = useCart();

  return (
    <HotDealsPage
      isOpen={true}
      onClose={() => router.push('/')}
      onAddToCart={addToCart}
    />
  );
}
