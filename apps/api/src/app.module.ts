import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CategoriesModule } from './categories/categories.module';
import { AdvancedPaymentsModule } from './advanced-payments/advanced-payments.module';
import { BalanceModule } from './balance/balance.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ReminderModule } from './reminder/reminder.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SyncModule } from './sync/sync.module';
import { BackupModule } from './backup/backup.module';
import { ExportModule } from './export/export.module';
import { RecurringTransactionsModule } from './recurring-transactions/recurring-transactions.module';
import { CurrencyModule } from './currency/currency.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    UserModule,
    TransactionsModule,
    CategoriesModule,
    AdvancedPaymentsModule,
    BalanceModule,
    AnalyticsModule,
    ReminderModule,
    NotificationsModule,
    SyncModule,
    BackupModule,
    ExportModule,
    RecurringTransactionsModule,
    CurrencyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
