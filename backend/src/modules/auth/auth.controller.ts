import { Controller, Post, Body, Put, UseGuards, Req, Get, Param, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Put('theme')
  @UseGuards(AuthGuard('jwt'))
  async updateTheme(@Req() req: Request, @Body() body: { theme: string }) {
    const userId = req.user['id'];
    return this.authService.updateTheme(userId, body.theme);
  }

  @Put('security-config')
  @UseGuards(AuthGuard('jwt'))
  async updateSecurityConfig(@Req() req: Request, @Body() body: { maxFailedAttempts?: number; lockDuration?: number; lockDurationUnit?: string }) {
    const userId = req.user['id'];
    return this.authService.updateSecurityConfig(userId, body);
  }

  @Put('users/security-config')
  @UseGuards(AuthGuard('jwt'))
  async updateUsersSecurityConfig(@Req() req: Request, @Body() body: { userIds: number[]; maxFailedAttempts?: number; lockDuration?: number; lockDurationUnit?: string }) {
    const adminId = req.user['id'];
    const adminUsername = req.user['username'];
    return this.authService.updateUsersSecurityConfig(body.userIds, body, adminId, adminUsername);
  }

  @Get('users')
  @UseGuards(AuthGuard('jwt'))
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Get('users/:id')
  @UseGuards(AuthGuard('jwt'))
  async getUser(@Param('id') id: number) {
    return this.authService.getUser(id);
  }

  @Get('users/me')
  @UseGuards(AuthGuard('jwt'))
  async getCurrentUser(@Req() req: Request) {
    const userId = req.user['id'];
    return this.authService.getUser(userId);
  }

  @Put('users/:id/role')
  @UseGuards(AuthGuard('jwt'))
  async updateUserRole(@Param('id') id: number, @Body() body: { roleId: number | null }) {
    return this.authService.updateUserRole(id, body.roleId);
  }

  @Put('users/:id')
  @UseGuards(AuthGuard('jwt'))
  async updateUser(@Param('id') id: number, @Body() body: { email?: string; password?: string; currentPassword?: string }) {
    return this.authService.updateUserInfo(id, body);
  }

  @Post('users/:id/reset-password')
  @UseGuards(AuthGuard('jwt'))
  async resetPassword(@Param('id') id: number, @Req() req: Request) {
    const adminId = req.user['id'];
    const adminUsername = req.user['username'];
    return this.authService.resetPassword(id, adminId, adminUsername);
  }

  @Post('users/:id/lock')
  @UseGuards(AuthGuard('jwt'))
  async lockUser(@Param('id') id: number, @Req() req: Request) {
    const adminId = req.user['id'];
    const adminUsername = req.user['username'];
    return this.authService.lockUser(id, adminId, adminUsername);
  }

  @Post('users/:id/unlock')
  @UseGuards(AuthGuard('jwt'))
  async unlockUser(@Param('id') id: number, @Req() req: Request) {
    const adminId = req.user['id'];
    const adminUsername = req.user['username'];
    return this.authService.unlockUser(id, adminId, adminUsername);
  }

  @Put('menu-order')
  @UseGuards(AuthGuard('jwt'))
  async updateMenuOrder(@Req() req: Request, @Body() body: { menuOrder: string[] }) {
    const userId = req.user['id'];
    return this.authService.updateMenuOrder(userId, body.menuOrder);
  }

  @Delete('users/:id')
  @UseGuards(AuthGuard('jwt'))
  async deleteUser(@Param('id') id: number) {
    return this.authService.deleteUser(id);
  }

  @Post('users')
  @UseGuards(AuthGuard('jwt'))
  async createUser(@Body() body: { username: string; email: string; password: string; roleId?: number }) {
    return this.authService.createUser(body.username, body.email, body.password, body.roleId);
  }
}
