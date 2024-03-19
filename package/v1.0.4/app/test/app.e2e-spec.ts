import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { Server } from 'http';

describe('App e2e', () => {
  let app: any;
  let prisma: PrismaService;
  let server: Server;
  request.agent(app);
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    server = app.getHttpServer();

    prisma = app.get(PrismaService);
    await prisma.cleanDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'subham@gmail.com',
      password: '123@Subham78_StrongPass',
    };
    let tokens: any[]; // Define tokens here
    describe('Signup', () => {
      it('should signup', async () => {
        await request(server).post('/auth/local/signup').send(dto).expect(201);
      });
    });
    describe('Signin', () => {
      it('should signin', async () => {
        const res = await request(server).post('/auth/local/signin').send(dto).expect(200);
        const cookies = Array.isArray(res.headers['set-cookie'])
          ? res.headers['set-cookie']
          : [res.headers['set-cookie']];
        tokens = cookies.map((cookie: any) => {
          const [name, token] = cookie.split(';')[0].split('=');
          return { name, token };
        });
        console.log('tokens', tokens);
      });
    });
    describe('should refresh tokens', () => {
      it('should refresh tokens', async () => {
        // wait for 1 second
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 1000);
        });

        const refreshToken = tokens.find((token) => token.name === 'refresh_token');
        console.log('refreshToken', refreshToken);

        return request(server).post('/auth/refresh').auth(refreshToken.token, { type: 'bearer' });
      });
    });
    describe('Logout', () => {
      it('should logout', async () => {
        const accessToken = tokens.find((token: { name: string }) => token.name === 'access_token');
        console.log('accessToken', accessToken);
        await request(server)
          .post('/auth/local/signout')
          .set('Authorization', `Bearer ${accessToken.token}`);
      });
    });
  });
});
