'use client';

import { useRouter } from 'next/navigation';
import { MyAccountPage } from '@/components/views/MyAccountPage';

export default function AccountRoute() {
  const router = useRouter();

  return (
    <MyAccountPage
      isOpen={true}
      onClose={() => router.push('/')}
      onViewOrder={(_, encOrderId) => router.push(`/order/${encOrderId}`)}
    />
  );
}
