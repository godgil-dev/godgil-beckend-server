import { Test, TestingModule } from '@nestjs/testing';
import { BookDiscussionsService } from './book-discussions.service';

describe('BookDiscussionsService', () => {
  let service: BookDiscussionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookDiscussionsService],
    }).compile();

    service = module.get<BookDiscussionsService>(BookDiscussionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
