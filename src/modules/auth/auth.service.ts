import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { HashingService } from '../../infra/crypt/hashing/hashing.service';
import { SignUpDto } from './dtos/sign-up.dto';
import { LoginDto } from './dtos/log-in.dto';
import { User } from '../../generated/prisma/client';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { type ConfigType } from '@nestjs/config';
import { AuthUserData } from './interfaces/auth-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly hashService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfigs: ConfigType<typeof jwtConfig>,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<User> {
    // TODO: add all business rule from userService.create
    return this.userService.create(signUpDto);
  }

  async logIn(loginDto: LoginDto): Promise<Record<string, string>> {
    const foundUser = await this.userService.findOneByEmailWithPassword(
      loginDto.email,
    );

    if (!foundUser) {
      await this.hashService.compare(
        loginDto.password,
        '$2b$14$dFeBi2qYkZuYIGdQqkaNP.jQXzAkvvso.AcCTtNqDC7fVFKxAiWg2',
      );
      throw new UnauthorizedException(
        'Email or Password are incorrect, try again.',
      );
    }

    const isCorrectPassword = await this.hashService.compare(
      loginDto.password,
      foundUser.password,
    );

    if (!isCorrectPassword) {
      throw new UnauthorizedException(
        'Email or Password are incorrect, try again.',
      );
    }

    const accessToken = await this.signToken<Partial<AuthUserData>>(
      foundUser.id,
      this.jwtConfigs.accessTokenTtl,
      { email: foundUser.email, role: foundUser.role },
    );
    const refreshToken = await this.signToken(
      foundUser.id,
      this.jwtConfigs.refreshTokenTtl,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  private async signToken<T>(
    userId: string,
    expiresIn: number,
    payload?: T,
  ): Promise<string> {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      } as AuthUserData,
      {
        audience: this.jwtConfigs.audience,
        issuer: this.jwtConfigs.issuer,
        secret: this.jwtConfigs.secret,
        expiresIn,
      },
    );
  }
}
