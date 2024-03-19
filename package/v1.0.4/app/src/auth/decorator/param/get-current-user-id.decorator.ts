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
