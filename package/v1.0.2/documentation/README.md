# V1.0.2 - Step by Step Guide

> **Written By**: [ﾒΛM](https://github.com/Subham-Maity)

## [Implementing Swagger Commit](https://github.com/Subham-Maity/scalable_server_architecture/commit/018c896ebccbe4defa61872519bc1c9d95ebc607#diff-74b59db8484a4dee2448440a5d2f8e439f2d2230f2dc08d133f5b42e13120937)
### 1. Swagger Setup 

- Install the following packages
```bash
yarn add @nestjs/swagger swagger-ui-express
```
### 2. Swagger Configuration

- `swagger` folder contains `swagger.config.ts` file and `swagger.setup.ts` file.

`swagger.setup.ts`

```ts
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './swagger.config';

export function setupSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle(swaggerConfig.title)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .addServer(swaggerConfig.localUrl, swaggerConfig.localDescription)
    .addServer(swaggerConfig.stagingUrl, swaggerConfig.stagingDescription)
    .addServer(swaggerConfig.productionUrl, swaggerConfig.productionDescription)
    .setLicense(swaggerConfig.license.name, swaggerConfig.license.url)
    .setContact(swaggerConfig.contact.name, swaggerConfig.contact.url, swaggerConfig.contact.email)
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'Token' }, 'access_token')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);
}
```

`swagger.config.ts`

```ts
export const swaggerConfig = {
  title: 'THIS APP OWNED BY SUBHAM MAITY',
  description: 'THIS APP IS MADE FOR:',
  version: '1.0.0',
  localUrl: 'http://localhost:3333',
  localDescription: 'Local server (development)',
  stagingUrl: 'https://staging-api.com',
  stagingDescription: 'Staging server (testing)',
  productionUrl: 'https://api.com',
  productionDescription: 'Production server (live)',
  authorName: 'SUBHAM MAITY',
  contact: {
    name: 'SUBHAM MAITY',
    url: 'https://github.com/Subham-Maity',
    email: 'maitysubham4041@gmail.com',
  },
  license: {
    name: 'MIT',
    url: 'https://opensource.org/licenses/MIT',
  },
};
```

- In main.ts file, import the `setupSwagger` function and call it.

```ts
import { setupSwagger } from './swagger';

setupSwagger(app);
```


### 3. Swagger Decorators Use 

#### 3.1. DTO

```ts
//Auth DTO

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { IsDifferentFrom } from '../../common/decorator';

export class SigninDto {
    
  //Swagger Decorators Use  
  @ApiProperty({
    description: 'The email of the user.',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail({}, { message: 'Invalid email format.' })
  @IsNotEmpty({ message: 'Email is required.' })
  @IsString({ message: 'Email must be a string.' })
  email: string;

  //Swagger Decorators Use
  @ApiProperty({
    description: 'The password of the user.',
    example: 'Password123!',
    required: true,
  })
  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(8, { message: 'Password is too short. It should be at least 8 characters.' })
  @MaxLength(100, { message: 'Password is too long. It should be at most 100 characters.' })
  @Matches(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/, {
    message: 'Password must contain at least one special character.',
  })
  @Matches(/[a-zA-Z]/, { message: 'Password can only contain Latin letters.' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
  @Matches(/[0-9]+/, { message: 'Password must contain at least one number.' })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, {
    message: 'Password must contain at least one special character.',
  })
  @IsDifferentFrom('email', { message: 'Email and password must be different.' })
  password: string;
}
``` 
#### 3.2. Controller

```ts
//Auth Controller

import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from './dto';
import { RtGuard } from './guard';
import { Tokens } from './type';
import { GetCurrentUser, GetCurrentUserId } from './decorator';
import { Public } from '../common/decorator';
import { ConfigId } from '../types';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
   */
  @Public()
  @Post('/local/signup')
  @HttpCode(HttpStatus.CREATED)
  
  //:-__Swagger Decorators Use__From_Here
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiCreatedResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: 'application/text',
  })
  @ApiBadRequestResponse({ status: 400, description: 'Bad Request: Invalid data.' })
  @ApiBody({ type: SigninDto, description: 'The user information' })
  //:-__Swagger Decorators Use__From_End
  signupLocal(@Body() dto: SigninDto): Promise<Tokens> {
    return this.authService.signupLocal(dto);
  }

  /** POST: http://localhost:3333/auth/local/signin
   "email": "subham@gmail.com",
   "password": "Codexam@123",
   }
   * @param dto
   */
  @Public()
  @Post('/local/signin')
  @HttpCode(HttpStatus.OK)
  //:-__Swagger Decorators Use__From_Here
  @ApiOperation({ summary: 'Sign in an existing user' })
  @ApiOkResponse({
    status: 200,
    description: 'The user has been successfully signed in.',
    type: 'application/text',
  })
  @ApiBadRequestResponse({ status: 400, description: 'Bad Request: Invalid data.' })
  @ApiUnauthorizedResponse({ status: 403, description: 'Unauthorized: Password does not match.' })
  @ApiBody({ type: SigninDto, description: 'The user credentials' })
  //:-__Swagger Decorators Use__From_End
  signinLocal(@Body() dto: SigninDto): Promise<Tokens> {
    return this.authService.signinLocal(dto);
  }

  /** POST: http://localhost:3333/auth/local/logout
   bearer token: {access token}
   }
   * It will set the `refreshTokenHash` to null in the database.
   * @param userId
   */
  @Post('/local/signout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  //:-__Swagger Decorators Use__From_Here
  @ApiOperation({ summary: 'Sign out the current user' })
  @ApiOkResponse({
    status: 200,
    description: 'The user has been successfully signed out.',
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  //:-__Swagger Decorators Use__From_End
  logout(@GetCurrentUserId() userId: ConfigId): Promise<boolean> {
    return this.authService.signoutLocal(userId);
  }
  /** POST: http://localhost:3333/auth/refresh
   bearer token: {refresh token}
   }
   * It will return a new access token and refresh token.
   * @param userId
   * @param refreshToken
   */

  //if we don't use public decorator,
  //then it will ask for AtGuard instead of RtGuard
  //Purpose: @Public() here - bypass the access token check
  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  //:-__Swagger Decorators Use__From_Here
  @ApiOperation({ summary: 'Refresh the tokens of the current user' })
  @ApiOkResponse({
    status: 200,
    description: 'The tokens have been successfully refreshed.',
    type: 'application/text',
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized: No token provided.' })
  //:-__Swagger Decorators Use__From_End
  refreshTokens(
    @GetCurrentUserId() userId: ConfigId,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshToken(userId, refreshToken);
  }
}
```     