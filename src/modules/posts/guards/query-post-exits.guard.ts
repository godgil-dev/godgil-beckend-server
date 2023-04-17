import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostsService } from '../posts.service';

@Injectable()
export class QueryPostExistGuard implements CanActivate {
  constructor(private readonly postService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const postId = Number(request.query.postId || -1); // postId가 어디에서 받아오는지에 따라 수정 필요

    const post = await this.postService.findOne(postId);

    // post가 존재하지 않을 경우 예외 던지기
    if (!post) {
      throw new NotFoundException(`${postId} postId found`);
    }

    return true;
  }
}
