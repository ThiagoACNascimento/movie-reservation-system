import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { HashingService } from '../../infra/crypt/hashing/hashing.service';
import { SignUpDto } from './dtos/sign-up.dto';
import { LoginDto } from './dtos/log-in.dto';
import { User } from '../../generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly hashService: HashingService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<User> {
    // TODO: add all business rule from userService.create
    return this.userService.create(signUpDto);
  }

  async logIn(loginDto: LoginDto) {
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

    // TODO: add jwt and cookies
    return true;
  }
}
