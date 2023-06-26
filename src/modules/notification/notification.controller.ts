import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  ParseIntPipe,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiBearerAuth()
  @Get()
  findAll(@Req() request: Request) {
    return this.notificationService.getNotificationsForUser(request.user.id);
  }

  @ApiBearerAuth()
  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    return await this.notificationService.markAsRead(id);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.notificationService.remove(id);
  }
}
