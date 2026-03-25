import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { fetchBlogPostBySlug } from '@/services/api';

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(decodeURIComponent(slug));

  if (!post) {
    notFound();
  }

  const content = post.content?.trim() || post.excerpt;
  const hasHtmlContent = /<\/?[a-z][\s\S]*>/i.test(content);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:text-yellow-500 transition-colors mb-6">
          <ArrowLeft size={16} />
          Back To Blogs
        </Link>

        {post.image && (
          <div className="relative w-full h-[260px] md:h-[420px] rounded-3xl overflow-hidden border border-neutral-200 dark:border-white/10 mb-8">
            <Image
              src={post.image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
        )}

        <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-widest text-neutral-600 dark:text-neutral-400 font-bold">
          <span>{post.category}</span>
          <span>•</span>
          <span>{post.date}</span>
          {post.readTime && (
            <>
              <span>•</span>
              <span>{post.readTime}</span>
            </>
          )}
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-6">{post.title}</h1>

        <article className="prose dark:prose-invert prose-neutral max-w-none prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-headings:text-neutral-900 dark:prose-headings:text-white prose-a:text-yellow-600 dark:prose-a:text-yellow-500">
          {hasHtmlContent ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <p>{content}</p>
          )}
        </article>
      </div>
    </div>
  );
}
