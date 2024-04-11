import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SaEmailIpWhitelistConstant {
  private readonly superAdminEmails: string[];
  private readonly superAdminIps: string[];

  constructor(private config: ConfigService) {
    this.superAdminEmails = [
      this.config.get<string>('SUPER_ADMIN_1_EMAIL_1'),
      // Add more as needed
    ];
    this.superAdminIps = [
      this.config.get<string>('SUPER_ADMIN_1_IP_1_1'),
      // this.config.get<string>('SUPER_ADMIN_1_IP_1_2'),
      // this.config.get<string>('SUPER_ADMIN_1_IP_1_3'),
      // this.config.get<string>('SUPER_ADMIN_2_IP_1_1'),
      // Add more as needed
    ];
  }

  getSuperAdminEmails(): string[] {
    return this.superAdminEmails;
  }

  getSuperAdminIps(): string[] {
    return this.superAdminIps;
  }
}
