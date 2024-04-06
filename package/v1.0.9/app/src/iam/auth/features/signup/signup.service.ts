import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../prisma';
import { JwtSignService, JwtVerifyService } from '../../jwt';
import { BullService } from '../../../../queue/bull';
import { asyncErrorHandler } from '../../../../errors';
import { UserData } from '../../type';
import { SignupDto } from './dto';
import { PasswordHash } from '../../encrypt';
import { Response } from 'express';

@Injectable()
export class SignupService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private jwtSignService: JwtSignService,
    private jwtVerifyService: JwtVerifyService,
    private bullService: BullService,
  ) {}

  /**SingUp/Register - Local*/

  //Sing up a user
  signupLocal = asyncErrorHandler(async (dto: SignupDto): Promise<void> => {
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

  // Verify the token generated for the signup verification link
  verifyGeneratedSignupVerificationToken = asyncErrorHandler(async (token: string) => {
    const JWT_SECRET: string = this.configService.get('REGISTER_LINK_SECRET') || 'secret-key';
    const payload = this.jwtVerifyService.verify(token, JWT_SECRET);
    if (!payload) throw new NotFoundException('Invalid token');
    return payload;
  });
}
