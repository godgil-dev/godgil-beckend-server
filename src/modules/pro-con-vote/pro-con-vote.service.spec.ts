import { Test, TestingModule } from '@nestjs/testing';
import { ProConVoteService } from './pro-con-vote.service';

describe('ProConVoteService', () => {
  let service: ProConVoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProConVoteService],
    }).compile();

    service = module.get<ProConVoteService>(ProConVoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
