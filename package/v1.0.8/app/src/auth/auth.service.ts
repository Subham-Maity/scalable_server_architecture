import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
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
import { RequestWithUser, UserData } from './type';
import { ConfigService } from '@nestjs/config';
import { generateOTP, OTPConfig } from './otp';
import { JwtSignService, JwtVerifyService } from './jwt';
import { PrismaService } from '../prisma';
import { BullService } from '../queue/bull';
import { RedisService } from '../redis';
import { auth_otp_key_prefix_for_redis } from './constant';

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
    private bullService: BullService,
    private readonly otpService: RedisService,
  ) {}

  /**Global*/
  //Use in Singing
  checkIfUserDeletedByEmail = async (email: string) => {
    const user = await this.prisma.user.findUnique({ where: { email: email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.deleted) {
      throw new UnauthorizedException('This account has been deleted.');
    }
    return user;
  };
  //Use in Change Password
  checkIfUserDeletedByUserId = async (userId: ConfigId) => {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.deleted) {
      throw new UnauthorizedException('This account has been deleted.');
    }
    return user;
  };

  /**SingUp/Register - Local*/
  // Generates token for the signup verification link
  generateSignupVerificationToken = asyncErrorHandler(async (user: UserData) => {
    const JWT_SECRET: string = this.configService.get('REGISTER_LINK_SECRET') || 'secret-key';
    const JWT_EXPIRES_IN: string = this.configService.get('REGISTER_LINK_EXPIRES_IN') || '1m';
    return this.jwtSignService.sign(user, JWT_SECRET, JWT_EXPIRES_IN);
  });
  //Generate a verification link for the user
  generateSignupVerificationLink = asyncErrorHandler(async (user: UserData) => {
    const verificationToken = await this.generateSignupVerificationToken(user);
    const CLIENT_APP_URL: string = this.configService.get<string>('REGISTER_LINK_FRONTEND_URL');
    if (!CLIENT_APP_URL) throw new InternalServerErrorException('Client app url not found!');
    return `${CLIENT_APP_URL}/auth/verify-account/${verificationToken}`;
  });

  // Verify the token generated for the signup verification link
  verifyGeneratedSignupVerificationToken = asyncErrorHandler(async (token: string) => {
    const JWT_SECRET: string = this.configService.get('REGISTER_LINK_SECRET') || 'secret-key';
    const payload = this.jwtVerifyService.verify(token, JWT_SECRET);
    if (!payload) throw new NotFoundException('Invalid token');
    return payload;
  });

  signupLocal = asyncErrorHandler(async (dto: AuthDto): Promise<void> => {
    const hash = await PasswordHash.hashData(dto.password);
    const user = {
      email: dto.email,
      hash,
    };
    const verificationLink = await this.generateSignupVerificationLink(user);
    await this.bullService.addJob({
      type: 'mail',
      data: {
        email: dto.email,
        subject: 'Verify your account!',
        template: './auth/signin/register-email',
        context: {
          name: dto.email,
          validation: verificationLink,
        },
      },
    });
  });
  // This will create the user if user email is not present in the database
  activateUser = asyncErrorHandler(async (token: string, res: Response): Promise<void> => {
    const payload = await this.verifyGeneratedSignupVerificationToken(token);
    const { email, hash } = payload;

    // Check if the user's email already exists in the database
    const existUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existUser) {
      throw new BadRequestException('User already exist with this email!');
    }
    // Create the user in the database
    await this.prisma.user.create({
      data: {
        email,
        hash,
      },
    });

    await this.bullService.addJob({
      type: 'mail',
      data: {
        email: payload.email,
        subject: 'Thanks for register!',
        template: './auth/signin/welcome',
        context: {
          name: payload.email,
        },
      },
    });
    // Redirect the user to the login page
    res.redirect('/login');
  });

  /**SingIn/Login - Local*/
  signinLocal = asyncErrorHandler(async (dto: AuthDto, res: Response): Promise<void> => {
    //find user
    const user = await this.checkIfUserDeletedByEmail(dto.email);

    //verify password
    const passwordMatches = await PasswordHash.verifyPassword(user.hash, dto.password);

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
  generateResetPasswordRequestToken = asyncErrorHandler(
    async (user: UserData, JWT_SECRET: string, JWT_EXPIRES_IN: string) => {
      const payload = { email: user.email, id: user.id };
      const token = this.jwtSignService.sign(payload, JWT_SECRET, JWT_EXPIRES_IN);
      if (!token)
        throw new InternalServerErrorException('Something went wrong while generating the token');
      return token;
    },
  );

  // Generate Reset Password Verification Link
  generateResetPasswordVerificationLink = asyncErrorHandler(async (user: UserData) => {
    const JWT_SECRET: string = this.configService.get('PASSWORD_RESET_LINK_SECRET') || 'secret-key';
    const JWT_EXPIRES_IN: string = this.configService.get('PASSWORD_RESET_LINK_EXPIRES_IN') || '1m';
    return await this.generateResetPasswordRequestToken(user, JWT_SECRET, JWT_EXPIRES_IN);
  });

  //Return the password reset link with otp
  returnPasswordResetLinkWithOtp = asyncErrorHandler(async (user: UserData) => {
    const verificationToken = await this.generateResetPasswordVerificationLink(user);
    const FrontendUrl = this.configService.get<string>('PASSWORD_RESET_LINK_FRONTEND_URL');
    if (!FrontendUrl) throw new InternalServerErrorException('Frontend url not found!');
    const config_otp: OTPConfig = {
      length: 6,
      type: 'string',
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      digits: true,
      specialChars: false,
    };
    this.OTP = generateOTP(config_otp);
    const expirationInSeconds = 300;
    const key = `${auth_otp_key_prefix_for_redis}${user.email}`;
    const value = this.OTP;
    await this.otpService.set(key, value, expirationInSeconds);
    const pass_reset_link = `${FrontendUrl}/auth/reset-password/${user.id}/${verificationToken}`;
    return { code: this.OTP, link: `${pass_reset_link}` };
  });

  // Reset Password Request
  resetPasswordRequest = asyncErrorHandler(async (email: string): Promise<void> => {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('User not found');

    const { code, link } = await this.returnPasswordResetLinkWithOtp(user);

    await this.bullService.addJob({
      type: 'mail',
      data: {
        email: email,
        subject: 'Reset Password Link',
        template: './auth/reset-password/reset-password-link-code',
        context: {
          name: email,
          validation: link,
          otp: code,
        },
      },
    });
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
      const storedOtp = await this.otpService.get(`${auth_otp_key_prefix_for_redis}${email}`);
      if (storedOtp === code) {
        await this.otpService.del(`${auth_otp_key_prefix_for_redis}${email}`);
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

      await this.bullService.addJob({
        type: 'mail',
        data: {
          email: payload.email,
          subject: 'Password Changed',
          template: './auth/reset-password/password-changed',
          context: {
            name: payload.email,
          },
        },
      });

      res.status(200).send({ msg: 'Your password has been updated!' });
    },
  );
  /**Change Password*/
  changePassword = asyncErrorHandler(
    async (userId: ConfigId, oldPassword: string, newPassword: string) => {
      const user = await this.checkIfUserDeletedByUserId(userId);

      const oldPasswordMatches = await PasswordHash.verifyPassword(user.hash, oldPassword);

      if (!oldPasswordMatches) {
        throw new ForbiddenException('Incorrect old password');
      }

      const currentPasswordMatches = await PasswordHash.verifyPassword(user.hash, newPassword);

      if (currentPasswordMatches) {
        throw new BadRequestException('New password cannot be the same as the old password');
      }

      const hashedPassword = await PasswordHash.hashData(newPassword);

      try {
        await this.prisma.user.update({
          where: { id: userId },
          data: { hash: hashedPassword },
        });
      } catch (error) {
        throw new InternalServerErrorException(
          'Failed to update the password. Please try again later.',
        );
      }

      await this.bullService.addJob({
        type: 'mail',
        data: {
          email: user.email,
          subject: 'Now you changed your password',
          template: './auth/change-password/change-password',
          context: {
            name: user.email,
          },
        },
      });
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
