export interface Post {
  id: number;
  name: string; // full name of the poster
  username: string; // username (e.g. @elonmusk)
  content: string;
  image?: string;
  likes: number;
  reposts: number;
  comments: number;
  createdAt: string;
  commentList: any[];
}
