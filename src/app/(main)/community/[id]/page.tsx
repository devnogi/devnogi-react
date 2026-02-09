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
    <div className="flex flex-col gap-4 md:gap-8 pb-8">
      {/* Post Detail */}
      <PostDetailView postId={id} />

      {/* Comments Section */}
      <div className="w-full">
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <CommentList postId={id} />
        </div>
      </div>
    </div>
  );
}

export default PostPage;
