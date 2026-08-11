import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { existsSync } from 'fs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { SyncModule } from './sync/sync.module';
import { UsersModule } from './users/users.module';

// Resolve static directory for Web App frontend
const staticWebPath = join(__dirname, '..', 'public', 'web');
const altStaticWebPath = join(__dirname, '..', '..', 'desktop', 'out', 'renderer');
const targetStaticPath = existsSync(staticWebPath) ? staticWebPath : altStaticWebPath;

@Module({
  imports: [
    DbModule,
    AuthModule,
    SyncModule,
    UsersModule,
    ServeStaticModule.forRoot({
      rootPath: targetStaticPath,
      exclude: ['/api/(.*)'],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
