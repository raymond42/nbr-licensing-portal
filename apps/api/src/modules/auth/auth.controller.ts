import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto, RegisterApplicantDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Authenticate with email/password; returns JWT access token' })
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Public applicant signup (inactive until an administrator activates the account)',
  })
  register(@Body() body: RegisterApplicantDto) {
    return this.authService.registerApplicant(body);
  }
}
