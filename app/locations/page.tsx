'use client'

import { useRouter } from 'next/navigation';
import { LocationsPage } from '@/components/views/LocationsPage';

export default function LocationsRoute() {
  const router = useRouter();
  return <LocationsPage isOpen={true} onClose={() => router.push('/')} />;
}
