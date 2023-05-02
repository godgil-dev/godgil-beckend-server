export interface FindAllType {
  limit: number;
  offset: number;
  userId?: number;
  query?: string;
  myPostsOnly?: boolean;
}
