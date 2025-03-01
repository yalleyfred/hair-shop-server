import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from 'src/services/user/user.service';
import { JwtStrategy } from 'src/services/jwt/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: 'your-secret-key', // Replace with a secure key
      signOptions: { expiresIn: '1h' }, // Token expiration
    }),
  ],
  providers: [AuthService, UserService, JwtStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
