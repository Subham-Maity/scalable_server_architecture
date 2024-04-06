# V1.0.1 - Step by Step Guide

> **Written By**: [ﾒΛM](https://github.com/Subham-Maity)

- [1. MongoDB Setup](#1-mongodb-setup)
- [2. Auth Controller](#2-auth-controller)
- [3. Auth DTO](#3-auth-dto)
- [4. Auth Service](#4-auth-service)
  - [4.1 `signupLocal`](#41-signuplocal)
  - [4.2 `signinLocal`](#42-signinlocal)
  - [4.3 `signoutLocal`](#43-signoutlocal)
  - [4.4 `refreshToken`](#44-refreshtoken)
-  [5. Hashing Passwords with Argon2](#5-hashing-passwords-with-argon2)
-  [6. Token Service](#6-token-service)
-  [7. RtTokenService](#7-rttokenservice)
-  [8. AT & RT Strategy](#8-at--rt-strategy)
  - [8.1 `AtStrategy (Access Token Strategy)`]()
  - [8.2 `RtStrategy (Refresh Token Strategy)`]()
-  [9. AT & RT Guard](#9-at--rt-guard)
   - [9.1 `at.guard.ts`]()
   - [9.2 `rt.guard.ts`]()
-  [10. Decorator](#10-decorator)
   - [10.1 public.decorator.ts]()
   - [10.2 get-current-user.decorator.ts]()
   - [10.3 get-current-user-id.decorator.ts]()
- [11. Auth Module](#11-auth-module)



### 1. MongoDB Setup
> postgresql to mongodb migration guide
> 
- Change the provider from `postgresql` to `mongodb` in `schema.prisma` file.

- And because id is string so I need to change the type of id from `Int` to `String` in `schema.prisma` file also in all controllers and services.

⇨ **Check This Commit**: [**_Check Here The Difference_**](https://github.com/Subham-Maity/scalable_server_architecture/commit/8a4bbdb5b5bda9c55537287494ae78daafb04017?diff=split&w=1)
- **Note:** These are the all steps to change the database from postgresql to mongodb.

> Remain code you will understand when you follow the commits after [this commit](https://github.com/Subham-Maity/scalable_server_architecture/commit/8a4bbdb5b5bda9c55537287494ae78daafb04017?diff=split&w=1).

### 2. Auth Controller
- Singup (Register User)
- Singin (Login User)
- Signout(Logout User)
- refresh(Refresh Token)


```ts
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from './dto';
import { RtGuard } from './guard';
import { Tokens } from './type';
import { GetCurrentUser, GetCurrentUserId } from './decorator';
import { Public } from '../common/decorator';
import { ConfigId } from '../types';

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
  @HttpCode(HttpStatus.OK)
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
  refreshTokens(
    @GetCurrentUserId() userId: ConfigId,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshToken(userId, refreshToken);
  }
}

```
- @HttpCode(HttpStatus.OK) - Status Code you can use it as per your requirement, for example, 200, 201, 204, 400, 401, 403, 404, 500, etc. here HttpStatus.OK is 200.
- SigninDto - Data Transfer Object - [Check Here](#3-auth-dto)
- @UseGuards() - This is provided by nestjs/common package, it is used to protect the route, here we are using RtGuard to protect the route. 
- RtGuard - [Check Here](#8-at--rt-strategy)
- @Public() - [Check Here](#101-publicdecoratorts)
- @GetCurrentUserId() - [Check Here](#103-get-current-user-iddecoratorts)
- @GetCurrentUser('refreshToken') - [Check Here](#102-get-current-userdecoratorts)

### 3. Auth DTO

```ts
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { IsDifferentFrom } from '../../common/decorator';

export class SigninDto {
    @IsEmail({}, { message: 'Invalid email format.' })
    @IsNotEmpty({ message: 'Email is required.' })
    @IsString({ message: 'Email must be a string.' })
    email: string;

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

- `email`: This property must be a non-empty string in a valid email format.
- `password`: This property must be a non-empty string with a length between 8 and 100 characters. It must contain at least one special character, one Latin letter, one uppercase letter, one lowercase letter, and one number. The password must be different from the email.

The `IsDifferentFrom` function is a custom decorator that checks if the value of the property where it's applied is different from another property's value.

`common/decorator/is-different-form.decorator.ts`
```ts
import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsDifferentFrom(property: string, validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'isDifferentFrom',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = args.object[relatedPropertyName];
          return value !== relatedValue;
        },
      },
    });
  };
}

```

> The `class-validator` package is used for applying various validation rules to the properties. If a validation rule is violated, a corresponding error message is returned. For example, if the `email` is not in a valid email format, the message 'Invalid email format.' Is returned. If the `password` does not contain at least one special character, the message 'Password must contain at least one special character.' Is returned, and so on. These messages help in providing clear feedback to the user about any input errors.


### 4. Auth Service

```ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SigninDto } from './dto';
import { asyncErrorHandler } from '../errors/async-error-handler';
import { PasswordHash } from './hash';
import { TokenService } from './token';
import { Tokens } from './type';
import { RtTokenService } from './hash/rt-hash.service';
import { ConfigId } from '../types';

@Injectable()
export class AuthService {
  /**Singup - Local*/
  signupLocal = asyncErrorHandler(async (dto: SigninDto): Promise<Tokens> => {
    const hash = await PasswordHash.hashData(dto.password);
    //user created
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash,
      },
    });
    //token created and returned
    const tokens = await this.tokenService.getTokens(user.id, user.email);
    //refresh token hash updated in the database
    await this.rtTokenService.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  });

  /**Singin - Local*/
  signinLocal = asyncErrorHandler(async (dto: SigninDto): Promise<Tokens> => {
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
    //refresh token hash updated in the database
    await this.rtTokenService.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  });

  /**Logout Local*/
  signoutLocal = asyncErrorHandler(async (userId: ConfigId): Promise<boolean> => {
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
    return true;
  });

  /**Refresh Token*/
  refreshToken = asyncErrorHandler(async (userId: ConfigId, rt: string): Promise<Tokens> => {
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

    //return tokens
    return tokens;
  });

  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private rtTokenService: RtTokenService,
  ) {}
}
```

#### 4.1 `signupLocal`

1.  Take the password from the user and hash it using the `PasswordHash.hashData` method.  

> This is under the `PasswordHash` class, which is a service that provides methods for hashing and verifying passwords. The `hashData` method takes a string and returns a hashed string. The `verifyPassword` method takes a hashed string and a plain string and returns a boolean value indicating whether the plain string matches the hashed string. [**Check Here**](#5-hashing-passwords-with-argon2)

2. Create a new user in the database with the email and hashed password.

> `prisma.user.create` - Here prisma.user is the model and create is the method to create a new user in the database.


3. Generate access and refresh tokens using the `TokenService.getTokens` method.

> The `TokenService` class provides methods for generating access and refresh tokens. The `getTokens` method takes a user ID and email and returns an object containing the access and refresh tokens. [**Check Here**](#6-token-service)

4. Update the refresh token hash in the database using the `RtTokenService.updateRtHash` method. 
> - Check Here: [**_RtTokenService_**](#7-rttokenservice) 
> - Purpose: The refresh token hash is stored in the database to associate the refresh token with the user. When the user requests a new access token using the refresh token, the server can verify the refresh token by comparing it with the stored hash.
> - The `RtTokenService` class provides a method for updating the refresh token hash in the database. The `updateRtHash` method takes a user ID and a refresh token and updates the `refreshTokenHash` field in the database according to the user ID.

5. Return the access and refresh tokens to the user.

#### 4.2 `signinLocal`

1. Find the user in the database using the email provided by the user. If the user is not found, return a `NotFoundException`.
2. Verify the password provided by the user with the hashed password stored in the database using the `PasswordHash.verifyPassword` method. If the passwords do not match, return a `ForbiddenException`.
> - Purpose: The `PasswordHash` class provides methods for hashing and verifying passwords. The `verifyPassword` method takes a hashed password and a plain password and returns a boolean value indicating whether the plain password matches the hashed password. [**Check Here**](#5-hashing-passwords-with-argon2)

3. Generate access and refresh tokens using the `TokenService.getTokens` method. 

4. Update the refresh token hash in the database using the `RtTokenService.updateRtHash` method.

5. Return the access and refresh tokens to the user.

#### 4.3 `signoutLocal`:

1. Update the `refreshTokenHash` field in the database to `null` for the user ID provided. This effectively logs the user out by removing the association between the user and the refresh token.

2. Return `true` to indicate that the user has been successfully logged out.

#### 4.4 `refreshToken`:

1. Find the user in the database using the user ID provided. If the user is not found or the `refreshTokenHash` is `null`, return a `ForbiddenException`.

2. Verify the refresh token provided by the user with the stored refresh token hash using the `PasswordHash.verifyPassword` method. If the refresh tokens do not match, return a `ForbiddenException`.

3. Generate new access and refresh tokens using the `TokenService.getTokens` method.

4. Update the refresh token hash in the database using the `RtTokenService.updateRtHash` method.

5. Return the new access and refresh tokens to the user.


### 5. Hashing Passwords with Argon2


> Argon2 is slightly better than bcrypt in terms of security and performance. It is the winner of the Password Hashing Competition in 2015. It is a memory-hard function that provides resistance against GPU and side-channel attacks. It is also resistant to trade-off attacks, which means that it is difficult to optimize the function for a specific attack scenario. Argon2 has three variants: Argon2i, Argon2d, and Argon2id. Argon2i is the best choice for password hashing because it provides resistance against side-channel attacks. Argon2d is faster but less secure, and Argon2id is a hybrid of Argon2i and Argon2d.

```ts 
import * as argon from 'argon2';
import * as crypto from 'crypto';

// Define a class for password hashing and verification
export class PasswordHash {
  // Function to hash data with Argon2 and a pepper
  static async hashData(data: string) {
    // Generate a cryptographically secure random salt
    const salt = crypto.randomBytes(32);

    // Use a pepper for additional security. The pepper is a secret key stored separately from the database.
    // In case the database is compromised, the pepper can prevent an attacker from cracking the passwords.
    const pepper = process.env.PEPPER || 'my-super-secret-pepper';

    // Hash the data with Argon2, using the salt and pepper
    // Argon2 allows for customizable security parameters:
    // - timeCost: computational cost
    // - memoryCost: memory usage
    // - parallelism: number of threads and/or independent memory lanes
    // - type: Argon2 variant (Argon2i, Argon2d, or Argon2id)
    return await argon.hash(data + pepper, {
      salt: salt,
      timeCost: 4, // increase time cost to make it more secure
      memoryCost: 4096, // increase memory cost to make it more secure
      parallelism: 2, // adjust a parallelism factor according to your server's capabilities
      type: argon.argon2id, // use Argon id variant for a balance between security and side-channel attack resistance
    });
  }

  // Function to verify a password with Argon2 and a pepper
  static async verifyPassword(hash: string, password: string) {
    // Use the same pepper as in the hashData function
    const pepper = process.env.PEPPER || 'my-super-secret-pepper';

    // Verify the password with Argon2 and the pepper
    // The password entered by the user is concatenated with the pepper and then compared to the stored hash
    return await argon.verify(hash, password + pepper);
  }
  static async hashRefreshToken(rt: string) {
    // Use the same pepper as in the hashData function
    const pepper = process.env.PEPPER || 'my-super-secret-pepper';

    // Hash the refresh token with Argon2 and the pepper
    return await argon.hash(rt + pepper);
  }
}
```

### 6. Token Service

```ts
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { asyncErrorHandler } from '../../errors/async-error-handler';
import { JwtPayload, Tokens } from '../type';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  getTokens = asyncErrorHandler(async (userId: number, email: string): Promise<Tokens> => {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('JWT_LOCAL_AT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('JWT_LOCAL_RT_SECRET'),
        expiresIn: '15d',
      }),
    ]);
    return {
      access_token: at,
      refresh_token: rt,
    };
  });
}
```
`TokenService` class that is responsible for generating access and refresh tokens for authentication purposes. This class is decorated with `@Injectable()`, indicating that it can be managed by NestJS's dependency injection system.

- `JwtService`: This is a service provided by the `@nestjs/jwt` package. It is used to sign and verify JSON Web Tokens (JWTs).
- `ConfigService`: This is a service provided by the `@nestjs/config` package. It is used to access application configuration settings.
- `asyncErrorHandler`: This is a custom function that handles errors in asynchronous operations.
- `JwtPayload` and `Tokens`: These are custom types defined elsewhere in the application.

The `TokenService` class has a `getTokens` method that generates an access token and a refresh token for a given user ID and email. This method is decorated with `asyncErrorHandler`, which will handle any errors that occur during the token generation process.

The `getTokens` method does the following:

1. It creates a `JwtPayload` object that includes the user ID (`sub`) and email.
2. It uses `Promise.all` to concurrently generate the access token (`at`) and refresh token (`rt`). This is done using the `signAsync` method of `JwtService`, which creates a new JWT with the given payload and options.
    - The access token expires in 15 minutes (`'15m'`).
    - The refresh token expires in 15 days (`'15d'`).
    - The secrets used to sign the tokens are retrieved from the application's configuration using `ConfigService`.
3. It returns an object containing the generated access and refresh tokens.

This service is typically used in authentication processes where the access token is used for authorizing requests, and the refresh token is used to generate a new access token when the old one expires. The use of JWTs allows the server to verify the token's integrity without needing to store session information. This stateless approach scales well because it can handle many requests across multiple servers.

### 7. RtTokenService

```ts
import { Injectable } from '@nestjs/common';
import { asyncErrorHandler } from '../../errors/async-error-handler';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordHash } from './hash.service';
import { ConfigId } from '../../types';

@Injectable()
export class RtTokenService {
  updateRtHash = asyncErrorHandler(async (userId: ConfigId, rt: string): Promise<void> => {
    const hash = await PasswordHash.hashRefreshToken(rt);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshTokenHash: hash,
      },
    });
  });

  constructor(private prisma: PrismaService) {}
}
```

`RtTokenService` class that is responsible for updating the refresh token hash in the database. This class is decorated with `@Injectable()`, indicating that it can be managed by NestJS's dependency injection system.

### 8. AT & RT Strategy

`at.strategy.ts` and `rt.strategy.ts` are the two files that contain the strategy for the access token and refresh token, respectively. These strategies are used to authenticate and validate JWTs in the `@nestjs/passport` module.
```ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../type';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_LOCAL_AT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
```

```ts
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, JwtPayloadWithRt } from '../type';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_LOCAL_RT_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): JwtPayloadWithRt {
    const refreshToken = req?.get('authorization')?.replace('Bearer', '').trim();

    if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

    return {
      ...payload,
      refreshToken,
    };
  }
}

```

 `AtStrategy` and `RtStrategy`, for handling access tokens (AT) and refresh tokens (RT) respectively. These strategies are used to authenticate and validate JSON Web Tokens (JWTs) in the `@nestjs/passport` module.

1. **AtStrategy (Access Token Strategy)**

   - This strategy extends the `PassportStrategy`, which is a part of the `@nestjs/passport` module.
   - The `Strategy` argument passed to `PassportStrategy` is imported from `passport-jwt`. It represents the JWT authentication strategy.
   - The second argument, `'jwt'`, is a string that names the strategy.
   - The `constructor` of `AtStrategy` calls the `super` method with an options object. This object includes:
      - `jwtFromRequest`: A function that extracts the JWT from the request. It uses `ExtractJwt.fromAuthHeaderAsBearerToken()`, which looks for the JWT in the authorization header with the scheme 'bearer'.
      - `secretOrKey`: The secret key used to sign the JWTs. It's retrieved from the application's configuration using `ConfigService`.
   - The `validate` method is used to validate the extracted payload. In this case, it simply returns the payload.

2. **RtStrategy (Refresh Token Strategy)**

   - Similar to `AtStrategy`, this strategy also extends the `PassportStrategy`.
   - The second argument to `PassportStrategy` is `'jwt-refresh'`, which names this strategy.
   - The `constructor` of `RtStrategy` also calls the `super` method with an options object. This object includes:
      - `jwtFromRequest`: Similar to `AtStrategy`, it uses `ExtractJwt.fromAuthHeaderAsBearerToken()`.
      - `secretOrKey`: The secret key used to sign the JWTs. It's retrieved from the application's configuration using `ConfigService`.
      - `passReqToCallback`: A boolean that indicates whether the request should be passed to the `validate` method.
   - The `validate` method in this strategy takes two arguments: the request and the payload. It extracts the refresh token from the authorization header, checks if it exists, and then returns an object that includes the payload and the refresh token.

These strategies are typically used in an authentication system where the access token is short-lived and the refresh token is long-lived. When the access token expires, the refresh token can be used to get a new access token. This allows the user to remain authenticated without needing to log in again. The use of JWTs allows the server to verify the token's integrity without needing to store session information. This stateless approach scales well because it can handle many requests across multiple servers.

### 9. AT & RT Guard

`at.guard.ts` and `rt.guard.ts` are the two files that contain the guard for the access token and refresh token, respectively. These guards are used to protect routes and endpoints in the `@nestjs/passport` module.

`at.guard.ts`
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
`rt.guard.ts`
```ts
import { AuthGuard } from '@nestjs/passport';

export class RtGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }
}
```


1. `at.guard.ts`: This file contains a guard for the access token. The `AtGuard` class extends the `AuthGuard` from the `@nestjs/passport` module with the strategy name 'jwt'. The `canActivate` method is overridden to add custom logic for route protection. If a route is marked as public (using a custom decorator, presumably), the guard will allow access without checking for an access token. Otherwise, it falls back to the default behavior of the 'jwt' strategy.

For this you need to do in `main.ts` 

```ts
app.useGlobalGuards(new AtGuard(new Reflector()));
```

or you can do this `app.module.ts` file

```ts
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
```
> This will apply the `AtGuard` to all routes by default. If a route is marked as public, the guard will allow access without checking for an access token. Otherwise, it will follow the default behavior of the 'jwt' strategy for route protection.


2. `rt.guard.ts`: This file contains a guard for the refresh token. The `RtGuard` class extends the `AuthGuard` from the `@nestjs/passport` module with the strategy name 'jwt-refresh'. There is no custom logic added in this guard, so it will follow the default behavior of the 'jwt-refresh' strategy for route protection.

In both cases, these guards are used to protect routes and endpoints in your NestJS application. When a request is made to a protected route, the guard will check for a valid JWT (access or refresh, depending on the guard) in the request. If a valid token is found, the request is allowed to proceed. If not, the request is denied. This is a common way to implement authenticated routes in a JWT-based authentication system.


### 10. Decorator
These decorators provide a convenient way to access the current user's information in route handlers. Instead of manually extracting the user's information from the request object in each route handler, you can use these decorators to do it in a more declarative and reusable way. For example, in a route handler, you can use `@GetCurrentUser('email')` to get the current user's email, or `@GetCurrentUserId()` to get the current user's ID. This makes the code cleaner and easier to maintain.

#### 10.1 `public.decorator.ts`

```ts
import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata('isPublic', true);
```

This is a custom decorator that marks a route as public. When a route is marked as public, the access token guard will allow access without checking for an access token. This is useful for routes that should be accessible without authentication, such as login and registration endpoints.


#### 10.2 `get-current-user.decorator.ts`
This file defines a custom decorator `GetCurrentUser` that can be used to extract the current user's information from the request object in a route handler. The decorator is created using the `createParamDecorator` function from the `@nestjs/common` module.
    - The decorator takes two parameters: `data` and `ctx`. `data` is a key of `JwtPayloadWithRt` type or `undefined`, and `ctx` is an `ExecutionContext` instance.
    - Inside the decorator, it switches the context to HTTP to get the request object.
    - If `data` is not provided, it returns the `user` object from the request. If `data` is provided, it returns the specific property of the `user` object that matches the `data` key.

```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadWithRt } from '../../type';

export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtPayloadWithRt | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    if (!data) return request.user;
    return request.user[data];
  },
);
```

#### 10.3 `get-current-user-id.decorator.ts`

This file defines a custom decorator `GetCurrentUserId` that can be used to extract the current user's ID (i.e., the `sub` property in the JWT payload) from the request object in a route handler. The decorator is created using the `createParamDecorator` function from the `@nestjs/common` module.
    - The decorator takes two parameters: `_` and `context`. `_` is `undefined`, and `context` is an `ExecutionContext` instance.
    - Inside the decorator, it switches the context to HTTP to get the request object.
    - It then casts the `user` object from the request to `JwtPayload` type and returns the `sub` property, which represents the user's ID.


```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../type';

export const GetCurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    return user.sub;
  },
);

```

### 11. Auth Module

```ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TokenService } from './token';
import { ConfigModule } from '@nestjs/config';
import { AtStrategy, RtStrategy } from './strategies';
import { RtTokenService } from './hash/rt-hash.service';

@Module({
  imports: [JwtModule.register({}), ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, JwtService, AtStrategy, RtStrategy, TokenService, RtTokenService],
})
export class AuthModule {}
```

This is the `AuthModule` class, which is a feature module that encapsulates the authentication-related components of the application. It is decorated with `@Module`, indicating that it is a module for NestJS's dependency injection system.