import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DatabaseService, DbUser } from '../db/db.service';
import { UserRole } from '@masahadesk/shared-types';
import * as bcrypt from 'bcryptjs';

interface RequestWithUser {
  user?: {
    sub: string;
    tenantId: string;
    iqamaId: string;
    fullName: string;
    role: string;
  };
}

class CreateUserDto {
  fullName!: string;
  iqamaId!: string;
  phoneNumber!: string;
  role!: string;
  temporaryPassword?: string;
}

class UpdateUserDto {
  fullName?: string;
  phoneNumber?: string;
  role?: string;
  isActive?: boolean;
  password?: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly dbService: DatabaseService) {}

  private checkAdmin(req: RequestWithUser) {
    if (req.user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only administrators can manage users / يسمح للمسؤولين فقط بإدارة الحسابات',
      );
    }
  }

  @Get()
  async getUsers(@Req() req: RequestWithUser) {
    this.checkAdmin(req);
    const tenantId = req.user?.tenantId || '';
    const users = await this.dbService.getAllUsers(tenantId);
    return users.map((u: DbUser & { role: UserRole }) => ({
      id: u.id,
      fullName: u.fullName,
      iqamaId: u.iqamaId,
      phoneNumber: u.phoneNumber,
      role: u.role,
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    }));
  }

  @Post()
  async createUser(@Req() req: RequestWithUser, @Body() body: CreateUserDto) {
    this.checkAdmin(req);
    const tenantId = req.user?.tenantId || '';

    // Hash temporary password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(
      body.temporaryPassword || 'Password123',
      salt,
    );

    const user = await this.dbService.createUser({
      tenantId,
      fullName: body.fullName,
      iqamaId: body.iqamaId,
      phoneNumber: body.phoneNumber,
      passwordHash,
      isActive: true,
      roleName: body.role as UserRole,
    });

    return {
      id: user.id,
      fullName: user.fullName,
      iqamaId: user.iqamaId,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isActive: user.isActive,
    };
  }

  @Put(':id')
  async updateUser(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ) {
    this.checkAdmin(req);

    const updates: Partial<
      Omit<DbUser, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'roleId'>
    > & { roleName?: UserRole } = {};
    if (body.fullName !== undefined) updates.fullName = body.fullName;
    if (body.phoneNumber !== undefined) updates.phoneNumber = body.phoneNumber;
    if (body.role !== undefined) updates.roleName = body.role as UserRole;
    if (body.isActive !== undefined) updates.isActive = body.isActive;

    if (body.password && body.password.trim() !== '') {
      const salt = bcrypt.genSaltSync(10);
      updates.passwordHash = bcrypt.hashSync(body.password, salt);
    }

    const updated = await this.dbService.updateUser(id, updates);
    if (!updated) {
      throw new NotFoundException('User not found / المستخدم غير موجود');
    }

    return {
      id: updated.id,
      fullName: updated.fullName,
      iqamaId: updated.iqamaId,
      phoneNumber: updated.phoneNumber,
      role: updated.role,
      isActive: updated.isActive,
    };
  }

  @Patch(':id/deactivate')
  async deactivateUser(@Req() req: RequestWithUser, @Param('id') id: string) {
    this.checkAdmin(req);
    const updated = await this.dbService.updateUser(id, { isActive: false });
    if (!updated) {
      throw new NotFoundException('User not found / المستخدم غير موجود');
    }
    return { success: true };
  }

  @Delete(':id')
  async deleteUser(@Req() req: RequestWithUser, @Param('id') id: string) {
    this.checkAdmin(req);
    const deleted = await this.dbService.deleteUser(id);
    if (!deleted) {
      throw new NotFoundException('User not found / المستخدم غير موجود');
    }
    return { success: true };
  }
}
