export interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    iat: number;
    exp: number;
  };
}
