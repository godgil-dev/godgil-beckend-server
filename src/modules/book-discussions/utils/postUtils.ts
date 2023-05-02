import { Post, BookDiscussion, Book, Comment, PostLike } from '@prisma/client';

export const postToResponse = (
  post: Post & {
    BookDiscussion: BookDiscussion & {
      Book: Book;
    };
    Comment?: Comment[];
    User: {
      username: string;
    };
    PostLike: PostLike[];
    _count: { PostLike: number };
  },
) => ({
  id: post.id,
  author: post.User.username,
  title: post.title,
  content: post.content,
  views: post.views,
  likeCount: post._count.PostLike,
  createdAt: post.createdAt.toISOString(),
  updatedAt: post.updatedAt.toISOString(),
  book: post.BookDiscussion.Book,
  ...(post.Comment && { comments: post.Comment }),
  postLikedByUser: post.PostLike.length > 0 ? true : false,
});

export const prismaPostInclude = (userId: number) => ({
  BookDiscussion: {
    include: {
      Book: true,
    },
  },
  User: {
    select: {
      username: true,
    },
  },
  PostLike: {
    where: {
      userId,
    },
  },
  _count: {
    select: {
      PostLike: true,
    },
  },
});
