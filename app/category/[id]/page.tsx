'use client';

import { useRouter, useParams } from 'next/navigation';
import { CategoryPage } from '@/components/views/CategoryPage';

export default function CategoryRoute() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params?.id ?? '');

  return (
    <CategoryPage
      isOpen={true}
      categoryId={id}
      onClose={() => router.push('/')}
    />
  );
}
