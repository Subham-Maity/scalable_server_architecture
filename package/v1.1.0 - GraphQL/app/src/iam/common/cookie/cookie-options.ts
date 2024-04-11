import { CookieOptions } from 'express';

export const cookieOptionsAt: CookieOptions = {
  expires: new Date(Date.now() + 5 * 60 * 60 * 1000),
  httpOnly: true,
  secure: true,
  sameSite: 'none',
};

export const cookieOptionsRt: CookieOptions = {
  expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  httpOnly: true,
  secure: true,
  sameSite: 'none',
};
