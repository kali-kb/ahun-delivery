import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemsController } from './restaurant-menus.controller';
import { MenuItemsService } from './menus.service';

describe('MenuItemsController', () => {
  let controller: MenuItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuItemsController],
      providers: [MenuItemsService],
    }).compile();

    controller = module.get<MenuItemsController>(MenuItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
