import Detail from "@/components/page/community/Detail";

interface PostPageProps {
  params: {
    id: string;
  };
}

function PostPage({ params }: PostPageProps) {
  return <Detail id={params.id} />;
}

export default PostPage;
