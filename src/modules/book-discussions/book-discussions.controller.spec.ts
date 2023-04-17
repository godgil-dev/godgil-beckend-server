import { Test, TestingModule } from '@nestjs/testing';
import { BookDiscussionsController } from './book-discussions.controller';
import { BookDiscussionsService } from './book-discussions.service';

describe('BookDiscussionsController', () => {
  let controller: BookDiscussionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookDiscussionsController],
      providers: [BookDiscussionsService],
    }).compile();

    controller = module.get<BookDiscussionsController>(
      BookDiscussionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
