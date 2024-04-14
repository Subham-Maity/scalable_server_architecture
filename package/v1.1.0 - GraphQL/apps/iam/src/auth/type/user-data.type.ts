import { ConfigId } from '../../common/type';

export type UserData = {
  id?: ConfigId;
  email: string;
  hash: string;
};
