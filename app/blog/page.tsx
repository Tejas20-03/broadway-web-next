'use client'

import { useRouter } from 'next/navigation';
import { BlogPage } from '@/components/views/BlogPage';

export default function BlogRoute() {
  const router = useRouter();
  return <BlogPage isOpen={true} onClose={() => router.push('/')} />;
}
