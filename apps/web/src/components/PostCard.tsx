'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { Post } from '@yliu/types/blog';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="page-content-bg rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-border/20">
      {/* 单张缩略图显示在顶部 */}
      {post.thumbnail && post.thumbnail.length === 1 && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <Image
            src={post.thumbnail[0]}
            alt={post.title}
            width={800}
            height={400}
            className="w-full h-auto max-h-[200px] object-cover"
          />
        </div>
      )}

      {/* 标题 */}
      <h2 className="text-2xl font-bold mb-3">
        <Link
          href={`/post/${post.id}`}
          className="text-foreground hover:text-primary transition-colors"
        >
          {post.title}
        </Link>
      </h2>

      {/* 简介 */}
      <p className="text-muted-foreground mb-4">{post.excerpt}</p>

      {/* 2-3张缩略图显示在简介下方 */}
      {post.thumbnail && post.thumbnail.length > 1 && (
        <div className="grid grid-cols-1 gap-3 mb-4 sm:flex sm:flex-row sm:flex-nowrap sm:overflow-x-auto sm:pb-2">
          {post.thumbnail.map((img, index) => (
            <div
              key={index}
              className={`rounded-lg overflow-hidden w-full sm:flex-shrink-0 ${
                post.thumbnail.length === 2
                  ? 'sm:w-[calc(50%_-_6px)]'
                  : 'sm:w-[calc(33.33%_-_8px)]'
              }`}
            >
              <Image
                src={img}
                alt={`${post.title} - 图片 ${index + 1}`}
                width={400}
                height={225}
                className="w-full h-32 object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* 标签和时间 */}
      <div className="flex flex-wrap justify-between items-center text-sm mt-2">
        <div className="flex flex-wrap items-center gap-2">
          {post.labels.slice(0, 3).map((label) => (
            <Link
              key={label}
              href={`/category/${encodeURIComponent(label)}`}
              className="bg-secondary/50 text-foreground dark:text-secondary-foreground text-xs px-3 py-1 rounded-full hover:bg-secondary/70 transition-colors"
            >
              #{label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar size={14} />
          <time dateTime={post.createdAt}>
            {format(new Date(post.createdAt), 'yyyy年MM月dd日')}
          </time>
        </div>
      </div>
    </article>
  );
}
