import { Test, TestingModule } from '@nestjs/testing';
import { ProConDiscussionsController } from './pro-con-discussions.controller';
import { ProConDiscussionsService } from './pro-con-discussions.service';

describe('ProConDiscussionsController', () => {
  let controller: ProConDiscussionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProConDiscussionsController],
      providers: [ProConDiscussionsService],
    }).compile();

    controller = module.get<ProConDiscussionsController>(
      ProConDiscussionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
