import { Test, TestingModule } from '@nestjs/testing';
import { CommentsLikeService } from './comments-like.service';

describe('CommentsLikeService', () => {
  let service: CommentsLikeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentsLikeService],
    }).compile();

    service = module.get<CommentsLikeService>(CommentsLikeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
