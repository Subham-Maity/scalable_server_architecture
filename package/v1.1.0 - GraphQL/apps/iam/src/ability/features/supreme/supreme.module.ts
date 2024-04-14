import { Module } from '@nestjs/common';
import { SupremeController } from './supreme.controller';
import { SupremeService } from './supreme.service';
import { SaEmailIpWhitelistConstant } from '../../guard/list';

@Module({
  controllers: [SupremeController],
  providers: [SupremeService, SaEmailIpWhitelistConstant],
})
export class SupremeModule {}
