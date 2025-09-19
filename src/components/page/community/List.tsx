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
import { useEffect, useState } from "react";
import { fetchAllPosts, fetchPostsByBoardId } from "@/lib/api/posts";

interface Post {
  id: number;
  category: string;
  title: string;
  author: string;
  createdAt: string;
  views: number;
  likes: number;
}

interface ListProps {
  selectedBoardId: number;
}

function List({ selectedBoardId }: ListProps) {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function getPosts() {
      if (selectedBoardId !== 0) {
        const fetchedPosts = await fetchPostsByBoardId(selectedBoardId);
        setPosts(fetchedPosts.data.items);
      } else {
        const fetchedPosts = await fetchAllPosts();
        setPosts(fetchedPosts.data.items);
      }
    }

    getPosts();
  }, [selectedBoardId]);

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
          {posts.map((post) => (
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
