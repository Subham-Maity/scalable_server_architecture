export type JwtPayload = {
  email: string;
  sub: string;
  roleId: string;
  permissionIds: string[];
};
