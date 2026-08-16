import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../db/db.service';
import { RedisService } from './redis.service';
import { SmsService } from './sms.service';
import { JwtService } from '@nestjs/jwt';
import {
  LoginDto,
  VerifyOtpDto,
  ResendOtpDto,
  AuthResponseDto,
} from '@masahadesk/shared-types';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
    private readonly sms: SmsService,
    private readonly jwt: JwtService,
  ) {}

  // Check if account is currently locked out
  async checkLockout(iqamaId: string): Promise<void> {
    const isLocked = await this.redis.get(`lockout:${iqamaId}`);
    if (isLocked) {
      throw new ForbiddenException(
        'Account is locked due to too many failed attempts. Try again in 15 minutes.',
      );
    }
  }

  // Increment failure count and trigger lockout if >= 5
  async handleFailure(iqamaId: string): Promise<void> {
    const attempts = await this.redis.incr(`attempts:${iqamaId}`, 900); // 15 mins expiry
    if (attempts >= 5) {
      await this.redis.set(`lockout:${iqamaId}`, 'true', 900); // 15 mins lockout
      await this.redis.del(`attempts:${iqamaId}`);
      throw new ForbiddenException(
        'Account has been locked for 15 minutes due to 5 consecutive failed attempts.',
      );
    }
  }

  async resetFailures(iqamaId: string): Promise<void> {
    await this.redis.del(`attempts:${iqamaId}`);
    await this.redis.del(`lockout:${iqamaId}`);
  }

  // Direct Login: Email & Password Verification
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const { iqamaId, password } = dto;

    // Validate Email format
    if (!iqamaId || !iqamaId.includes('@')) {
      throw new BadRequestException(
        'Invalid email address format / تنسيق البريد الإلكتروني غير صالح.',
      );
    }

    await this.checkLockout(iqamaId);

    // Fetch user
    const user = await this.db.findUserByIqamaId(iqamaId);
    if (!user || !user.isActive) {
      // Return generic error to prevent user enumeration
      await this.handleFailure(iqamaId);
      throw new UnauthorizedException('Invalid credentials.');
    }

    // Verify Password
    const passwordMatch = bcrypt.compareSync(password || '', user.passwordHash);
    if (!passwordMatch) {
      await this.handleFailure(iqamaId);
      throw new UnauthorizedException('Invalid credentials.');
    }

    // Credentials valid! Reset failure counters
    await this.resetFailures(iqamaId);

    // Update last login
    await this.db.updateUserLastLogin(user.id);

    // Generate JWT Tokens
    const payload = {
      sub: user.id,
      iqamaId: user.iqamaId,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign({ sub: user.id }, { expiresIn: '7d' });

    // Log to Audit Log
    await this.db.createAuditLog({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      detailsJson: { iqamaId },
    });

    // Remove password hash from user response
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as { passwordHash?: string }).passwordHash;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  // Phase 2: Verify SMS OTP code
  async verifyOtp(dto: VerifyOtpDto): Promise<AuthResponseDto> {
    const { iqamaId, code } = dto;

    await this.checkLockout(iqamaId);

    const user = await this.db.findUserByIqamaId(iqamaId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid user.');
    }

    // Retrieve hashed OTP
    const storedHash = await this.redis.get(`otp:${iqamaId}`);
    if (!storedHash) {
      await this.handleFailure(iqamaId);
      throw new UnauthorizedException(
        'Verification code has expired or is invalid.',
      );
    }

    // Check code
    const isCodeValid = bcrypt.compareSync(code, storedHash);
    if (!isCodeValid) {
      await this.handleFailure(iqamaId);
      throw new UnauthorizedException('Invalid verification code.');
    }

    // OTP verified successfully! Clean up keys
    await this.redis.del(`otp:${iqamaId}`);
    await this.redis.del(`cooldown:${iqamaId}`);
    await this.resetFailures(iqamaId);

    // Update last login
    await this.db.updateUserLastLogin(user.id);

    // Generate JWT Tokens
    const payload = {
      sub: user.id,
      iqamaId: user.iqamaId,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign({ sub: user.id }, { expiresIn: '7d' });

    // Log to Audit Log
    await this.db.createAuditLog({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      detailsJson: { iqamaId },
    });

    // Remove password hash from user response
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as { passwordHash?: string }).passwordHash;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  // Resend OTP
  async resendOtp(
    dto: ResendOtpDto,
  ): Promise<{ message: string; cooldownRemaining: number; mockOtp?: string }> {
    const { iqamaId } = dto;

    await this.checkLockout(iqamaId);

    const user = await this.db.findUserByIqamaId(iqamaId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid request.');
    }

    // Check resend cooldown
    const cooldown = await this.redis.get(`cooldown:${iqamaId}`);
    if (cooldown) {
      const remaining = Math.round((parseInt(cooldown) - Date.now()) / 1000);
      throw new ForbiddenException(
        `Please wait ${remaining > 0 ? remaining : 0} seconds before requesting a new code.`,
      );
    }

    // Generate and send new OTP
    const otp = this.generateOtp();
    const hashedOtp = bcrypt.hashSync(otp, 10);

    await this.redis.set(`otp:${iqamaId}`, hashedOtp, 300);
    await this.redis.set(
      `cooldown:${iqamaId}`,
      (Date.now() + 60000).toString(),
      60,
    );

    await this.sms.sendSms(
      user.phoneNumber,
      `Your new MasahaDesk verification code is: ${otp}. Valid for 5 minutes.`,
    );

    // Log to Audit
    await this.db.createAuditLog({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'LOGIN_OTP_RESENT',
      detailsJson: { iqamaId },
    });

    return {
      message: 'New verification code sent via SMS.',
      cooldownRemaining: 60,
      mockOtp: otp,
    };
  }

  // Refresh access token
  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = this.jwt.verify(refreshToken) as unknown as {
        sub: string;
      };
      const user = await this.db.findUserById(decoded.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User is inactive or does not exist.');
      }

      const payload = {
        sub: user.id,
        iqamaId: user.iqamaId,
        role: user.role,
        tenantId: user.tenantId,
      };

      const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }

  // Generate a cryptographically secure-looking random 6-digit number
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
