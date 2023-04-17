import { Test, TestingModule } from '@nestjs/testing';
import { CommentsDislikeService } from './comments-dislike.service';

describe('CommentsDislikeService', () => {
  let service: CommentsDislikeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentsDislikeService],
    }).compile();

    service = module.get<CommentsDislikeService>(CommentsDislikeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
