import { UserTokenDto } from './user-token.dto';

export interface RequestTypeDto extends Request {
  user: UserTokenDto;
}
