import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { CommentsService } from '../comments.service';

@Injectable()
export class CommentOwnershipGuard implements CanActivate {
  constructor(private readonly commentsService: CommentsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const commentId = Number(request.params.id); // 현재 요청의 파라미터에서 post id 추출
    // PostService를 통해 post 소유 여부 체크
    const isOwner = await this.commentsService.checkOwnership(
      commentId,
      request.user,
    );
    return isOwner;
  }
}
