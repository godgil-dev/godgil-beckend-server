import { Test, TestingModule } from '@nestjs/testing';
import { ProConDiscussionsHelperService } from './pro-con-discussions-helper.service';

describe('ProConDiscussionsHelperService', () => {
  let service: ProConDiscussionsHelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProConDiscussionsHelperService],
    }).compile();

    service = module.get<ProConDiscussionsHelperService>(
      ProConDiscussionsHelperService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
