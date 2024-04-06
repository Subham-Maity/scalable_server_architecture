import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../prisma';
import { JwtSignService, JwtVerifyService } from '../../jwt';
import { BullService } from '../../../../queue/bull';
import { RedisService } from '../../../../redis';
import { ConfigId } from '../../../../types';
import { asyncErrorHandler } from '../../../../errors';
import { UserData } from '../../type';
import { auth_otp_key_prefix_for_redis, auth_otp_ttl_for_redis } from '../../constant';
import { generateOTP, OTPConfig } from '../../otp';
import { PasswordHash } from '../../encrypt';

@Injectable()
export class PasswordService {
  private OTP: string | number;
  private resetSession: boolean;
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private jwtSignService: JwtSignService,
    private jwtVerifyService: JwtVerifyService,
    private bullService: BullService,
    private readonly otpService: RedisService,
  ) {}

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
    const expirationInSeconds = auth_otp_ttl_for_redis;
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
      let email: string = '';
      try {
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
        email = user.email; // Now assign the actual value to email
        const storedOtp = await this.otpService.get(`${auth_otp_key_prefix_for_redis}${email}`);
        if (storedOtp === code) {
          this.resetSession = true;
        } else {
          throw new ForbiddenException('Invalid OTP');
        }
        res.status(201).json({
          message: 'OTP verified successfully!',
          email,
          token,
        });
      } catch (error) {
        // If an error occurs, delete the OTP
        if (email) {
          await this.otpService.del(`${auth_otp_key_prefix_for_redis}${email}`);
        }
        throw error;
      }
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
    async (email: string, password: string, token: string, res: Response): Promise<void> => {
      if (!this.resetSession) {
        throw new ForbiddenException('Session expired!');
      }

      const payload = await this.validateToken(token);

      if (payload.email !== email) {
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

      const hashedPassword = await PasswordHash.hashData(password);

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
}
