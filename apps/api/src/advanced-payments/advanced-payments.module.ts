import { Module } from '@nestjs/common';
import { AdvancedPaymentsService } from './advanced-payments.service';
import { AdvancedPaymentsController } from './advanced-payments.controller';

@Module({
  providers: [AdvancedPaymentsService],
  controllers: [AdvancedPaymentsController]
})
export class AdvancedPaymentsModule {}
