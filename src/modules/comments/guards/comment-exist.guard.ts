import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentsService } from '../comments.service';

@Injectable()
export class CommentExistGuard implements CanActivate {
  constructor(private readonly commentsService: CommentsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const commentId = Number(request.params.id); // 현재 요청의 파라미터에서 댓글 ID 추출

    const comment = await this.commentsService.findOne(commentId);

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.'); // 댓글이 존재하지 않으면 404 에러 발생
    }

    return true; // 댓글이 존재하면 true 반환하여 가드 통과
  }
}
