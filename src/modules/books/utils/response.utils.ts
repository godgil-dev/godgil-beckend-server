export function postToResponseWithoutBook(post, isLiked) {
  return {
    id: post.id,
    title: post.title,
    likeCount: post.PostLike.length,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    postLikedByUser: isLiked,
  };
}
