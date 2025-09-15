import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  },
  {
    id: 2,
    category: "공략 게시판",
    title: "글 제목 2",
    author: "작성자 2",
    createdAt: "2023-10-26",
    views: 200,
    likes: 20,
  },
  {
    id: 3,
    category: "거래 게시판",
    title: "글 제목 3",
    author: "작성자 3",
    createdAt: "2023-10-25",
    views: 300,
    likes: 30,
  },
];

interface ListProps {
  selectedCategory: string;
}

function List({ selectedCategory }: ListProps) {
  const filteredPosts =
    selectedCategory === "전체"
      ? posts
      : posts.filter((post) => post.category === selectedCategory);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <select className="border rounded px-2 py-1">
          <option value="latest">등록순</option>
          <option value="likes">추천순</option>
          <option value="views">조회순</option>
        </select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">번호</TableHead>
            <TableHead className="w-[150px]">카테고리</TableHead>
            <TableHead>제목</TableHead>
            <TableHead className="w-[150px]">작성자</TableHead>
            <TableHead className="w-[150px]">작성일</TableHead>
            <TableHead className="w-[100px]">조회수</TableHead>
            <TableHead className="w-[100px]">추천</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPosts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>{post.id}</TableCell>
              <TableCell>{post.category}</TableCell>
              <TableCell>
                <Link href={`/community/${post.id}`}>{post.title}</Link>
              </TableCell>
              <TableCell>{post.author}</TableCell>
              <TableCell>{post.createdAt}</TableCell>
              <TableCell>{post.views}</TableCell>
              <TableCell>{post.likes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-center mt-4">
        <Button variant="outline">이전</Button>
        <span className="mx-4">1 / 1</span>
        <Button variant="outline">다음</Button>
      </div>
    </div>
  );
}

export default List;
