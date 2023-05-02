export class PageInfoDto {
  page: number;
  totalCount: number;
  currentCount: number;
  totalPage: number;
}

export class CommentResponseDto {
  id: number;
  author: string;
  content: string;
  like: number;
  dislike: number;
  createdAt: string;
  updatedAt: string;
  isPro?: boolean;
}
