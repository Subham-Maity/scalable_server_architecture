import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { AST } from 'eslint';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
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

  /** POST: http://localhost:3333/auth/local/logout
   bearer token: {access token}
   }
   * It will set the `refreshTokenHash` to null in the database.
   * @param req
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('/local/logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: Request) {
    const user = req.user;
    return this.authService.logoutLocal(user['sub']);
  }
  /** POST: http://localhost:3333/auth/refresh
   bearer token: {refresh token}
   }
   * It will return a new access token and refresh token.
   * @param req
   */

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken(@Req() req: Request) {
    const user = req.user;
    return this.authService.refreshToken(user['sub'], user['refreshToken']);
  }
}
