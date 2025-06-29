import { Metadata } from 'next';
import { PostList } from '@/components/page/posts/post-list';

export const metadata: Metadata = {
  title: '게시글 목록 - 마비노기 블로니 채널',
  description: '마비노기 블로니 채널의 게시글 목록입니다.',
};

export default function PostsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <PostList />
    </div>
  );
} 