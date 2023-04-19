import { Test, TestingModule } from '@nestjs/testing';
import { ProConVoteController } from './pro-con-vote.controller';
import { ProConVoteService } from './pro-con-vote.service';

describe('ProConVoteController', () => {
  let controller: ProConVoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProConVoteController],
      providers: [ProConVoteService],
    }).compile();

    controller = module.get<ProConVoteController>(ProConVoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
