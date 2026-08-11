import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../db/db.service';
import {
  SyncQueueItemDto,
  SyncPullResponseDto,
} from '@masahadesk/shared-types';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private readonly db: DatabaseService) {}

  async push(items: SyncQueueItemDto[]): Promise<{ successIds: number[] }> {
    this.logger.log(`Processing push request with ${items.length} items`);
    return this.db.pushSyncItems(items);
  }

  async pull(sinceStr?: string): Promise<SyncPullResponseDto> {
    this.logger.log(
      `Processing pull request with since parameter: "${sinceStr || 'none'}"`,
    );
    const since = sinceStr ? new Date(sinceStr) : new Date(0);

    // Validate date parsing
    const validSince = isNaN(since.getTime()) ? new Date(0) : since;
    return this.db.pullSyncChanges(validSince);
  }
}
