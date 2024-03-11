import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { AST } from 'eslint';
import Token = AST.Token;

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  /** POST: http://localhost:3333/auth/local/signin
   "email": "subham@gmail.com",
   "password": "Codexam@123",
   "firstName": "Subham",
   "lastName": "Maity",
   }
   * @param dto
   */
  @Post('/local/signup')
  @HttpCode(HttpStatus.CREATED)
  signupLocal(@Body() dto: AuthDto): Promise<Token> {
    return this.authService.signupLocal(dto);
  }

  /** POST: http://localhost:3333/auth/local/signin
   "email": "subham@gmail.com",
   "password": "Codexam@123",
   }
   * @param dto
   */
  @HttpCode(HttpStatus.OK)
  @Post('/local/signin')
  signinLocal(@Body() dto: AuthDto): Promise<Token> {
    return this.authService.signinLocal(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/local/logout')
  logout() {
    return this.authService.logoutLocal();
  }

  @HttpCode(HttpStatus.OK)
  @Post('/refresh')
  refreshToken() {
    return this.authService.refreshToken();
  }
}
