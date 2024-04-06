import * as argon from 'argon2';
import * as crypto from 'crypto';

export class PasswordHash {
  static async hashData(data: string) {
    const salt = crypto.randomBytes(32);
    const pepper = process.env.PEPPER || 'my-super-secret-pepper';
    return await argon.hash(data + pepper, {
      salt: salt,
      timeCost: 4,
      memoryCost: 4096,
      parallelism: 2,
      type: argon.argon2id,
    });
  }

  static async verifyPassword(hash: string, password: string) {
    const pepper = process.env.PEPPER || 'my-super-secret-pepper';

    return await argon.verify(hash, password + pepper);
  }
  static async hashRefreshToken(rt: string) {
    const pepper = process.env.PEPPER || 'my-super-secret-pepper';

    return await argon.hash(rt + pepper);
  }
}
