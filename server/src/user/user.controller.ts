
import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { Session, AllowAnonymous, OptionalAuth } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getProfile(@Session() session: UserSession) {
    return { user: session.user };
  }

  @Get('public')
  @AllowAnonymous() // Allow anonymous access
  async getPublic() {
    return { message: 'Public route' };
  }

  @Get('optional')
  @OptionalAuth() // Authentication is optional
  async getOptional(@Session() session: UserSession) {
    return { authenticated: !!session };
  }

  @Get(':userId/location')
  async getUserLocation(@Param('userId') userId: string) {
    return this.userService.getUserLocation(userId);
  }

  @Patch(':userId/location')
  async updateUserLocation(
    @Param('userId') userId: string,
    @Body() body: { latitude: string; longitude: string; address: string },
  ) {
    return this.userService.updateUserLocation(
      userId,
      body.latitude,
      body.longitude,
      body.address,
    );
  }
}