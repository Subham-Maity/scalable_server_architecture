import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { SignupService } from './signup.service';

import { Response } from 'express';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { RegisterResponse, VerifyAccountResponse } from './type';
import { SignupDto, VerifyAccountDto } from './dto';

@Resolver('Signup')
export class SignupResolver {
  constructor(private readonly signupService: SignupService) {}

  @Mutation(() => RegisterResponse)
  async registerUser(
    @Args('registerDto') registerDto: SignupDto,
  ): Promise<RegisterResponse> {
    try {
      await this.signupService.signupLocal(registerDto);
      return {
        message: `User ${registerDto.email} created successfully`,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        return {
          error: {
            message: error.message,
          },
        };
      } else {
        return {
          message: 'INTERNAL_SERVER_ERROR',
        };
      }
    }
  }

  @Mutation(() => VerifyAccountResponse)
  async verifyAccount(
    @Args('verifyAccountDto') verifyAccountDto: VerifyAccountDto,
    @Context('res') res: Response,
  ): Promise<VerifyAccountResponse> {
    try {
      await this.signupService.activateUser(verifyAccountDto.token, res);
      return {
        message: 'Account activated successfully',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        return {
          error: {
            message: error.message,
          },
        };
      } else {
        return {
          message: 'INTERNAL_SERVER_ERROR',
        };
      }
    }
  }
}
