import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './user.entity';
import { Role } from '../role/role.entity';
import { JwtStrategy } from './jwt.strategy';
import { ScheduledTasksService } from './scheduled-tasks.service';
import { ConfigModule } from '../config/module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    PassportModule,
    JwtModule.register({
      secret: 'knowledge_base_secret_key',
      signOptions: { expiresIn: '24h' },
    }),
    ConfigModule,
  ],
  providers: [AuthService, JwtStrategy, ScheduledTasksService],
  controllers: [AuthController],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}