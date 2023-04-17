import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PostsService } from '../posts.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private readonly postService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const postId = Number(request.params.id); // 현재 요청의 파라미터에서 post id 추출

    // PostService를 통해 post 소유 여부 체크
    const isOwner = await this.postService.checkOwnership(postId, request.user);
    return isOwner;
  }
}
