import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Missing authorization token.');
    }
    try {
      const payload = (await this.jwtService.verifyAsync(
        token,
      )) as unknown as Record<string, unknown>;
      const reqWithUser = request as Request & {
        user?: Record<string, unknown>;
      };
      reqWithUser.user = payload;
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired authorization token.',
      );
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
