import { Book, BookDiscussion, Post } from '@prisma/client';

export interface ResponseType {
  post: Post & {
    BookDiscussion: (BookDiscussion & {
      Book: Book;
    })[];
    Comment?: (Comment & {
      User: {
        username: string;
      };
      _count: {
        CommentLike: number;
        CommentDislike: number;
      };
    })[];
    User: {
      username: string;
    };
  };
}

export interface FindAllType {
  limit: number;
  offset: number;
  userId: number;
  query?: string;
  myPostsOnly?: boolean;
}
