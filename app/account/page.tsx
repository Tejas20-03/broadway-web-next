'use client';

import { useRouter } from 'next/navigation';
import { AccountPage } from '@/components/views/AccountPage';

export default function AccountRoute() {
  const router = useRouter();

  return (
    <AccountPage
      isOpen={true}
      onClose={() => router.push('/')}
      onViewOrder={(_, encOrderId) => router.push(`/order/${encodeURIComponent(encOrderId)}`)}
    />
  );
}
