import { Module } from '@nestjs/common';
import { RecurringTransactionsController } from './recurring-transactions.controller';
import { RecurringTransactionsService } from './recurring-transactions.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
    imports: [PrismaModule, EventEmitterModule],
    controllers: [RecurringTransactionsController],
    providers: [RecurringTransactionsService],
    exports: [RecurringTransactionsService],
})
export class RecurringTransactionsModule { }
