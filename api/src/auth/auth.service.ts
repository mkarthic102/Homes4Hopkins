import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDTO } from 'src/user/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOne(email);
    if (user) {
      if (!user.isEmailVerified) {
        throw new BadRequestException('Email is not verified');
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        delete user.password;
        return user;
      }
    }
    return null;
  }

  async login(user: UserResponseDTO) {
    const payload = {
      email: user.email,
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      bio: user.bio,
      notifications: user.notifications,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
