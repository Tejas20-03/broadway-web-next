'use client';

import { useRouter, useParams } from 'next/navigation';
import { ProductPage } from '@/components/views/ProductPage';

export default function ProductRoute() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params?.id ?? '');

  return (
    <ProductPage
      isOpen={true}
      productId={id}
      onClose={() => router.push('/')}
    />
  );
}
