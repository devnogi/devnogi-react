import PostDetailView from "@/components/page/community/PostDetailView";
import CommentList from "@/components/page/community/CommentList";
import PopularPostsHighlight from "@/components/page/community/PopularPostsHighlight";

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  return (
    <div className="w-full md:w-2/3 mx-auto pb-8">
      <div className="md:grid md:grid-cols-[minmax(0,1fr)_320px] md:gap-6 lg:gap-8">
        <section className="min-w-0 flex flex-col gap-4 md:gap-6">
          {/* Post Detail */}
          <PostDetailView postId={id} />

          {/* Mobile Popular Posts */}
          <div className="md:hidden">
            <PopularPostsHighlight />
          </div>

          {/* Comments Section */}
          <div className="w-full">
            <div className="bg-white/95 dark:bg-navy-700/95 rounded-2xl border border-gray-200 dark:border-navy-600 p-4 md:p-5">
              <CommentList postId={id} />
            </div>
          </div>
        </section>

        <aside className="hidden md:block">
          <div className="sticky top-[116px]">
            <PopularPostsHighlight />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default PostPage;
