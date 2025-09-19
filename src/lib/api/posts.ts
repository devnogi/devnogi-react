import axios from "axios";

export async function fetchPostsByBoardId(boardId: number, page: number = 1, size: number = 20, sortBy: string = "createdAt", direction: string = "desc") {
  try {
    const response = await axios.get(`/api/posts/${boardId}?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching posts for board ${boardId}:`, error);
    throw error;
  }
}

export async function fetchAllPosts(page: number = 1, size: number = 20, sortBy: string = "createdAt", direction: string = "desc") {
  try {
    const response = await axios.get(`/api/posts?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching all posts:`, error);
    throw error;
  }
}