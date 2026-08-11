import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  SyncQueueItemDto,
  SyncPullResponseDto,
} from '@masahadesk/shared-types';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('push')
  async push(
    @Body() items: SyncQueueItemDto[],
  ): Promise<{ successIds: number[] }> {
    return this.syncService.push(items);
  }

  @Get('pull')
  async pull(@Query('since') since?: string): Promise<SyncPullResponseDto> {
    return this.syncService.pull(since);
  }
}
