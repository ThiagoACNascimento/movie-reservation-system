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
import { CookieAuthData } from './interfaces/cookie-data.interface';
import { RefreshTokenStorage } from './refresh/refresh-token.storage';
import { randomBytes } from 'crypto';
import { InvalidRefreshTokenError } from '../../infra/errors/invalid-refresh-token.error';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly hashService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfigs: ConfigType<typeof jwtConfig>,
    private readonly refreshStorage: RefreshTokenStorage,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<User> {
    // TODO: add all business rule from userService.create
    return this.userService.create(signUpDto);
  }

  async logIn(loginDto: LoginDto): Promise<CookieAuthData> {
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

    return await this.createTokens(foundUser);
  }

  async refresh(refreshToken: string) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
        Pick<AuthUserData, 'sub'> & { refreshTokenId: string }
      >(refreshToken, {
        secret: this.jwtConfigs.secret,
        audience: this.jwtConfigs.audience,
        issuer: this.jwtConfigs.issuer,
      });

      const user = await this.userService.findOne(sub);

      await this.refreshStorage.validate(user.id, refreshTokenId);
      await this.refreshStorage.invalidate(user.id);

      return await this.createTokens(user);
    } catch (error) {
      if (error instanceof InvalidRefreshTokenError) {
        throw new UnauthorizedException('Access denied');
      }

      throw new UnauthorizedException();
    }
  }

  async logout(refreshToken: string) {
    const { sub } = await this.jwtService.verifyAsync<
      Pick<AuthUserData, 'sub'>
    >(refreshToken, {
      secret: this.jwtConfigs.secret,
      audience: this.jwtConfigs.audience,
      issuer: this.jwtConfigs.issuer,
    });

    const user = await this.userService.findOne(sub);

    await this.refreshStorage.invalidate(user.id);
  }

  private async createTokens(user: User) {
    const refreshTokenId = randomBytes(32).toString('hex');
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<AuthUserData>>(
        user.id,
        this.jwtConfigs.accessTokenTtl,
        { email: user.email, role: user.role },
      ),
      this.signToken(user.id, this.jwtConfigs.refreshTokenTtl, {
        refreshTokenId: refreshTokenId,
      }),
    ]);
    await this.refreshStorage.create(user.id, refreshTokenId);
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
