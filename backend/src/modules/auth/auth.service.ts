import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;
    
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    
    if (existingUser) {
      throw new UnauthorizedException('用户已存在');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
    });
    
    await this.userRepository.save(user);
    return this.login({ username, password });
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const user = await this.userRepository.findOneBy({ username });
    
    // 先检查用户是否存在
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    
    // 再检查密码是否正确
    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('密码错误');
    }
    
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, username: user.username, email: user.email },
    };
  }
}