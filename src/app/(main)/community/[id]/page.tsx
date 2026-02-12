import PostDetailView from "@/components/page/community/PostDetailView";
import CommentList from "@/components/page/community/CommentList";

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  return (
    <div className="w-full md:w-2/3 mx-auto flex flex-col gap-4 md:gap-6 pb-8">
      {/* Post Detail */}
      <PostDetailView postId={id} />

      {/* Comments Section */}
      <div className="w-full">
        <div className="bg-white/95 dark:bg-navy-700/95 rounded-2xl border border-gray-200 dark:border-navy-600 p-4 md:p-5">
          <CommentList postId={id} />
        </div>
      </div>
    </div>
  );
}

export default PostPage;
