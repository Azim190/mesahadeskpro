import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RedisService } from './redis.service';
import { SmsService, MockSmsGateway, TaqnyatSmsGateway } from './sms.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        'super_secret_jwt_key_please_change_in_production',
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RedisService,
    SmsService,
    MockSmsGateway,
    TaqnyatSmsGateway,
    JwtAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
