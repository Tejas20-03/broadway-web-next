'use client';

import { useParams, useRouter } from 'next/navigation';
import { OrderConfirmationPage } from '@/components/views/OrderConfirmationPage';

export default function OrderRoute() {
  const params = useParams<{ encId: string }>();
  const router = useRouter();
  const encOrderId = params.encId ? decodeURIComponent(params.encId) : '';

  return (
    <OrderConfirmationPage
      isOpen={true}
      onClose={() => router.push('/')}
      encOrderId={encOrderId}
    />
  );
}
