import { Test, TestingModule } from '@nestjs/testing';
import { ProConDiscussionsService } from './pro-con-discussions.service';

describe('ProConDiscussionsService', () => {
  let service: ProConDiscussionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProConDiscussionsService],
    }).compile();

    service = module.get<ProConDiscussionsService>(ProConDiscussionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
