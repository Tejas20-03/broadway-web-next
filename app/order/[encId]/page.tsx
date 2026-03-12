'use client';

import { useParams, useRouter } from 'next/navigation';
import { OrderConfirmationPage } from '@/components/views/OrderConfirmationPage';

export default function OrderRoute() {
  const params = useParams<{ encId: string }>();
  const router = useRouter();

  // Next.js decodes path segments; decodeURIComponent is a safety net for double-encoded cases
  const encOrderId = decodeURIComponent(params.encId ?? '');

  return (
    <OrderConfirmationPage
      isOpen={true}
      onClose={() => router.push('/')}
      encOrderId={encOrderId}
    />
  );
}
