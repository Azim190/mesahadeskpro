import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { DbModule } from '../db/db.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DbModule, AuthModule],
  controllers: [UsersController],
})
export class UsersModule {}
