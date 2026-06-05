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
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Put('theme')
  @UseGuards(AuthGuard('jwt'))
  async updateTheme(@Req() req: Request, @Body() body: { theme: string }) {
    const userId = req.user['id'];
    return this.authService.updateTheme(userId, body.theme);
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

  @Put('users/:id/role')
  @UseGuards(AuthGuard('jwt'))
  async updateUserRole(@Param('id') id: number, @Body() body: { roleId: number | null }) {
    return this.authService.updateUserRole(id, body.roleId);
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
