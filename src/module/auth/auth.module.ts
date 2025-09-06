import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from 'src/services/user/user.service';
import { JwtStrategy } from 'src/services/jwt/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback-secret-key-change-in-production',
        signOptions: { expiresIn: '1h' }, // Token expiration
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, UserService, JwtStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
