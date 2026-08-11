import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './db.service';

@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DbModule {}
