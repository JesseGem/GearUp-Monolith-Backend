import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import {
  Throttle,
  minutes,
} from '@nestjs/throttler';

import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Throttle({
    default: {
      limit: 5,
      ttl: minutes(15),
    },
  })
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(
      loginDto.email,
      loginDto.password,
    );
  }
}