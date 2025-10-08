import PostDetailView from "@/components/page/community/PostDetailView";
import CommentList from "@/components/page/community/CommentList";
import CommentForm from "@/components/page/community/CommentForm";

interface PostPageProps {
  params: {
    id: string;
  };
}

function PostPage({ params }: PostPageProps) {
  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Post Detail */}
      <PostDetailView postId={params.id} />

      {/* Comments Section */}
      <div className="max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <CommentList postId={params.id} />

          {/* Comment Form */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <CommentForm postId={params.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostPage;
