import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../../entities/user.entity';
import { UserService } from '../../../services/user/user.service';
import { LoginDto } from 'src/Dtos/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  private async validateUser({email, password}: LoginDto): Promise<User | null> {
    const user = await this.userService.findOneByEmail(email);
    if (user && (await user.comparePassword(password))) {
      return user;
    }
    return null;
  }

  public async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}