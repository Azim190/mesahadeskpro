import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as shared from '@masahadesk/shared-types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: shared.LoginDto,
  ): Promise<shared.AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() verifyOtpDto: shared.VerifyOtpDto,
  ): Promise<shared.AuthResponseDto> {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(
    @Body() resendOtpDto: shared.ResendOtpDto,
  ): Promise<{ message: string; cooldownRemaining: number }> {
    return this.authService.resendOtp(resendOtpDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshDto: shared.RefreshDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.refresh(refreshDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(): Promise<{ success: boolean }> {
    await Promise.resolve();
    // Session cleanup is mainly client-side (token deletion), but we return success.
    return { success: true };
  }
}
