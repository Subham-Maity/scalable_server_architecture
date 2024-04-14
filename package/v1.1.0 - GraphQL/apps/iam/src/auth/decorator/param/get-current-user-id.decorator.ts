import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../type';
import { JwtService } from '@nestjs/jwt';
import { ConfigId } from '../../../common/type';

export const GetCurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): ConfigId => {
    const request = context.switchToHttp().getRequest();
    const jwtService = new JwtService({
      secret: process.env.JWT_LOCAL_AT_SECRET,
    });
    const token = request.cookies['access_token'];
    const payload = jwtService.verify<JwtPayload>(token);
    return payload.sub;
  },
);
