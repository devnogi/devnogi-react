import PostDetailView from "@/components/page/community/PostDetailView";
import CommentList from "@/components/page/community/CommentList";
import CommentForm from "@/components/page/community/CommentForm";

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Post Detail */}
      <PostDetailView postId={id} />

      {/* Comments Section */}
      <div className="w-full px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <CommentList postId={id} />

          {/* Comment Form */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <CommentForm postId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostPage;
