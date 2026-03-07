'use client'
import { useRouter } from 'next/navigation';
import { HotDealsPage } from '@/components/views/HotDealsPage';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';

export default function HotDealsRoute() {
  const router = useRouter();
  const { addToCart } = useCart();

  const handleProductSelect = (product: Product) => {
    router.push(`/?item=${product.id}`);
  };

  return (
    <HotDealsPage
      isOpen={true}
      onClose={() => router.push('/')}
      onAddToCart={addToCart}
      onProductSelect={handleProductSelect}
    />
  );
}
