'use client';

import { useRouter, useParams } from 'next/navigation';
import { SimpleProductPage } from '@/components/views/SimpleProductPage';

export default function SimpleProductRoute() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params?.id ?? '');

  return (
    <SimpleProductPage
      isOpen={true}
      productId={id}
      onClose={() => router.push('/')}
    />
  );
}
