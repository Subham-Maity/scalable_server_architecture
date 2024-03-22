import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto } from './dto';
import { PasswordHash, RtTokenService } from './encrypt';
import { TokenService } from './token';
import { Response } from 'express';
import { ConfigId } from '../types';
import { clearCookie, cookieOptionsAt, cookieOptionsRt, setCookie } from '../common';
import { asyncErrorHandler } from '../errors';
import { RequestWithUser } from './type';
import { ConfigService } from '@nestjs/config';
import { generateOTP, OTPConfig } from './otp';
import { JwtSignService, JwtVerifyService } from './jwt';
import { Mail0AuthService, MailService } from '../mail';
import { PrismaService } from '../prisma';

@Injectable()
export class AuthService {
  private OTP: string | number;
  private resetSession: boolean;
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private tokenService: TokenService,
    private rtTokenService: RtTokenService,
    private jwtSignService: JwtSignService,
    private jwtVerifyService: JwtVerifyService,
    private mailService: MailService,
    private mail0AuthService: Mail0AuthService,
  ) {}

  /**Singup/Register - Local*/
  signupLocal = asyncErrorHandler(async (dto: AuthDto, res: Response): Promise<void> => {
    const hash = await PasswordHash.hashData(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash,
      },
    });
    const tokens = await this.tokenService.getTokens(user.id, user.email);
    await this.rtTokenService.updateRtHash(user.id, tokens.refresh_token);

    await this.mail0AuthService.sendMail0Auth(
      dto.email,
      'Welcome to Our Service',
      'register-email',
      {
        name: dto.email,
      },
    );

    // Set tokens in cookies
    setCookie(res, 'access_token', tokens.access_token, cookieOptionsAt);
    setCookie(res, 'refresh_token', tokens.refresh_token, cookieOptionsRt);

    // End the response
    res.end();
  });

  /**Singin/Login - Local*/
  signinLocal = asyncErrorHandler(async (dto: AuthDto, res: Response): Promise<void> => {
    //find user
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    //return error if user not found
    if (!user) {
      throw new NotFoundException('User not found');
    }
    //verify password
    const passwordMatches = await PasswordHash.verifyPassword(user.hash, dto.password);

    //return error if password does not match
    if (!passwordMatches) throw new ForbiddenException('Password does not match');

    //token created and returned
    const tokens = await this.tokenService.getTokens(user.id, user.email);
    await this.rtTokenService.updateRtHash(user.id, tokens.refresh_token);

    // Set tokens in cookies
    setCookie(res, 'access_token', tokens.access_token, cookieOptionsAt);
    setCookie(res, 'refresh_token', tokens.refresh_token, cookieOptionsRt);

    // End the response
    res.end();
  });

  /**Logout Local*/
  signoutLocal = asyncErrorHandler(async (userId: ConfigId, res: Response): Promise<void> => {
    // The 'updateMany' method is used instead of 'update' because 'update' only updates the first record it finds that matches the criteria.
    // In this case, if there are multiple records with the same 'userId' and a non-null 'refreshTokenHash', 'update' would only update one of them.
    // By using 'updateMany', we ensure that all matching records are updated, not just the first one found.
    // If the user clicks the logout button multiple times, the 'updateMany' function will still execute without errors,
    // but it won't change anything after the first click because the 'refreshTokenHash' is already null.
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        refreshTokenHash: {
          not: null,
        },
      },
      data: {
        refreshTokenHash: null,
      },
    });
    // Clear the cookies
    clearCookie(res, 'access_token');
    clearCookie(res, 'refresh_token');

    // End the response
    res.end();
  });

  /**Refresh Token*/
  refreshToken = asyncErrorHandler(
    async (userId: ConfigId, rt: string, res: Response): Promise<void> => {
      if (!userId) {
        throw new UnauthorizedException('User not found');
      }

      if (!rt) {
        throw new UnauthorizedException('Refresh token not found');
      }
      //find user by id
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      //return error if user not found or refresh token hash is null
      if (!user || !user.refreshTokenHash)
        throw new ForbiddenException('User not found or refresh token hash is null');

      //verify refresh token
      const rtMatches = await PasswordHash.verifyPassword(user.refreshTokenHash, rt);

      //return error if refresh token does not match
      if (!rtMatches) throw new ForbiddenException('Refresh token does not match');

      //token created
      const tokens = await this.tokenService.getTokens(user.id, user.email);

      //refresh token hash updated in the database
      await this.rtTokenService.updateRtHash(user.id, tokens.refresh_token);
      // Set tokens in cookies
      setCookie(res, 'access_token', tokens.access_token, cookieOptionsAt);
      setCookie(res, 'refresh_token', tokens.refresh_token, cookieOptionsRt);

      // End the response
      res.end();
    },
  );

  /**Reset Password*/
  //TODO: Redis Store the OTP
  //TODO: RATE LIMIT Based on Email or IP
  //TODO: MAIL
  //RESET PASSWORD WITH OLD PASSWORD
  //Purpose: reset link's token generation
  // Generate a password reset link

  resetPasswordRequest = asyncErrorHandler(async (email: string, res: Response): Promise<void> => {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const FrontendUrl =
      this.configService.get('PASSWORD_RESET_LINK_FRONTEND_URL') || 'http://localhost:3000';
    const JWT_SECRET = this.configService.get('PASSWORD_RESET_LINK_SECRET') || 'secret-key';
    const JWT_EXPIRES_IN = this.configService.get('PASSWORD_RESET_LINK_EXPIRES_IN') || '1m';
    const payload = { email: user.email, id: user.id };
    const token = this.jwtSignService.sign(payload, JWT_SECRET, JWT_EXPIRES_IN);
    const config_otp: OTPConfig = {
      length: 6,
      type: 'string',
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      digits: true,
      specialChars: false,
    };
    this.OTP = generateOTP(config_otp);
    const pass_reset_link = `${FrontendUrl}/reset-password/${user.id}/${token}`;
    //TODO: Email the reset link
    console.log(pass_reset_link);
    // res.status(200).send({ msg: 'Password reset link has been sent.' });
    res.status(200).send({ code: this.OTP, token: `${token}` });
  });

  //Purpose: Verify the otp and token
  verifyOTP = asyncErrorHandler(
    async (code: string, token: string, res: Response): Promise<void> => {
      const payload = await this.validateToken(token);
      const user = await this.prisma.user.findUnique({
        where: {
          email: payload.email,
          id: payload.id,
        },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const email: string = user.email;
      if (this.OTP === code) {
        this.OTP = null;
        this.resetSession = true;
      } else {
        throw new ForbiddenException('Invalid OTP');
      }
      res.status(201).json({
        message: 'OTP verified successfully!',
        email,
        token,
      });
    },
  );

  //Purpose: reset link's token validation
  // Validate token for password reset
  validateToken = asyncErrorHandler(
    async (token: string): Promise<{ email: string; id: ConfigId }> => {
      const JWT_SECRET = this.configService.get('PASSWORD_RESET_LINK_SECRET') || 'secret-key';
      let payload: { email: string; id: ConfigId };
      try {
        payload = this.jwtVerifyService.verify(token, JWT_SECRET);
      } catch (error) {
        throw new UnauthorizedException('Invalid token');
      }
      return payload;
    },
  );

  //Purpose: reset session checks and reset local variables
  localVariables = asyncErrorHandler(async (): Promise<void> => {
    this.OTP = null;
    this.resetSession = false;
  });

  //Purpose: reset password
  resetPassword = asyncErrorHandler(
    async (dto: AuthDto, token: string, res: Response): Promise<void> => {
      if (!this.resetSession) {
        throw new ForbiddenException('Session expired!');
      }

      const payload = await this.validateToken(token);

      if (payload.email !== dto.email) {
        throw new ForbiddenException('Invalid token');
      }

      const user = await this.prisma.user.findUnique({
        where: {
          email: payload.email,
          id: payload.id,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const hashedPassword = await PasswordHash.hashData(dto.password);

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          hash: hashedPassword,
        },
      });

      await this.localVariables();

      res.status(200).send({ msg: 'Your password has been updated!' });
    },
  );

  /**Check User*/
  checkUser(req: RequestWithUser): { id: ConfigId } {
    if (!req.user || !req.user.sub) {
      throw new UnauthorizedException();
    }
    return { id: req.user.sub };
  }
}
