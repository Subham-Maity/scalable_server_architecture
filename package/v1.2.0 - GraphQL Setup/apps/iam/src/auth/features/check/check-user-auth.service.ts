import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RequestWithUserDto } from './dto';
import { ConfigId } from '../../../common/type';

@Injectable()
export class CheckUserAuthService {
  /**Check User*/
  checkUser(req: RequestWithUserDto): { id: ConfigId } {
    if (!req.user || !req.user.sub) {
      throw new UnauthorizedException();
    }
    return { id: req.user.sub };
  }
}
