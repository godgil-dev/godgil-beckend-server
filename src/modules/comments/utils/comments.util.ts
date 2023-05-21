import { Comment, CommentDislike, CommentLike } from '@prisma/client';

export function convertCommentToReposnse(
  comment: Comment & {
    User: {
      username: string;
      avatarUrl: string;
    };
    _count: {
      CommentLike: number;
      CommentDislike: number;
    };
    CommentLike: CommentLike[];
    CommentDislike: CommentDislike[];
  },
  userId: number,
) {
  return {
    id: comment.id,
    author: comment.User.username,
    avatarUrl: comment.User.avatarUrl,
    content: comment.content,
    like: comment._count.CommentLike,
    dislike: comment._count.CommentDislike,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    likedByUser: comment.CommentLike.some((like) => like.userId === userId),
    dislikedByUser: comment.CommentDislike.some(
      (dislike) => dislike.userId === userId,
    ),
  };
}
export const prismaCommentInclude = () => ({
  ProConDiscussion: {
    include: {
      ProConVote: true,
    },
  },
  User: {
    select: {
      username: true,
    },
  },
});
