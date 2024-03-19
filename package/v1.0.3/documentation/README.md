# V1.0.3 - Step by Step Guide

> **Written By**: [ﾒΛM](https://github.com/Subham-Maity)

## [Implementing Cookie Setup Commit](https://github.com/Subham-Maity/scalable_server_architecture/commit/e8487d981e8fa824360239a27a26077ca8568cf7?diff=split&w=1)

### Step 1 - Setup Cookie Parser

1. First install the following package
```bash
yarn add cookie-parser
```

2. Open you `main.ts` file and add the following code
```ts
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  await app.listen(3000);
}

bootstrap();
```

3. Make sure in `app.module.ts` file you have the following code
```ts
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/config';
import { AtGuard } from './auth/guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,
    UserModule,
    PrismaModule,
  ],
  //purpose: add AtGuard to the global guard list
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,//AtGuard is the global guard
    },
  ],
})
export class AppModule {}

```
> Global Guard is used to protect all the routes in the application. It is used to protect the routes that are not protected by the local guard.

### Step 2 - Cookie Configuration (Optional)

1. Optional: you can do this step if you want to configure the cookie separately.

2. Make a file name `cookie.ts` in the `common` folder and add the following code

```ts

import { Response } from 'express';

export const setCookie = (
  res: Response,
  name: string,
  value: string,
  cookieOptions: Record<string, any> = {},
) => {
  res.cookie(name, value, {
    ...cookieOptions,
  });
};

export function clearCookie(res: Response, name: string) {
  res.clearCookie(name);
}
```
> You can directly use the `res.cookie` and `res.clearCookie` method to set and clear the cookie. But if you want to add some extra configuration to the cookie, then you can use the `setCookie` and `clearCookie` method.


### Step 3—Using Cookie

1. First make a cookie option for access token & refresh token in the `auth` module.

```ts
import { CookieOptions } from 'express';

export const cookieOptionsAt: CookieOptions = {
  expires: new Date(Date.now() + 15 * 60 * 1000),
  httpOnly: true,
  secure: true,
  sameSite: 'none',
};

export const cookieOptionsRt: CookieOptions = {
  expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  httpOnly: true,
  secure: true,
  sameSite: 'none',
};
```
2. Auth Controller

```ts

import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { RtGuard } from './guard';
import { GetCurrentUser, GetCurrentUserId } from './decorator';
import { Public } from '../common/decorator';
import { ConfigId } from '../types';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('🔐 Authentication')
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
   * @param res
   */
  @Public()
  @Post('/local/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiCreatedResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: 'application/text',
  })
  @ApiBadRequestResponse({ status: 400, description: 'Bad Request: Invalid data.' })
  @ApiBody({ type: AuthDto, description: 'The user information' })
  signupLocal(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response): Promise<void> {
    return this.authService.signupLocal(dto, res);
  }

  /** POST: http://localhost:3333/auth/local/signin
   "email": "subham@gmail.com",
   "password": "Codexam@123",
   }
   * @param dto
   * @param res
   */
  @Public()
  @Post('/local/signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in an existing user' })
  @ApiOkResponse({
    status: 200,
    description: 'The user has been successfully signed in.',
    type: 'application/text',
  })
  @ApiBadRequestResponse({ status: 400, description: 'Bad Request: Invalid data.' })
  @ApiUnauthorizedResponse({ status: 403, description: 'Unauthorized: Password does not match.' })
  @ApiBody({ type: AuthDto, description: 'The user credentials' })
  signinLocal(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response): Promise<void> {
    return this.authService.signinLocal(dto, res);
  }

  /** POST: http://localhost:3333/auth/local/signout
   bearer token: {access token}
   }
   * It will set the `refreshTokenHash` to null in the database.
   * @param userId
   * @param res
   */
  @Post('/local/signout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out the current user' })
  @ApiOkResponse({
    status: 200,
    description: 'The user has been successfully signed out.',
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  logout(
    @GetCurrentUserId() userId: ConfigId,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    return this.authService.signoutLocal(userId, res);
  }
  /** POST: http://localhost:3333/auth/refresh
   bearer token: {refresh token}
   }
   * It will return a new access token and refresh token.
   * @param userId
   * @param refreshToken
   * @param res
   */

  //if we don't use public decorator,
  //then it will ask for AtGuard instead of RtGuard
  //Purpose: @Public() here - bypass the access token check
  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh the tokens of the current user' })
  @ApiOkResponse({
    status: 200,
    description: 'The tokens have been successfully refreshed.',
    type: 'application/text',
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  refreshTokens(
    @GetCurrentUserId() userId: ConfigId,
    @GetCurrentUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    return this.authService.refreshToken(userId, refreshToken, res);
  }
}
```
- Here I just add the `@Res({ passthrough: true }) res: Response` to the method parameter. This will allow us to set the cookie from the controller.


3. Auth Service

```ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import { asyncErrorHandler } from '../errors/async-error-handler';
import { PasswordHash, RtTokenService } from './encrypt';
import { TokenService } from './token';
import { Response } from 'express';
import { ConfigId } from '../types';
import { clearCookie, setCookie } from '../common/cookie/cookie';
import { cookieOptionsAt, cookieOptionsRt } from '../common/cookie/cookie-options';

@Injectable()
export class AuthService {
  /**Singup - Local*/
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

    // Set tokens in cookies
    res.cookie('access_token', tokens.access_token, { httpOnly: true });
    res.cookie('refresh_token', tokens.refresh_token, { httpOnly: true });

    // End the response
    res.end();
  });

  /**Singin - Local*/
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
      res.cookie('access_token', tokens.access_token, { httpOnly: true });
      res.cookie('refresh_token', tokens.refresh_token, { httpOnly: true });

      // End the response
      res.end();
    },
  );

  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private rtTokenService: RtTokenService,
  ) {}
}
```

- Here I just add the `res: Response` to the method parameter. This will allow us to set the cookie from the service.
- I also add the `cookieOptionsAt` and `cookieOptionsRt` to the method parameter. This will allow us to set the cookie from the service.
- I also add the `setCookie` and `clearCookie` method to set and clear the cookie.

### Step 4—Decorators

1. `GetCurrentUserId` Decorator

```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../type';
import { ConfigId } from '../../../types';
import { JwtService } from '@nestjs/jwt';

export const GetCurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): ConfigId => {
    const request = context.switchToHttp().getRequest();
    const jwtService = new JwtService({ secret: process.env.JWT_LOCAL_AT_SECRET });
    const token = request.cookies['access_token'];
    const payload = jwtService.verify<JwtPayload>(token);
    return payload.sub;
  },
);
```
- Here I just add the `request.cookies['access_token']` to get the access token from the cookie. This will allow us to get the access token from the cookie.
- I also add the `JwtService` to verify the access token. This will allow us to verify the access token from the cookie.
- I also add the `JwtPayload` to get the user id from the access token. This will allow us to get the user id from the access token.

### Step 5—Guards

1. `AtGuard` Guard

`old`

```ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  //Purpose: Everytime you see something with public, please don't check for access token
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    return super.canActivate(context);
  }
}
```

Change it to

```ts
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

// at.guard.ts
@Injectable()
export class AtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = request.cookies['access_token'];

    if (!token) {
      throw new UnauthorizedException();
    }

    return super.canActivate(context);
  }
}
```



