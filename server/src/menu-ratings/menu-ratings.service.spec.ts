import { Test, TestingModule } from '@nestjs/testing';
import { MenuRatingsService } from './menu-ratings.service';

describe('MenuRatingsService', () => {
  let service: MenuRatingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MenuRatingsService],
    }).compile();

    service = module.get<MenuRatingsService>(MenuRatingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
