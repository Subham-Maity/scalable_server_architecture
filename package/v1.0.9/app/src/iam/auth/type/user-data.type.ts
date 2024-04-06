import { ConfigId } from '../../../types';

export type UserData = {
  id?: ConfigId;
  email: string;
  hash: string;
};
