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

// Post & {
//     User: {
//         username: string;
//     };
//     BookDiscussion: (BookDiscussion & {
//         Book: Book;
//     })[];
//     Comment: (Comment & {
//         User: {
//             username: string;
//         };
//         _count: {
//             CommentLike: number;
//             CommentDislike: number;
//         };
//     })[];
// }
