import { Test, TestingModule } from '@nestjs/testing';
import { MenuRatingsController } from './menu-ratings.controller';
import { MenuRatingsService } from './menu-ratings.service';

describe('MenuRatingsController', () => {
  let controller: MenuRatingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuRatingsController],
      providers: [MenuRatingsService],
    }).compile();

    controller = module.get<MenuRatingsController>(MenuRatingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
