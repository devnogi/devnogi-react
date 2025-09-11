import { Button } from "@/components/ui/button";
import Link from "next/link";

const posts = [
  {
    id: 1,
    category: "자유게시판",
    title: "글 제목 1",
    author: "작성자 1",
    createdAt: "2023-10-27",
    views: 100,
    likes: 10,
    content:
      "글 내용 1 입니다. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 2,
    category: "공략 게시판",
    title: "글 제목 2",
    author: "작성자 2",
    createdAt: "2023-10-26",
    views: 200,
    likes: 20,
    content:
      "글 내용 2 입니다. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 3,
    category: "거래 게시판",
    title: "글 제목 3",
    author: "작성자 3",
    createdAt: "2023-10-25",
    views: 300,
    likes: 30,
    content:
      "글 내용 3 입니다. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];

interface DetailProps {
  id: string;
}

function Detail({ id }: DetailProps) {
  const post = posts.find((p) => p.id === parseInt(id));

  if (!post) {
    return <div>게시글을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="border-b pb-4 mb-4">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <div className="text-sm text-gray-500 mt-2">
          <span>{post.author}</span> | <span>{post.createdAt}</span> |{" "}
          <span>조회 {post.views}</span> | <span>추천 {post.likes}</span>
        </div>
      </div>
      <div className="prose max-w-none">{post.content}</div>
      <div className="flex justify-between mt-8">
        <Button variant="outline">이전글</Button>
        <Button variant="outline">다음글</Button>
      </div>
      <div className="flex justify-end mt-4">
        <Link href="/community">
          <Button variant="default">목록으로</Button>
        </Link>
      </div>
    </div>
  );
}

export default Detail;
